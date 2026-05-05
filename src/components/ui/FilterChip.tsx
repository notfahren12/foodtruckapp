import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/colors';

type FilterChipProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

export function FilterChip({ active, label, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.textPrimary,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
