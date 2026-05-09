import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { AppCard } from './AppCard';

type MetricCardProps = {
  label: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function MetricCard({ count, icon, label, onPress }: MetricCardProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.pressable}>
      <AppCard>
        <View style={styles.row}>
          <Ionicons name={icon} size={18} color={colors.info} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.count}>{count}</Text>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  count: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
  },
});
