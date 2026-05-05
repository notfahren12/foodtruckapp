import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatDateTime } from '../../lib/dates';
import { EventRecord } from '../../types/models';
import { StatusBadge } from '../ui/StatusBadge';

type EventRowProps = {
  event: EventRecord;
  onPress: () => void;
};

export function EventRow({ event, onPress }: EventRowProps) {
  const eventStatus = event.status === 'Ready' ? 'Valid' : event.status === 'Needs Documents' ? 'Missing' : 'In Progress';

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.meta}>
          {formatDateTime(event.startTime)} • {event.location}
        </Text>
        <Text style={styles.meta}>{event.assignedTruckIds.length} truck assigned</Text>
      </View>
      <View style={styles.trailing}>
        <StatusBadge status={eventStatus} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  copy: {
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
    marginTop: 4,
  },
});
