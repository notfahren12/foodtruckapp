import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

type ProgressCardProps = {
  completed: number;
  total: number;
  label: string;
};

export function ProgressCard({ completed, label, total }: ProgressCardProps) {
  const progress = total === 0 ? 0 : completed / total;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {completed}/{total}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.caption}>Checklist progress stays truck-aware when you switch views.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
  track: {
    height: 10,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    backgroundColor: colors.success,
    borderRadius: 999,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
