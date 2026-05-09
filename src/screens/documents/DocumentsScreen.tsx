import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import {
  cleanupDuplicateTruckPermitsForTruck,
  createDocument,
  deleteDocument,
  DocumentRow,
  DocumentStatus,
  DocumentType,
  getDocumentsForBusiness,
  getTruckPermits,
  textOrNull,
  TruckPermitRow,
  TruckRow,
  updateDocument,
} from '../../lib/db';
import { formatRelatedPermitLabel } from '../../lib/permitLabels';
import { parseDocumentText, type ParsedDocumentData } from '../../lib/documentParser';
import { extractTextFromImage } from '../../lib/ocr';
import { deleteDocumentFile, getDocumentSignedUrl, uploadDocumentFile } from '../../lib/storage';

const DOCUMENT_TYPE_OPTIONS: DocumentType[] = [
  'business_license',
  'health_permit',
  'fire_inspection',
  'commissary_agreement',
  'insurance',
  'driver_license',
  'vehicle_registration',
  'sales_tax_license',
  'other',
];

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  business_license: 'Business license',
  health_permit: 'Health permit',
  fire_inspection: 'Fire inspection',
  commissary_agreement: 'Commissary agreement',
  insurance: 'Insurance',
  driver_license: 'Driver license',
  vehicle_registration: 'Vehicle registration',
  sales_tax_license: 'Sales tax license',
  other: 'Other',
};

type SelectedLocalFile = {
  uri: string;
  fileName: string;
  mimeType: string | null;
};

type FormState = {
  name: string;
  document_type: DocumentType;
  truck_id: string | null;
  permit_id: string | null;
  permit_number: string;
  issued_date: string;
  expiration_date: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  document_type: 'business_license',
  truck_id: null,
  permit_id: null,
  permit_number: '',
  issued_date: '',
  expiration_date: '',
  notes: '',
};

function statusFromExpiration(expirationDate: string | null): DocumentStatus {
  if (!expirationDate) return 'uploaded';
  const date = new Date(`${expirationDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'uploaded';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = date.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'uploaded';
}

function territoryForDocument(doc: DocumentRow): string {
  return doc.truck_permits?.permit_requirements?.jurisdictions?.name ?? 'Unknown territory';
}

/** Keeps the oldest row per permit_requirement_id (getTruckPermits orders by created_at ascending). */
function dedupePermitsByRequirement(rows: TruckPermitRow[]): TruckPermitRow[] {
  const seen = new Set<string>();
  const out: TruckPermitRow[] = [];
  for (const row of rows) {
    const key = row.permit_requirement_id ?? row.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

function truckSelectLabel(truck: TruckRow): string {
  if (truck.license_plate?.trim()) {
    return `${truck.name} · ${truck.license_plate.trim()}`;
  }
  return truck.name;
}

export function DocumentsScreen() {
  const { business, trucks } = useAuth();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [permitsForSelectedTruck, setPermitsForSelectedTruck] = useState<TruckPermitRow[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingDocument, setEditingDocument] = useState<DocumentRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedLocalFile | null>(null);
  const [selectedTruckFilter, setSelectedTruckFilter] = useState<string>('all');
  const [selectedTerritoryFilter, setSelectedTerritoryFilter] = useState<string>('all');
  const [autoDetected, setAutoDetected] = useState<ParsedDocumentData | null>(null);
  const [showDetectedText, setShowDetectedText] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [picker, setPicker] = useState<null | 'documentType' | 'truck' | 'permit'>(null);
  const [permitSearch, setPermitSearch] = useState('');

  const dedupedPermitsForTruck = useMemo(
    () => dedupePermitsByRequirement(permitsForSelectedTruck),
    [permitsForSelectedTruck],
  );

  const permitsGroupedForPicker = useMemo(() => {
    const q = permitSearch.trim().toLowerCase();
    const filtered = dedupedPermitsForTruck.filter((p) => {
      if (!q) return true;
      const label = formatRelatedPermitLabel(p).toLowerCase();
      const j = (p.permit_requirements?.jurisdictions?.name ?? '').toLowerCase();
      return label.includes(q) || j.includes(q);
    });
    const map = new Map<string, TruckPermitRow[]>();
    for (const p of filtered) {
      const j = p.permit_requirements?.jurisdictions?.name ?? 'Other';
      const list = map.get(j) ?? [];
      list.push(p);
      map.set(j, list);
    }
    const keys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    return keys.map((jurisdiction) => ({
      jurisdiction,
      permits: map.get(jurisdiction)!,
    }));
  }, [dedupedPermitsForTruck, permitSearch]);

  const selectedPermitRow = useMemo(
    () => dedupedPermitsForTruck.find((p) => p.id === form.permit_id) ?? null,
    [dedupedPermitsForTruck, form.permit_id],
  );

  const truckDisplayValue = useMemo(() => {
    if (!form.truck_id) return 'No truck';
    const truck = trucks.find((t) => t.id === form.truck_id);
    return truck ? truckSelectLabel(truck) : 'Unknown truck';
  }, [form.truck_id, trucks]);

  async function refreshDocuments() {
    if (!business?.id) {
      setDocuments([]);
      return;
    }
    const result = await getDocumentsForBusiness(business.id);
    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }
    setDocuments(result.data);
  }

  useEffect(() => {
    void refreshDocuments();
  }, [business?.id]);

  useEffect(() => {
    if (!form.truck_id) {
      setPermitsForSelectedTruck([]);
      setForm((prev) => ({ ...prev, permit_id: null }));
      return;
    }
    let cancelled = false;
    async function loadPermits() {
      const truckId = form.truck_id;
      if (!truckId) return;
      const cleanupResult = await cleanupDuplicateTruckPermitsForTruck(truckId);
      if (cancelled) return;
      if (cleanupResult.error) {
        console.warn('cleanupDuplicateTruckPermitsForTruck:', cleanupResult.error.message);
      }
      const result = await getTruckPermits(truckId);
      if (cancelled) return;
      if (result.error) {
        setErrorMessage(result.error.message);
        setPermitsForSelectedTruck([]);
        return;
      }
      setPermitsForSelectedTruck(result.data);
      setForm((prev) => {
        if (!prev.permit_id) return prev;
        const exists = result.data.some((permit) => permit.id === prev.permit_id);
        return exists ? prev : { ...prev, permit_id: null };
      });
    }
    void loadPermits();
    return () => {
      cancelled = true;
    };
  }, [form.truck_id]);

  const territoryOptions = useMemo(
    () =>
      Array.from(new Set(documents.map((doc) => territoryForDocument(doc)))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const truckPass = selectedTruckFilter === 'all' || doc.truck_id === selectedTruckFilter;
      const territoryPass =
        selectedTerritoryFilter === 'all' || territoryForDocument(doc) === selectedTerritoryFilter;
      return truckPass && territoryPass;
    });
  }, [documents, selectedTerritoryFilter, selectedTruckFilter]);

  const groupedDocuments = useMemo(() => {
    const map = new Map<DocumentType, DocumentRow[]>();
    DOCUMENT_TYPE_OPTIONS.forEach((type) => map.set(type, []));
    filteredDocuments.forEach((doc) => {
      const current = map.get(doc.document_type) ?? [];
      current.push(doc);
      map.set(doc.document_type, current);
    });
    return map;
  }, [filteredDocuments]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingDocument(null);
    setShowForm(false);
    setSelectedFile(null);
    setAutoDetected(null);
    setErrorMessage(null);
    setPicker(null);
    setPermitSearch('');
  }

  function startCreate() {
    setForm({
      ...EMPTY_FORM,
      truck_id: trucks[0]?.id ?? null,
    });
    setEditingDocument(null);
    setShowForm(true);
    setSelectedFile(null);
    setAutoDetected(null);
    setErrorMessage(null);
  }

  function startEdit(document: DocumentRow) {
    setForm({
      name: document.name,
      document_type: document.document_type,
      truck_id: document.truck_id,
      permit_id: document.permit_id,
      permit_number: document.permit_number ?? '',
      issued_date: document.issued_date ?? '',
      expiration_date: document.expiration_date ?? '',
      notes: document.notes ?? '',
    });
    setEditingDocument(document);
    setShowForm(true);
    setSelectedFile(null);
    setAutoDetected(null);
    setErrorMessage(null);
  }

  function applyAutoDetected(result: ParsedDocumentData) {
    setAutoDetected(result);
    setShowDetectedText(false);
    setForm((prev) => ({
      ...prev,
      document_type: (result.documentType as DocumentType | undefined) ?? prev.document_type,
      name: result.name ?? prev.name,
      permit_number: result.permitNumber ?? prev.permit_number,
      issued_date: result.issuedDate ?? prev.issued_date,
      expiration_date: result.expirationDate ?? prev.expiration_date,
      notes: result.businessName
        ? `Auto-detected business: ${result.businessName}. ${prev.notes}`.trim()
        : prev.notes,
    }));
  }

  function isPdfOrDocument(fileName?: string | null, mimeType?: string | null): boolean {
    const lowerName = (fileName ?? '').toLowerCase();
    const lowerMime = (mimeType ?? '').toLowerCase();
    return lowerName.endsWith('.pdf') || lowerMime.includes('pdf');
  }

  async function scanIfImage(args: { uri: string; fileName?: string | null; mimeType?: string | null }) {
    if (isPdfOrDocument(args.fileName, args.mimeType)) {
      Alert.alert('PDF auto-scan coming soon', 'Enter details manually for PDF files.');
      return;
    }
    setScanning(true);
    try {
      const rawText = await extractTextFromImage(args.uri);
      if (!rawText) return;
      const parsed = parseDocumentText(rawText);
      applyAutoDetected(parsed);
    } finally {
      setScanning(false);
    }
  }

  async function pickDocumentFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['image/*', 'application/pdf'],
    });
    if (result.canceled) return;
    const file = result.assets[0];
    if (!file?.uri) return;
    setSelectedFile({
      uri: file.uri,
      fileName: file.name ?? `document-${Date.now()}`,
      mimeType: file.mimeType ?? null,
    });
    await scanIfImage({ uri: file.uri, fileName: file.name, mimeType: file.mimeType ?? null });
  }

  async function pickFromPhotos() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Photo library permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setSelectedFile({
      uri: asset.uri,
      fileName: asset.fileName ?? `photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
    await scanIfImage({
      uri: asset.uri,
      fileName: asset.fileName ?? `photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setSelectedFile({
      uri: asset.uri,
      fileName: asset.fileName ?? `camera-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
    await scanIfImage({
      uri: asset.uri,
      fileName: asset.fileName ?? `camera-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  }

  async function saveDocument() {
    if (!business?.id) {
      setErrorMessage('No business found. Complete onboarding first.');
      return;
    }
    if (!form.name.trim()) {
      setErrorMessage('Document name is required.');
      return;
    }

    const expirationValue = form.expiration_date.trim() || null;
    const status = statusFromExpiration(expirationValue);
    const notes = textOrNull(form.notes);

    setBusy(true);
    setErrorMessage(null);
    try {
      let saved: DocumentRow | null = null;

      if (editingDocument) {
        const updateRes = await updateDocument(editingDocument.id, {
          name: form.name.trim(),
          document_type: form.document_type,
          truck_id: form.truck_id,
          permit_id: form.permit_id,
          permit_number: textOrNull(form.permit_number),
          issued_date: form.issued_date.trim() || null,
          expiration_date: expirationValue,
          status,
          extracted_text: autoDetected?.rawText ?? null,
          extracted_confidence: autoDetected?.confidence ?? null,
          auto_detected: Boolean(autoDetected),
          notes,
        });
        if (updateRes.error || !updateRes.data) {
          setErrorMessage(updateRes.error?.message ?? 'Failed to update document');
          return;
        }
        saved = updateRes.data;
      } else {
        const createRes = await createDocument({
          business_id: business.id,
          truck_id: form.truck_id,
          permit_id: form.permit_id,
          document_type: form.document_type,
          name: form.name.trim(),
          permit_number: textOrNull(form.permit_number),
          issued_date: form.issued_date.trim() || null,
          expiration_date: expirationValue,
          status,
          extracted_text: autoDetected?.rawText ?? null,
          extracted_confidence: autoDetected?.confidence ?? null,
          auto_detected: Boolean(autoDetected),
          notes,
        });
        if (createRes.error || !createRes.data) {
          setErrorMessage(createRes.error?.message ?? 'Failed to create document');
          return;
        }
        saved = createRes.data;
      }

      if (selectedFile && saved) {
        const uploadResult = await uploadDocumentFile({
          businessId: business.id,
          truckId: saved.truck_id,
          documentId: saved.id,
          uri: selectedFile.uri,
          fileName: selectedFile.fileName,
          mimeType: selectedFile.mimeType,
        });
        if (uploadResult.error || !uploadResult.path) {
          setErrorMessage(uploadResult.error?.message ?? 'File upload failed');
          await refreshDocuments();
          return;
        }

        const pathUpdate = await updateDocument(saved.id, {
          file_path: uploadResult.path,
        });
        if (pathUpdate.error) {
          setErrorMessage(pathUpdate.error.message);
          await refreshDocuments();
          return;
        }

        const oldPath = editingDocument?.file_path;
        if (oldPath && oldPath !== uploadResult.path) {
          const removeOld = await deleteDocumentFile(oldPath);
          if (removeOld.error) {
            console.warn('delete old document file:', removeOld.error.message);
          }
        }
      }

      await refreshDocuments();
      resetForm();
    } finally {
      setBusy(false);
    }
  }

  async function removeDocument(document: DocumentRow) {
    setBusy(true);
    setErrorMessage(null);
    try {
      if (document.file_path) {
        const removeFile = await deleteDocumentFile(document.file_path);
        if (removeFile.error) {
          setErrorMessage(removeFile.error.message);
          return;
        }
      }
      const result = await deleteDocument(document.id);
      if (result.error) {
        setErrorMessage(result.error.message);
        return;
      }
      await refreshDocuments();
    } finally {
      setBusy(false);
    }
  }

  async function openDocumentFile(filePath: string) {
    setBusy(true);
    setErrorMessage(null);
    try {
      const result = await getDocumentSignedUrl(filePath);
      if (result.error || !result.url) {
        setErrorMessage(result.error?.message ?? 'Failed to generate file link');
        return;
      }
      const canOpen = await Linking.canOpenURL(result.url);
      if (!canOpen) {
        setErrorMessage('No app available to open this file.');
        return;
      }
      await Linking.openURL(result.url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader subtitle="Verify with local office." title="Documents" />

      {!showForm ? (
        <>
          <SectionHeader title="Truck" />
          <View style={styles.pillWrap}>
            <Pressable
              onPress={() => setSelectedTruckFilter('all')}
              style={[styles.pill, selectedTruckFilter === 'all' && styles.pillActive]}
            >
              <Text style={[styles.pillText, selectedTruckFilter === 'all' && styles.pillTextActive]}>All trucks</Text>
            </Pressable>
            {trucks.map((truck) => (
              <Pressable
                key={truck.id}
                onPress={() => setSelectedTruckFilter(truck.id)}
                style={[styles.pill, selectedTruckFilter === truck.id && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedTruckFilter === truck.id && styles.pillTextActive]}>{truck.name}</Text>
              </Pressable>
            ))}
          </View>

          <SectionHeader title="Territory" />
          <View style={styles.pillWrap}>
            <Pressable
              onPress={() => setSelectedTerritoryFilter('all')}
              style={[styles.pill, selectedTerritoryFilter === 'all' && styles.pillActive]}
            >
              <Text style={[styles.pillText, selectedTerritoryFilter === 'all' && styles.pillTextActive]}>All territories</Text>
            </Pressable>
            {territoryOptions.map((territory) => (
              <Pressable
                key={territory}
                onPress={() => setSelectedTerritoryFilter(territory)}
                style={[styles.pill, selectedTerritoryFilter === territory && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedTerritoryFilter === territory && styles.pillTextActive]}>{territory}</Text>
              </Pressable>
            ))}
          </View>

          <AppButton title="Add Document" onPress={startCreate} />
          <SectionHeader title="Documents" />
        </>
      ) : (
        <AppButton title="Close" onPress={resetForm} variant="outline" />
      )}

      {showForm ? (
        <AppCard title={editingDocument ? 'Edit document' : 'Add document'}>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          {autoDetected ? <Text style={styles.autoDetected}>Auto-detected information</Text> : null}
          {scanning ? <Text style={styles.scanState}>Scanning document…</Text> : null}

          <Field label="Name *">
            <TextInput
              value={form.name}
              onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </Field>

          <SelectRow
            label="Document Type"
            value={DOCUMENT_TYPE_LABELS[form.document_type]}
            onPress={() => setPicker('documentType')}
          />

          <SelectRow label="Truck" value={truckDisplayValue} onPress={() => setPicker('truck')} />

          <SelectRow
            label="Related Permit"
            value={
              !form.truck_id
                ? 'No permit'
                : selectedPermitRow
                  ? formatRelatedPermitLabel(selectedPermitRow)
                  : 'No permit'
            }
            onPress={() => {
              if (!form.truck_id) return;
              setPermitSearch('');
              setPicker('permit');
            }}
            disabled={!form.truck_id}
          />

          <Field label="Expiration date (YYYY-MM-DD)">
            <TextInput
              value={form.expiration_date}
              onChangeText={(value) => setForm((prev) => ({ ...prev, expiration_date: value }))}
              placeholder="2027-05-01"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </Field>

          <Field label="Issued date (YYYY-MM-DD)">
            <TextInput
              value={form.issued_date}
              onChangeText={(value) => setForm((prev) => ({ ...prev, issued_date: value }))}
              placeholder="2026-01-10"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </Field>

          <Field label="Permit / License number">
            <TextInput
              value={form.permit_number}
              onChangeText={(value) => setForm((prev) => ({ ...prev, permit_number: value }))}
              placeholder="Permit number"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </Field>

          <Field label="Notes">
            <TextInput
              value={form.notes}
              onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.notesInput]}
              multiline
            />
          </Field>

          <Field label="File">
            <View style={styles.actionRow}>
              <AppButton title="Upload" onPress={() => void pickDocumentFile()} variant="outline" />
              <AppButton title="Take Photo" onPress={() => void takePhoto()} variant="outline" />
              <AppButton title="Choose Photo" onPress={() => void pickFromPhotos()} variant="outline" />
              {selectedFile ? (
                <Text style={styles.fileSelected}>Selected: {selectedFile.fileName}</Text>
              ) : editingDocument?.file_path ? (
                <Text style={styles.fileSelected}>File attached</Text>
              ) : (
                <Text style={styles.fileSelected}>Not yet uploaded</Text>
              )}
            </View>
          </Field>

          {autoDetected ? (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Preview</Text>
              <Text style={styles.previewLine}>{autoDetected.name ?? form.name ?? 'Document'}</Text>
              <Text style={styles.previewLine}>Permit #: {autoDetected.permitNumber ?? 'Not detected'}</Text>
              <Text style={styles.previewLine}>Issued: {autoDetected.issuedDate ?? 'Not detected'}</Text>
              <Text style={styles.previewLine}>Expires: {autoDetected.expirationDate ?? 'Not detected'}</Text>
              <Text style={styles.previewLine}>Confidence: {Math.round(autoDetected.confidence * 100)}%</Text>
              <Pressable onPress={() => setShowDetectedText((prev) => !prev)} style={styles.detectedTextToggle}>
                <Text style={styles.detectedTextToggleLabel}>Review detected text</Text>
              </Pressable>
              {showDetectedText ? <Text style={styles.detectedTextBody}>{autoDetected.rawText}</Text> : null}
            </View>
          ) : null}

          <AppButton
            title={busy ? (selectedFile ? 'Uploading...' : 'Saving...') : 'Save'}
            onPress={() => void saveDocument()}
            disabled={busy}
          />

          <FormPickerModal
            visible={picker === 'documentType'}
            title="Document Type"
            onClose={() => setPicker(null)}
          >
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {DOCUMENT_TYPE_OPTIONS.map((option) => {
                const selected = form.document_type === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setForm((prev) => ({ ...prev, document_type: option }));
                      setPicker(null);
                    }}
                    style={[styles.modalRow, selected && styles.modalRowSelected]}
                  >
                    <Text style={[styles.modalRowText, selected && styles.modalRowTextSelected]}>
                      {DOCUMENT_TYPE_LABELS[option]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </FormPickerModal>

          <FormPickerModal visible={picker === 'truck'} title="Truck" onClose={() => setPicker(null)}>
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Pressable
                onPress={() => {
                  setForm((prev) => ({ ...prev, truck_id: null, permit_id: null }));
                  setPicker(null);
                }}
                style={[styles.modalRow, form.truck_id === null && styles.modalRowSelected]}
              >
                <Text style={[styles.modalRowText, form.truck_id === null && styles.modalRowTextSelected]}>No truck</Text>
              </Pressable>
              {trucks.map((truck) => {
                const selected = form.truck_id === truck.id;
                return (
                  <Pressable
                    key={truck.id}
                    onPress={() => {
                      setForm((prev) => ({ ...prev, truck_id: truck.id, permit_id: null }));
                      setPicker(null);
                    }}
                    style={[styles.modalRow, selected && styles.modalRowSelected]}
                  >
                    <Text style={[styles.modalRowText, selected && styles.modalRowTextSelected]}>{truckSelectLabel(truck)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </FormPickerModal>

          <FormPickerModal visible={picker === 'permit'} title="Related Permit" onClose={() => setPicker(null)}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <TextInput
                value={permitSearch}
                onChangeText={setPermitSearch}
                placeholder="Search"
                placeholderTextColor={colors.textMuted}
                style={styles.modalSearch}
              />
              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <Pressable
                  onPress={() => {
                    setForm((prev) => ({ ...prev, permit_id: null }));
                    setPicker(null);
                  }}
                  style={[styles.modalRow, form.permit_id === null && styles.modalRowSelected]}
                >
                  <Text style={[styles.modalRowText, form.permit_id === null && styles.modalRowTextSelected]}>No permit</Text>
                </Pressable>
                {permitsGroupedForPicker.map(({ jurisdiction, permits }) => (
                  <View key={jurisdiction}>
                    <Text style={styles.modalSectionTitle}>{jurisdiction}</Text>
                    {permits.map((permit) => {
                      const selected = form.permit_id === permit.id;
                      return (
                        <Pressable
                          key={permit.id}
                          onPress={() => {
                            setForm((prev) => ({ ...prev, permit_id: permit.id }));
                            setPicker(null);
                          }}
                          style={[styles.modalRow, selected && styles.modalRowSelected]}
                        >
                          <Text style={[styles.modalRowText, selected && styles.modalRowTextSelected]} numberOfLines={2}>
                            {formatRelatedPermitLabel(permit)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </KeyboardAvoidingView>
          </FormPickerModal>
        </AppCard>
      ) : null}

      {!showForm && errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {!showForm && filteredDocuments.length > 0
        ? DOCUMENT_TYPE_OPTIONS.map((type) => {
            const rows = groupedDocuments.get(type) ?? [];
            if (!rows.length) return null;
            return (
              <View key={type} style={styles.sectionWrap}>
                <SectionHeader title={DOCUMENT_TYPE_LABELS[type]} />
                {rows.map((doc) => (
                  <AppCard key={doc.id} title={doc.name}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.metaLine}>{territoryForDocument(doc)}</Text>
                      <StatusBadge
                        status={doc.status === 'missing' ? 'not_uploaded' : statusFromExpiration(doc.expiration_date)}
                      />
                    </View>
                    <Text style={styles.metaLine}>Truck: {doc.trucks?.name ?? 'Not assigned'}</Text>
                    <Text style={styles.metaLine}>Expiration: {doc.expiration_date ?? 'Not yet uploaded'}</Text>
                    {doc.permit_number ? <Text style={styles.metaLine}>Permit #: {doc.permit_number}</Text> : null}
                    {doc.file_path ? (
                      <Text style={styles.fileAttached}>File attached</Text>
                    ) : (
                      <Text style={styles.fileSelected}>Not yet uploaded</Text>
                    )}
                    <View style={styles.actionRow}>
                      <AppButton title="Edit" onPress={() => startEdit(doc)} variant="outline" />
                      {doc.file_path ? (
                        <AppButton title="View" onPress={() => void openDocumentFile(doc.file_path!)} variant="outline" />
                      ) : null}
                      <AppButton
                        title="Delete"
                        onPress={() =>
                          Alert.alert('Delete document', 'Delete this document?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => void removeDocument(doc) },
                          ])
                        }
                        variant="ghost"
                      />
                    </View>
                  </AppCard>
                ))}
              </View>
            );
          })
        : null}

      {!showForm && !filteredDocuments.length ? (
        <EmptyState title="No documents added yet." message="Add your first document to get started." />
      ) : null}

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

function SelectRow({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.selectCard, disabled ? styles.selectCardDisabled : null]}
      >
        <Text style={[styles.selectValue, disabled ? styles.selectValueDisabled : null]} numberOfLines={2}>
          {value}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  );
}

function FormPickerModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdropFill} onPress={onClose} accessibilityLabel="Close picker" />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.modalDone}>Done</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function Field({ children, label }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    gap: 8,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  pillActive: {
    borderColor: colors.info,
    backgroundColor: '#EFF6FF',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.info,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLine: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  actionRow: {
    gap: 8,
  },
  fileSelected: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  fileAttached: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
  },
  error: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '700',
  },
  autoDetected: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  scanState: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.info,
  },
  previewCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    gap: 4,
  },
  previewTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  previewLine: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  detectedTextToggle: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  detectedTextToggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.info,
  },
  detectedTextBody: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalBackdropFill: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info,
  },
  modalScroll: {
    maxHeight: 420,
  },
  modalRow: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  modalRowSelected: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: -8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  modalRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalRowTextSelected: {
    color: colors.info,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingTop: 14,
    paddingBottom: 6,
  },
  modalSearch: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 4,
    color: colors.textPrimary,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    gap: 8,
  },
  selectCardDisabled: {
    opacity: 0.45,
  },
  selectValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectValueDisabled: {
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.textMuted,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
