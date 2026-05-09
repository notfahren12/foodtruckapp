import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '../../components/MetricCard';
import { PriorityTaskCard } from '../../components/PriorityTaskCard';
import { ReadinessScoreCard } from '../../components/ReadinessScoreCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import {
  createMissingTruckPermitsForTruck,
  DocumentRow,
  getDocumentsForTruck,
  getInspectionsForTruck,
  getTruckPermits,
  InspectionRow,
  TruckPermitRow,
} from '../../lib/db';

type PriorityTask = {
  id: string;
  title: string;
  typeLabel: string;
  dateLabel?: string;
  status: 'missing' | 'uploaded' | 'expiring_soon' | 'expired' | 'current';
  sortWeight: number;
};

function formatDateLabel(value: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString();
}

function normalizeDocumentStatus(document: DocumentRow): 'missing' | 'uploaded' | 'expiring_soon' | 'expired' {
  if (!document.expiration_date) return 'uploaded';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(`${document.expiration_date}T00:00:00`);
  if (Number.isNaN(exp.getTime())) return 'uploaded';
  const diffDays = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'uploaded';
}

function inspectionScore(status: InspectionRow['status']): number {
  switch (status) {
    case 'passed':
      return 1;
    case 'scheduled':
      return 0.75;
    case 'needs_reschedule':
      return 0.25;
    case 'failed':
      return 0;
    case 'cancelled':
      return 0.3;
    default:
      return 0.5;
  }
}

function permitScore(status: TruckPermitRow['status']): number {
  switch (status) {
    case 'current':
      return 1;
    case 'pending':
      return 0.65;
    case 'expiring_soon':
      return 0.5;
    case 'missing':
      return 0;
    case 'expired':
      return 0;
    default:
      return 0.4;
  }
}

function documentScore(status: 'missing' | 'uploaded' | 'expiring_soon' | 'expired'): number {
  switch (status) {
    case 'uploaded':
      return 1;
    case 'expiring_soon':
      return 0.6;
    case 'expired':
      return 0;
    case 'missing':
      return 0;
    default:
      return 0.5;
  }
}

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { business, trucks } = useAuth();
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [permits, setPermits] = useState<TruckPermitRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedTruck = useMemo(
    () => (selectedTruckId ? trucks.find((truck) => truck.id === selectedTruckId) : null),
    [selectedTruckId, trucks],
  );

  useEffect(() => {
    setSelectedTruckId((previous) => {
      if (previous && trucks.some((truck) => truck.id === previous)) return previous;
      return trucks[0]?.id ?? null;
    });
  }, [trucks]);

  useEffect(() => {
    const maybeTruckId = selectedTruck?.id ?? trucks[0]?.id;
    if (!maybeTruckId) {
      setPermits([]);
      setDocuments([]);
      setInspections([]);
      return;
    }

    const truckId = maybeTruckId;
    let cancelled = false;
    async function loadDashboardData() {
      setBusy(true);
      setErrorMessage(null);
      try {
        await createMissingTruckPermitsForTruck(truckId);
        const [permitsResult, documentsResult, inspectionsResult] = await Promise.all([
          getTruckPermits(truckId),
          getDocumentsForTruck(truckId),
          getInspectionsForTruck(truckId),
        ]);
        if (cancelled) return;

        if (permitsResult.error || documentsResult.error || inspectionsResult.error) {
          setErrorMessage(
            permitsResult.error?.message ??
              documentsResult.error?.message ??
              inspectionsResult.error?.message ??
              'Failed to load dashboard data.',
          );
          setPermits([]);
          setDocuments([]);
          setInspections([]);
          return;
        }

        setPermits(permitsResult.data);
        setDocuments(documentsResult.data);
        setInspections(inspectionsResult.data);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, [selectedTruck?.id, trucks]);

  const locationLine = business?.city || business?.county ? [business.city, business.county].filter(Boolean).join(' • ') : 'Verify with local office';

  const metrics = useMemo(() => {
    const normalizedDocuments = documents.map((document) => ({
      ...document,
      computedStatus: normalizeDocumentStatus(document),
    }));
    const missingPermits = permits.filter((permit) => permit.status === 'missing').length;
    const expiringSoon =
      permits.filter((permit) => permit.status === 'expiring_soon').length +
      normalizedDocuments.filter((document) => document.computedStatus === 'expiring_soon').length;
    const uploadedDocuments = normalizedDocuments.filter((document) => document.computedStatus === 'uploaded').length;
    const upcomingInspections = inspections.filter((inspection) => inspection.status === 'scheduled').length;
    return {
      normalizedDocuments,
      missingPermits,
      expiringSoon,
      uploadedDocuments,
      upcomingInspections,
    };
  }, [documents, inspections, permits]);

  const readinessScore = useMemo(() => {
    const permitValues = permits.map((permit) => permitScore(permit.status));
    const documentValues = metrics.normalizedDocuments.map((document) => documentScore(document.computedStatus));
    const inspectionValues = inspections.map((inspection) => inspectionScore(inspection.status));

    const buckets = [permitValues, documentValues, inspectionValues].filter((bucket) => bucket.length > 0);
    if (!buckets.length) return 82;

    const bucketAverage = buckets
      .map((bucket) => bucket.reduce((sum, value) => sum + value, 0) / bucket.length)
      .reduce((sum, value) => sum + value, 0) / buckets.length;

    return Math.round(bucketAverage * 100);
  }, [inspections, metrics.normalizedDocuments, permits]);

  const priorityTasks = useMemo(() => {
    const tasks: PriorityTask[] = [];

    permits.forEach((permit) => {
      const permitName = permit.permit_requirements?.name ?? 'Permit requirement';
      if (permit.status === 'expired') {
        tasks.push({
          id: `permit-expired-${permit.id}`,
          title: `${permitName} expired`,
          typeLabel: 'Permit',
          dateLabel: formatDateLabel(permit.expiration_date),
          status: 'expired',
          sortWeight: 1,
        });
      } else if (permit.status === 'missing') {
        tasks.push({
          id: `permit-missing-${permit.id}`,
          title: `${permitName} missing`,
          typeLabel: 'Permit',
          dateLabel: formatDateLabel(permit.expiration_date),
          status: 'missing',
          sortWeight: 2,
        });
      }
    });

    metrics.normalizedDocuments.forEach((document) => {
      if (document.computedStatus === 'expired') {
        tasks.push({
          id: `document-expired-${document.id}`,
          title: `${document.name} expired`,
          typeLabel: 'Document',
          dateLabel: formatDateLabel(document.expiration_date),
          status: 'expired',
          sortWeight: 3,
        });
      } else if (document.computedStatus === 'expiring_soon') {
        tasks.push({
          id: `document-expiring-${document.id}`,
          title: `${document.name} expiring soon`,
          typeLabel: 'Document',
          dateLabel: formatDateLabel(document.expiration_date),
          status: 'expiring_soon',
          sortWeight: 4,
        });
      }
    });

    inspections
      .filter((inspection) => inspection.status === 'scheduled')
      .forEach((inspection) => {
        tasks.push({
          id: `inspection-${inspection.id}`,
          title: `${inspection.inspection_type.toUpperCase()} inspection upcoming`,
          typeLabel: 'Inspection',
          dateLabel: formatDateLabel(inspection.scheduled_date),
          status: 'current',
          sortWeight: 5,
        });
      });

    return tasks.sort((a, b) => a.sortWeight - b.sortWeight).slice(0, 7);
  }, [inspections, metrics.normalizedDocuments, permits]);

  return (
    <Screen>
      <ScreenHeader
        title={business?.name ?? 'Dashboard'}
        subtitle={`${selectedTruck?.name ?? trucks[0]?.name ?? 'No truck selected'} • ${locationLine}`}
        rightAccessory={
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        }
      />

      <ReadinessScoreCard score={readinessScore} />

      <View style={styles.truckPicker}>
        <View style={styles.truckAvatar}>
          <Ionicons name="camera-outline" size={16} color={colors.textMuted} />
        </View>
        <View style={styles.truckMeta}>
          <Text style={styles.truckName}>{selectedTruck?.name ?? trucks[0]?.name ?? 'No truck selected'}</Text>
          <Text style={styles.truckPlate}>{selectedTruck?.license_plate ?? trucks[0]?.license_plate ?? 'Plate not added'}</Text>
        </View>
      </View>

      {trucks.length > 1 ? (
        <View style={styles.truckRow}>
          {trucks.map((truck) => (
            <Pressable
              key={truck.id}
              onPress={() => setSelectedTruckId(truck.id)}
              style={[styles.truckChip, selectedTruck?.id === truck.id && styles.truckChipActive]}
            >
              <Text style={[styles.truckChipText, selectedTruck?.id === truck.id && styles.truckChipTextActive]}>
                {truck.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <SectionHeader title="Quick Actions" />
      <View style={styles.metricGrid}>
        <MetricCard
          label="Missing Permits"
          count={metrics.missingPermits}
          icon="alert-circle-outline"
          onPress={() => navigation.navigate('Permits')}
        />
        <MetricCard
          label="Expiring Soon"
          count={metrics.expiringSoon}
          icon="time-outline"
          onPress={() => navigation.navigate('Permits')}
        />
        <MetricCard
          label="Documents"
          count={metrics.uploadedDocuments}
          icon="folder-open-outline"
          onPress={() => navigation.navigate('Documents')}
        />
        <MetricCard
          label="Inspections"
          count={metrics.upcomingInspections}
          icon="shield-checkmark-outline"
          onPress={() => navigation.navigate('Inspections')}
        />
      </View>

      <SectionHeader title="Priority Tasks" />
      {busy ? <Text style={styles.helper}>Loading dashboard insights...</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {!busy && !errorMessage && !priorityTasks.length ? (
        <Text style={styles.helper}>No urgent tasks right now. Keep documents and permits current.</Text>
      ) : null}
      {!busy && !errorMessage
        ? priorityTasks.map((task) => (
            <PriorityTaskCard
              key={task.id}
              title={task.title}
              typeLabel={task.typeLabel}
              dateLabel={task.dateLabel}
              status={task.status}
            />
          ))
        : null}

    </Screen>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  truckRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  truckPicker: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  truckAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  truckMeta: {
    gap: 2,
  },
  truckName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  truckPlate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
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
    fontWeight: '700',
    color: colors.textSecondary,
  },
  truckChipTextActive: {
    color: colors.info,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  helper: {
    fontSize: 13,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '700',
  },
});
