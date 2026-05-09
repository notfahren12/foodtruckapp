import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { createMissingTruckPermitsForTruck, getTruckPermits, TruckPermitRow } from '../../lib/db';
import { RootStackParamList } from '../../navigation/types';

export function PermitsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { trucks } = useAuth();
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [permits, setPermits] = useState<TruckPermitRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTruckId((prev) => {
      if (prev && trucks.some((truck) => truck.id === prev)) return prev;
      return trucks[0]?.id ?? null;
    });
  }, [trucks]);

  useEffect(() => {
    if (selectedTruckId === null) {
      setPermits([]);
      return;
    }
    const truckId = selectedTruckId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const seeded = await createMissingTruckPermitsForTruck(truckId);
        if (seeded.error && !cancelled) {
          setErrorMessage(seeded.error.message);
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
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [selectedTruckId]);

  const truckName = useMemo(
    () => trucks.find((truck) => truck.id === selectedTruckId)?.name ?? 'No truck selected',
    [selectedTruckId, trucks],
  );

  return (
    <Screen>
      <ScreenHeader
        subtitle="Requirements are preliminary and must be verified with official city/county offices."
        title="Permits"
      />

      <AppCard>
        <Text style={styles.currentTruck}>Active truck</Text>
        <Text style={styles.currentTruckName}>{truckName}</Text>
      </AppCard>

      <SectionHeader title="Truck Selector" subtitle="Switch trucks to view permit progress." />
      <View style={styles.chips}>
        {trucks.map((truck) => (
          <Pressable
            key={truck.id}
            onPress={() => setSelectedTruckId(truck.id)}
            style={[styles.chip, truck.id === selectedTruckId && styles.chipActive]}
          >
            <Text style={[styles.chipText, truck.id === selectedTruckId && styles.chipTextActive]}>{truck.name}</Text>
          </Pressable>
        ))}
      </View>

      {!trucks.length ? <Text style={styles.empty}>No trucks found. Complete onboarding first.</Text> : null}
      {loading ? <Text style={styles.empty}>Loading permits...</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {!loading && !errorMessage && trucks.length > 0 && permits.length === 0 ? (
        <Text style={styles.empty}>No permit rows yet for this truck.</Text>
      ) : null}

      <SectionHeader title="Permit Checklist" subtitle="Each item tracks status and expiration." />
      {permits.map((permit) => {
        const requirement = permit.permit_requirements;
        const jurisdiction = requirement?.jurisdictions?.name ?? 'Unassigned jurisdiction';
        const requirementType = requirement?.requirement_type ?? 'other';
        return (
          <AppCard key={permit.id}>
            <View style={styles.cardTop}>
              <View style={styles.titleBlock}>
                <Text style={styles.permitName}>{requirement?.name ?? 'Unknown requirement'}</Text>
                <Text style={styles.jurisdiction}>{jurisdiction}</Text>
                <Text style={styles.requirementType}>Type: {requirementType}</Text>
              </View>
              <StatusBadge status={permit.status} />
            </View>
            <Text style={styles.expiration}>
              {permit.expiration_date ? `Expires: ${permit.expiration_date}` : 'No expiration date set'}
            </Text>
            {permit.notes ? <Text style={styles.notes}>{permit.notes}</Text> : null}
            <AppButton
              title="View Details"
              onPress={() => navigation.navigate('PermitDetail', { permitId: permit.id })}
              variant="outline"
            />
          </AppCard>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  currentTruck: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentTruckName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.info,
    backgroundColor: '#EFF6FF',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.info,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  permitName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  jurisdiction: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  requirementType: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  expiration: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  notes: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
});
