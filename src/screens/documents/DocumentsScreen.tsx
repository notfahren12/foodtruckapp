import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  createDocument,
  deleteDocument,
  DocumentRow,
  DocumentStatus,
  DocumentType,
  getDocumentsForBusiness,
  getTruckPermits,
  textOrNull,
  TruckPermitRow,
  updateDocument,
} from '../../lib/db';
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
  expiration_date: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  document_type: 'business_license',
  truck_id: null,
  permit_id: null,
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

function humanizeDocumentType(type: DocumentType): string {
  return type.replace(/_/g, ' ');
}

export function DocumentsScreen() {
  const { business, trucks } = useAuth();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [permitsForSelectedTruck, setPermitsForSelectedTruck] = useState<TruckPermitRow[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingDocument, setEditingDocument] = useState<DocumentRow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedLocalFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedTruckName = useMemo(() => {
    if (!form.truck_id) return 'No truck';
    return trucks.find((truck) => truck.id === form.truck_id)?.name ?? 'Unknown truck';
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
      const result = await getTruckPermits(form.truck_id as string);
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

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingDocument(null);
    setShowForm(false);
    setSelectedFile(null);
    setErrorMessage(null);
  }

  function startCreate() {
    setForm({
      ...EMPTY_FORM,
      truck_id: trucks[0]?.id ?? null,
    });
    setEditingDocument(null);
    setShowForm(true);
    setSelectedFile(null);
    setErrorMessage(null);
  }

  function startEdit(document: DocumentRow) {
    setForm({
      name: document.name,
      document_type: document.document_type,
      truck_id: document.truck_id,
      permit_id: document.permit_id,
      expiration_date: document.expiration_date ?? '',
      notes: document.notes ?? '',
    });
    setEditingDocument(document);
    setShowForm(true);
    setSelectedFile(null);
    setErrorMessage(null);
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
          expiration_date: expirationValue,
          status,
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
          expiration_date: expirationValue,
          status,
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
      <ScreenHeader subtitle="Metadata and file attachments are now saved to Supabase (private bucket)." title="Documents" />

      <AppButton
        title={showForm ? 'Close Form' : 'Add Document Metadata'}
        onPress={() => (showForm ? resetForm() : startCreate())}
        variant={showForm ? 'outline' : 'primary'}
      />

      {showForm ? (
        <AppCard title={editingDocument ? 'Edit document' : 'New document'}>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <Field label="Name *">
            <TextInput
              value={form.name}
              onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
              placeholder="Health permit packet"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </Field>

          <Field label="Document type">
            <View style={styles.pillWrap}>
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setForm((prev) => ({ ...prev, document_type: option }))}
                  style={[styles.pill, form.document_type === option && styles.pillActive]}
                >
                  <Text style={[styles.pillText, form.document_type === option && styles.pillTextActive]}>
                    {humanizeDocumentType(option)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label={`Truck (optional) • ${selectedTruckName}`}>
            <View style={styles.pillWrap}>
              <Pressable
                onPress={() => setForm((prev) => ({ ...prev, truck_id: null, permit_id: null }))}
                style={[styles.pill, form.truck_id === null && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.truck_id === null && styles.pillTextActive]}>No truck</Text>
              </Pressable>
              {trucks.map((truck) => (
                <Pressable
                  key={truck.id}
                  onPress={() => setForm((prev) => ({ ...prev, truck_id: truck.id, permit_id: null }))}
                  style={[styles.pill, form.truck_id === truck.id && styles.pillActive]}
                >
                  <Text style={[styles.pillText, form.truck_id === truck.id && styles.pillTextActive]}>{truck.name}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Permit (optional)">
            <View style={styles.pillWrap}>
              <Pressable
                onPress={() => setForm((prev) => ({ ...prev, permit_id: null }))}
                style={[styles.pill, form.permit_id === null && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.permit_id === null && styles.pillTextActive]}>No permit</Text>
              </Pressable>
              {permitsForSelectedTruck.map((permit) => (
                <Pressable
                  key={permit.id}
                  onPress={() => setForm((prev) => ({ ...prev, permit_id: permit.id }))}
                  style={[styles.pill, form.permit_id === permit.id && styles.pillActive]}
                >
                  <Text style={[styles.pillText, form.permit_id === permit.id && styles.pillTextActive]}>
                    {permit.permit_requirements?.name ?? 'Unknown permit'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Expiration date (optional, YYYY-MM-DD)">
            <TextInput
              value={form.expiration_date}
              onChangeText={(value) => setForm((prev) => ({ ...prev, expiration_date: value }))}
              placeholder="2027-05-01"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </Field>

          <Field label="Notes (optional)">
            <TextInput
              value={form.notes}
              onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))}
              placeholder="Extra details"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.notesInput]}
              multiline
            />
          </Field>

          <Field label="Attach file (optional)">
            <View style={styles.actionRow}>
              <AppButton title="Upload file" onPress={() => void pickDocumentFile()} variant="outline" />
              <AppButton title="Take photo" onPress={() => void takePhoto()} variant="outline" />
              <AppButton title="Choose from photos" onPress={() => void pickFromPhotos()} variant="outline" />
              {selectedFile ? (
                <Text style={styles.fileSelected}>Selected: {selectedFile.fileName}</Text>
              ) : editingDocument?.file_path ? (
                <Text style={styles.fileSelected}>Current file attached</Text>
              ) : (
                <Text style={styles.fileSelected}>No file selected</Text>
              )}
            </View>
          </Field>

          <AppButton
            title={
              busy
                ? selectedFile
                  ? 'Uploading...'
                  : 'Saving...'
                : editingDocument
                  ? 'Save Changes'
                  : 'Create Document'
            }
            onPress={() => void saveDocument()}
            disabled={busy}
          />
        </AppCard>
      ) : (
        <SectionHeader title="Saved Documents" subtitle="Uploaded metadata and file attachment status." />
      )}

      {!showForm && errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {!showForm && documents.length ? (
        documents.map((doc) => (
          <AppCard
            key={doc.id}
            title={doc.name}
            subtitle="Requirements are preliminary and must be verified with official city/county offices."
          >
            <View style={styles.rowBetween}>
              <Text style={styles.metaLine}>Type: {humanizeDocumentType(doc.document_type)}</Text>
              <StatusBadge status={statusFromExpiration(doc.expiration_date)} />
            </View>
            <Text style={styles.metaLine}>Expiration: {doc.expiration_date ?? 'Not set'}</Text>
            <Text style={styles.metaLine}>Truck: {doc.trucks?.name ?? 'Not attached'}</Text>
            <Text style={styles.metaLine}>
              Permit: {doc.truck_permits?.permit_requirements?.name ?? 'Not attached'}
            </Text>
            {doc.notes ? <Text style={styles.notesText}>{doc.notes}</Text> : null}
            {doc.file_path ? <Text style={styles.fileAttached}>File attached</Text> : <Text style={styles.fileSelected}>No file attached</Text>}
            <View style={styles.actionRow}>
              <AppButton title="Edit" onPress={() => startEdit(doc)} variant="outline" />
              {doc.file_path ? (
                <AppButton title="View file" onPress={() => void openDocumentFile(doc.file_path!)} variant="outline" />
              ) : null}
              <AppButton
                title="Delete"
                onPress={() =>
                  Alert.alert('Delete document', 'Delete this document metadata row?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => void removeDocument(doc) },
                  ])
                }
                variant="ghost"
              />
            </View>
          </AppCard>
        ))
      ) : null}

      {!showForm && !documents.length ? (
        <EmptyState
          title="No document metadata yet"
          message="Add document entries now; files are stored privately in your Supabase documents bucket."
        />
      ) : null}

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
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
  notesText: {
    fontSize: 13,
    color: colors.textSecondary,
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
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
