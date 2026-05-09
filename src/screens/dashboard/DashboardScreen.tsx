import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../components/AppCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { createMissingTruckPermitsForTruck, getTruckPermits, TruckPermitRow } from '../../lib/db';

export function DashboardScreen() {
  const { business, trucks } = useAuth();
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [permits, setPermits] = useState<TruckPermitRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedTruck = useMemo(
    () => (selectedTruckId ? trucks.find((t) => t.id === selectedTruckId) : null),
    [selectedTruckId, trucks],
  );

  useEffect(() => {
    setSelectedTruckId((previous) => {
      if (previous && trucks.some((t) => t.id === previous)) {
        return previous;
      }
      return trucks[0]?.id ?? null;
    });
  }, [trucks]);

  const locationLine =
    business?.city || business?.county
      ? [business.city, business.county].filter(Boolean).join(' • ')
      : 'Add city and county in business profile';

  const truckHeading = selectedTruck?.name ?? trucks[0]?.name ?? 'Your truck';

  useEffect(() => {
    const maybeTruckId = selectedTruck?.id ?? trucks[0]?.id;
    if (!maybeTruckId) {
      setPermits([]);
      return;
    }
    const truckId: string = maybeTruckId;

    let cancelled = false;
    async function loadPermits() {
      setBusy(true);
      setErrorMessage(null);
      try {
        const seeded = await createMissingTruckPermitsForTruck(truckId);
        if (seeded.error) {
          if (!cancelled) setErrorMessage(seeded.error.message);
        }
        const result = await getTruckPermits(truckId);
        if (cancelled) return;
        if (result.error) {
          setErrorMessage(result.error.message);
          setPermits([]);
          return;
        }
        setPermits(result.data);
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    }

    void loadPermits();
    return () => {
      cancelled = true;
    };
  }, [selectedTruck?.id, trucks]);

  const permitSummary = useMemo(() => {
    const total = permits.length;
    const missing = permits.filter((p) => p.status === 'missing').length;
    const current = permits.filter((p) => p.status === 'current').length;
    const expired = permits.filter((p) => p.status === 'expired').length;
    const expiringSoon = permits.filter((p) => p.status === 'expiring_soon').length;
    return { total, missing, current, expired, expiringSoon };
  }, [permits]);

  return (
    <Screen>
      <ScreenHeader
        subtitle={[business?.name ?? 'Your business', locationLine].filter(Boolean).join(' • ')}
        title="Dashboard"
      />

      {(business?.name || trucks.length > 0) && (
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Fleet snapshot</Text>
          <Text style={styles.summaryTitle}>{business?.name ?? 'Business'}</Text>
          <Text style={styles.summaryMeta}>
            {truckHeading} {trucks.length > 1 ? `• ${trucks.length} trucks` : ''}
          </Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>Selected truck</Text>
      <View style={styles.truckRow}>
        {trucks.map((truck) => (
          <Pressable
            key={truck.id}
            onPress={() => setSelectedTruckId(truck.id)}
            style={[styles.truckChip, selectedTruckId === truck.id && styles.truckChipActive]}
          >
            <Text style={[styles.truckChipText, selectedTruckId === truck.id && styles.truckChipTextActive]}>{truck.name}</Text>
          </Pressable>
        ))}
      </View>

      {!trucks.length ? (
        <Text style={styles.helper}>No trucks found for this business. Add one from Trucks in Settings.</Text>
      ) : (
        <Text style={styles.helper}>
          Showing {business?.city ? `${business.city}` : 'your'} focus truck:{' '}
          {(selectedTruck ?? trucks[0])?.name ?? '—'}.
          {trucks.length > 1 ? ' Tap to switch trucks (display only).' : ''}
        </Text>
      )}

      <AppCard
        subtitle="Requirements are preliminary and must be verified with official city/county offices."
        title="Permit checklist summary"
      >
        {busy ? (
          <Text style={styles.meta}>Loading permit summary...</Text>
        ) : errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (
          <>
            <Text style={styles.meta}>Total permits: {permitSummary.total}</Text>
            <Text style={styles.meta}>Missing: {permitSummary.missing}</Text>
            <Text style={styles.meta}>Current: {permitSummary.current}</Text>
            <Text style={styles.meta}>Expired: {permitSummary.expired}</Text>
            <Text style={styles.meta}>Expiring soon: {permitSummary.expiringSoon}</Text>
          </>
        )}
      </AppCard>

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceAlt,
    gap: 4,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  truckRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  truckChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  truckChipActive: {
    borderColor: colors.info,
    backgroundColor: '#EFF6FF',
  },
  truckChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  truckChipTextActive: {
    color: colors.info,
  },
  helper: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -8,
  },
  meta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
