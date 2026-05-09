import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

type HealthBarProps = {
  value: number;
};

function barColor(value: number): string {
  if (value >= 90) return colors.success;
  if (value >= 70) return '#0891B2';
  if (value >= 40) return colors.warning;
  return colors.danger;
}

export function HealthBar({ value }: HealthBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: barColor(clamped) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 14,
    borderRadius: 999,
    backgroundColor: '#E6EBF0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
