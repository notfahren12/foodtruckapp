import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { PermitStatus } from '../data/mockCompliance';
import type { DocumentStatus, InspectionStatus, TruckPermitStatus } from '../lib/db';

export type BadgeStatus = PermitStatus | TruckPermitStatus | DocumentStatus | InspectionStatus;

function formatStatusLabel(status: BadgeStatus): string {
  switch (status) {
    case 'Missing':
    case 'missing':
      return 'Not added';
    case 'pending':
      return 'In progress';
    case 'Uploaded':
    case 'current':
      return 'Current';
    case 'Expiring Soon':
    case 'expiring_soon':
      return 'Expires soon';
    case 'expired':
      return 'Expired';
    case 'uploaded':
      return 'Current';
    case 'scheduled':
      return 'Scheduled';
    case 'passed':
      return 'Passed';
    case 'failed':
    case 'needs_reschedule':
    case 'cancelled':
      return 'Needs follow-up';
    default:
      return status;
  }
}

function toneForStatus(status: BadgeStatus): { bg: string; border: string; fg: string } {
  switch (status) {
    case 'Missing':
    case 'missing':
    case 'expired':
    case 'failed':
    case 'needs_reschedule':
    case 'cancelled':
      return { bg: '#FEE2E2', border: '#FECACA', fg: colors.danger };
    case 'Uploaded':
    case 'uploaded':
    case 'pending':
    case 'scheduled':
      return { bg: '#DBEAFE', border: '#BFDBFE', fg: colors.info };
    case 'Expiring Soon':
    case 'expiring_soon':
      return { bg: '#FEF9C3', border: '#FEF08A', fg: colors.warning };
    case 'Current':
    case 'current':
    case 'passed':
      return { bg: '#DCFCE7', border: '#BBF7D0', fg: colors.success };
  }
}

type StatusBadgeProps = {
  status: BadgeStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = toneForStatus(status);

  return (
    <View style={[styles.badge, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <Text style={[styles.label, { color: tone.fg }]}>{formatStatusLabel(status)}</Text>
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
