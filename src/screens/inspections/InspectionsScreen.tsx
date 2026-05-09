import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../components/AppCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import {
  MOCK_INSPECTION_CHECKLISTS,
  MOCK_UPCOMING_INSPECTIONS,
  type InspectionType,
} from '../../data/mockCompliance';

const INSPECTION_ORDER: InspectionType[] = ['Health', 'Fire', 'City vending', 'County requirement'];

export function InspectionsScreen() {
  return (
    <Screen>
      <ScreenHeader subtitle="Scheduling integrations arrive later; dates below are sample placeholders." title="Inspections" />

      <Text style={styles.sectionLabel}>Upcoming inspections</Text>
      {MOCK_UPCOMING_INSPECTIONS.map((item) => (
        <AppCard key={item.id} subtitle={`${item.jurisdiction} • ${item.type}`} title={item.title}>
          <Text style={styles.date}>{item.dateLabel}</Text>
        </AppCard>
      ))}

      <Text style={styles.sectionLabel}>Checklists by type</Text>
      {INSPECTION_ORDER.map((type) => (
        <AppCard key={type} title={type}>
          <View style={styles.list}>
            {MOCK_INSPECTION_CHECKLISTS[type].map((line) => (
              <Text key={line} style={styles.line}>
                • {line}
              </Text>
            ))}
          </View>
        </AppCard>
      ))}

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
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
  },
  list: {
    gap: 8,
  },
  line: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
