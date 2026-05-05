import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { getStatusTone } from '../../lib/compliance';
import { DocumentStatus, RequirementStatus } from '../../types/models';

type StatusBadgeProps = {
  status: RequirementStatus | DocumentStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = getStatusTone(status);

  return (
    <View style={[styles.badge, { backgroundColor: `${tone}1A`, borderColor: `${tone}55` }]}>
      <Text style={[styles.label, { color: tone }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
