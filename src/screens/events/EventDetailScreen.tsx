import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavHeader } from '../../components/ui/NavHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { formatDateTime } from '../../lib/dates';

export function EventDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data } = useAppState();

  const event = data.events.find((item) => item.id === route.params.eventId);

  if (!event) {
    return (
      <Screen header={<NavHeader onBack={() => navigation.goBack()} title="Event" />}>
        <Text style={{ color: colors.textSecondary }}>Event not found.</Text>
      </Screen>
    );
  }

  const organizer = data.contacts.find((item) => item.id === event.organizerContactId);
  const eventRequirements = data.requirements.filter((item) => item.eventId === event.id);
  const assignedTrucks = data.trucks.filter((truck) => event.assignedTruckIds.includes(truck.id));

  return (
    <Screen header={<NavHeader onBack={() => navigation.goBack()} subtitle={event.status} title={event.name} />}>
      <View style={styles.card}>
        <Text style={styles.label}>Date / time</Text>
        <Text style={styles.value}>
          {formatDateTime(event.startTime)} to {formatDateTime(event.endTime)}
        </Text>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{event.location}</Text>
        <Text style={styles.label}>Arrival instructions</Text>
        <Text style={styles.value}>{event.arrivalInstructions}</Text>
        <Text style={styles.label}>Power / water rules</Text>
        <Text style={styles.value}>{event.powerWaterRules}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Assigned trucks</Text>
        {assignedTrucks.map((truck) => (
          <Text key={truck.id} style={styles.value}>
            {truck.name}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Event requirements</Text>
        {eventRequirements.map((requirement) => (
          <Pressable key={requirement.id} onPress={() => navigation.navigate('RequirementDetail', { requirementId: requirement.id })}>
            <Text style={styles.link}>{requirement.title}</Text>
          </Pressable>
        ))}
        {event.requiredDocuments.map((document) => (
          <Text key={document} style={styles.value}>
            {document}
          </Text>
        ))}
      </View>

      {organizer ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Organizer contact</Text>
          <Text style={styles.value}>{organizer.organization}</Text>
          <Text style={styles.value}>{organizer.name}</Text>
          <Text style={styles.value}>{organizer.phone}</Text>
          <Text style={styles.value}>{organizer.email}</Text>
        </View>
      ) : null}

      <Pressable onPress={() => Alert.alert('Packet generator', 'This is where event packet export will attach next.')} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Generate Vendor Packet</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
    gap: 8,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: colors.info,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 2,
  },
  primaryButton: {
    backgroundColor: colors.info,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});
