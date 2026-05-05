import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatDate } from '../../lib/dates';
import { Requirement } from '../../types/models';
import { StatusBadge } from '../ui/StatusBadge';

type RequirementRowProps = {
  requirement: Requirement;
  onPress: () => void;
  truckLabel?: string;
};

export function RequirementRow({ onPress, requirement, truckLabel }: RequirementRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{requirement.title}</Text>
        <Text style={styles.meta}>
          {requirement.category} • {truckLabel ?? requirement.appliesTo} • {formatDate(requirement.dueDate ?? requirement.expirationDate)}
        </Text>
      </View>
      <View style={styles.trailing}>
        <StatusBadge status={requirement.status} />
        <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  copy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 10,
  },
});
