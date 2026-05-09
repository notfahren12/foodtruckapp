import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { AppCard } from './AppCard';
import { HealthBar } from './HealthBar';

type ReadinessScoreCardProps = {
  score: number;
};

function scoreStatus(score: number): string {
  if (score >= 90) return 'Ready';
  if (score >= 70) return 'Needs Attention';
  if (score >= 40) return 'At Risk';
  return 'Not Ready';
}

export function ReadinessScoreCard({ score }: ReadinessScoreCardProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <AppCard
      title="Readiness Score"
      subtitle="Based on permits, documents, inspections, and upcoming expirations."
    >
      <View style={styles.row}>
        <Text style={styles.score}>{clamped}%</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{scoreStatus(clamped)}</Text>
        </View>
      </View>
      <HealthBar value={clamped} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  score: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  statusPill: {
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
});
