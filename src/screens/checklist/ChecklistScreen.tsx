import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProgressCard } from '../../components/cards/ProgressCard';
import { RequirementRow } from '../../components/lists/RequirementRow';
import { FilterChip } from '../../components/ui/FilterChip';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TruckSwitcher } from '../../components/ui/TruckSwitcher';
import { colors } from '../../constants/colors';
import { checklistSegments } from '../../constants/statuses';
import { useAppState } from '../../core/AppProvider';

const segmentCategoryMap = {
  Startup: ['Startup', 'City License', 'Commissary', 'Tax/Revenue', 'Vehicle'],
  'Fire Inspection': ['Fire Inspection', 'Equipment'],
  'Health Inspection': ['Health Inspection', 'County Requirement'],
  Renewal: ['Renewal', 'Insurance'],
  Event: ['Event'],
} as const;

export function ChecklistScreen() {
  const navigation = useNavigation<any>();
  const { data, scopedRequirements, selectedTruckId, setSelectedTruckId } = useAppState();
  const [segment, setSegment] = useState<(typeof checklistSegments)[number]>('Startup');

  const filteredRequirements = scopedRequirements.filter((requirement) =>
    segmentCategoryMap[segment].includes(requirement.category as never),
  );
  const completed = filteredRequirements.filter((item) => item.status === 'Valid' || item.status === 'Complete').length;

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Checklist</Text>
        <Text style={styles.subtitle}>Startup, inspection, renewal, and event tasks stay grouped by scope and status.</Text>
        <TruckSwitcher
          onSelect={setSelectedTruckId}
          selectedTruckId={selectedTruckId}
          trucks={data.trucks}
        />
      </View>

      <View style={styles.segmentRow}>
        {checklistSegments.map((item) => (
          <FilterChip key={item} active={item === segment} label={item} onPress={() => setSegment(item)} />
        ))}
      </View>

      <ProgressCard completed={completed} label={`${segment} progress`} total={filteredRequirements.length} />

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Assistant Tip</Text>
        <Text style={styles.tipBody}>
          Start with anything marked missing, reinspection needed, or expiring soon. Those usually have the biggest score impact.
        </Text>
      </View>

      <SectionHeader title={`${segment} Requirements`} caption="Tap any row for detail, documents, and scheduling actions." />
      {filteredRequirements.map((requirement) => (
        <RequirementRow
          key={requirement.id}
          onPress={() => navigation.navigate('RequirementDetail', { requirementId: requirement.id })}
          requirement={requirement}
          truckLabel={data.trucks.find((truck) => truck.id === requirement.truckId)?.name}
        />
      ))}

      {!filteredRequirements.length ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No requirements in this segment for the current truck scope.</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  tipTitle: {
    color: colors.info,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tipBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
