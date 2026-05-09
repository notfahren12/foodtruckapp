import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { StatusBadge, type BadgeStatus } from './StatusBadge';

type PriorityTaskCardProps = {
  title: string;
  typeLabel: string;
  dateLabel?: string;
  status: BadgeStatus;
};

export function PriorityTaskCard({ dateLabel, status, title, typeLabel }: PriorityTaskCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <StatusBadge status={status} />
      </View>
      <View style={styles.metaRow}>
        <View style={styles.typePill}>
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
        {dateLabel ? <Text style={styles.date}>{dateLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typePill: {
    borderRadius: 999,
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.info,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
