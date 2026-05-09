import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { PermitStatus } from '../data/mockCompliance';

function toneForStatus(status: PermitStatus): { bg: string; border: string; fg: string } {
  switch (status) {
    case 'Missing':
      return { bg: '#FEE2E2', border: '#FECACA', fg: colors.danger };
    case 'Uploaded':
      return { bg: '#DBEAFE', border: '#BFDBFE', fg: colors.info };
    case 'Expiring Soon':
      return { bg: '#FEF9C3', border: '#FEF08A', fg: colors.warning };
    case 'Current':
      return { bg: '#DCFCE7', border: '#BBF7D0', fg: colors.success };
  }
}

type StatusBadgeProps = {
  status: PermitStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = toneForStatus(status);

  return (
    <View style={[styles.badge, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <Text style={[styles.label, { color: tone.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
