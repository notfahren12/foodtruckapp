import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../components/AppCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_TRUCKS,
} from '../../data/mockCompliance';
import { useAppState } from '../../core/AppProvider';

export function DashboardScreen() {
  const { businessProfile, selectedTruckId, setSelectedTruckId } = useAppState();

  return (
    <Screen>
      <ScreenHeader
        subtitle={
          businessProfile?.businessName
            ? `${businessProfile.businessName} • Central Alabama`
            : 'Food Truck Permit Tracker'
        }
        title="Dashboard"
      />

      <Text style={styles.sectionLabel}>Selected truck</Text>
      <View style={styles.truckRow}>
        <Pressable
          onPress={() => setSelectedTruckId(null)}
          style={[styles.truckChip, selectedTruckId === null && styles.truckChipActive]}
        >
          <Text style={[styles.truckChipText, selectedTruckId === null && styles.truckChipTextActive]}>All trucks</Text>
        </Pressable>
        {MOCK_TRUCKS.map((truck) => (
          <Pressable
            key={truck.id}
            onPress={() => setSelectedTruckId(truck.id)}
            style={[styles.truckChip, selectedTruckId === truck.id && styles.truckChipActive]}
          >
            <Text style={[styles.truckChipText, selectedTruckId === truck.id && styles.truckChipTextActive]}>{truck.name}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.helper}>Dropdown behavior will replace these chips in a later release.</Text>

      <AppCard subtitle={MOCK_DASHBOARD_SUMMARY.complianceDetail} title={MOCK_DASHBOARD_SUMMARY.complianceHeadline}>
        <Text style={styles.meta}>Compliance status • placeholder summary</Text>
      </AppCard>

      <AppCard subtitle={MOCK_DASHBOARD_SUMMARY.expiringSoonDetail} title={MOCK_DASHBOARD_SUMMARY.expiringSoonHeadline}>
        <Text style={styles.meta}>Renewals • placeholder</Text>
      </AppCard>

      <AppCard subtitle={MOCK_DASHBOARD_SUMMARY.missingDocsDetail} title={MOCK_DASHBOARD_SUMMARY.missingDocsHeadline}>
        <Text style={styles.meta}>Upload queue • placeholder</Text>
      </AppCard>

      <AppCard subtitle={MOCK_DASHBOARD_SUMMARY.upcomingInspectionsDetail} title={MOCK_DASHBOARD_SUMMARY.upcomingInspectionsHeadline}>
        <Text style={styles.meta}>Inspection queue • placeholder</Text>
      </AppCard>

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
