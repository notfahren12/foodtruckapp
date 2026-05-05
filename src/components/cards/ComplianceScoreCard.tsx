import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '../../constants/colors';
import { ComplianceBreakdown } from '../../lib/compliance';

type ComplianceScoreCardProps = {
  subtitle: string;
  breakdown: ComplianceBreakdown;
};

export function ComplianceScoreCard({ breakdown, subtitle }: ComplianceScoreCardProps) {
  const tone = breakdown.score >= 85 ? colors.success : breakdown.score >= 70 ? colors.warning : colors.danger;

  return (
    <LinearGradient colors={gradients.card} style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Compliance Score</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.scoreBubble, { borderColor: `${tone}55`, backgroundColor: `${tone}1A` }]}>
          <Text style={[styles.scoreValue, { color: tone }]}>{breakdown.score}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <Metric label="Missing" value={breakdown.missingItems} />
        <Metric label="Overdue" value={breakdown.overdueItems} />
        <Metric label="Due Soon" value={breakdown.expiringSoonItems} />
        <Metric label="Unknown" value={breakdown.unknownItems} />
        <Metric label="Failed" value={breakdown.failedItems} />
        <Metric label="Valid" value={breakdown.validItems} />
      </View>
    </LinearGradient>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  scoreBubble: {
    width: 78,
    height: 78,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metric: {
    width: '30%',
    minWidth: 84,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 4,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
