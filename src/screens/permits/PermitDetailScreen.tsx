import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { getTruckPermitById, TruckPermitStatus, updateTruckPermit } from '../../lib/db';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PermitDetail'>;

export function PermitDetailScreen({ navigation, route }: Props) {
  const permitId = route.params.permitId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [title, setTitle] = useState('Permit');
  const [subtitle, setSubtitle] = useState('Loading...');
  const [status, setStatus] = useState<TruckPermitStatus>('missing');
  const [issuedDate, setIssuedDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErrorMessage(null);
      const result = await getTruckPermitById(permitId);
      if (cancelled) return;
      if (result.error || !result.data) {
        setErrorMessage(result.error?.message ?? 'Permit not found');
        setLoading(false);
        return;
      }
      const item = result.data;
      setTitle(item.permit_requirements?.name ?? 'Permit requirement');
      const jurisdiction = item.permit_requirements?.jurisdictions?.name ?? 'Unknown jurisdiction';
      setSubtitle(`${jurisdiction} • ${item.permit_requirements?.requirement_type ?? 'other'}`);
      setStatus(item.status);
      setIssuedDate(item.issued_date ?? '');
      setExpirationDate(item.expiration_date ?? '');
      setPermitNumber(item.permit_number ?? '');
      setNotes(item.notes ?? '');
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [permitId]);

  async function handleSave() {
    setSaving(true);
    setErrorMessage(null);
    const result = await updateTruckPermit(permitId, {
      status,
      issued_date: issuedDate.trim() || null,
      expiration_date: expirationDate.trim() || null,
      permit_number: permitNumber.trim() || null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (result.error || !result.data) {
      setErrorMessage(result.error?.message ?? 'Failed to save permit');
      return;
    }
    navigation.goBack();
  }

  if (loading) {
    return (
      <Screen>
        <ScreenHeader subtitle="Loading permit details..." title="Permit" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader subtitle={subtitle} title={title} />

      <View style={styles.row}>
        <StatusBadge status={status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusGrid}>
          {(['missing', 'pending', 'current', 'expiring_soon', 'expired'] as TruckPermitStatus[]).map((option) => (
            <AppButton
              key={option}
              title={option.replace('_', ' ')}
              onPress={() => setStatus(option)}
              variant={status === option ? 'primary' : 'outline'}
            />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Issued date (YYYY-MM-DD)</Text>
        <TextInput
          value={issuedDate}
          onChangeText={setIssuedDate}
          placeholder="2026-05-01"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Expiration date (YYYY-MM-DD)</Text>
        <TextInput
          value={expirationDate}
          onChangeText={setExpirationDate}
          placeholder="2027-05-01"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Permit number</Text>
        <TextInput
          value={permitNumber}
          onChangeText={setPermitNumber}
          placeholder="Optional"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.notes]}
          multiline
        />
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <AppButton title="Cancel" onPress={() => navigation.goBack()} variant="outline" />
        <AppButton title={saving ? 'Saving...' : 'Save'} onPress={() => void handleSave()} disabled={saving} />
      </View>

      <View style={styles.card}>
        <Text style={styles.body}>
          Requirements are preliminary and must be verified with official city/county offices.
        </Text>
      </View>

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 8,
  },
  statusGrid: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  notes: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  actions: {
    gap: 10,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
