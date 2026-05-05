import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavHeader } from '../../components/ui/NavHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { formatDateTime } from '../../lib/dates';

export function AppointmentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data } = useAppState();

  const appointment = data.appointments.find((item) => item.id === route.params.appointmentId);

  if (!appointment) {
    return (
      <Screen header={<NavHeader onBack={() => navigation.goBack()} title="Appointment" />}>
        <Text style={{ color: colors.textSecondary }}>Appointment not found.</Text>
      </Screen>
    );
  }

  const result = data.inspectionResults.find((item) => item.appointmentId === appointment.id);
  const truck = data.trucks.find((item) => item.id === appointment.truckId);
  const requirement = data.requirements.find((item) => item.id === appointment.requirementId);

  return (
    <Screen header={<NavHeader onBack={() => navigation.goBack()} subtitle={truck?.name ?? appointment.type} title={appointment.title} />}>
      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{appointment.status}</Text>
        <Text style={styles.label}>Date / time</Text>
        <Text style={styles.value}>
          {formatDateTime(appointment.startTime)} to {formatDateTime(appointment.endTime)}
        </Text>
        <Text style={styles.label}>Agency</Text>
        <Text style={styles.value}>{appointment.agency}</Text>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{appointment.location}</Text>
        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>{appointment.notes}</Text>
      </View>

      {requirement ? (
        <Pressable onPress={() => navigation.navigate('RequirementDetail', { requirementId: requirement.id })} style={styles.card}>
          <Text style={styles.label}>Related requirement</Text>
          <Text style={styles.value}>{requirement.title}</Text>
        </Pressable>
      ) : null}

      {result ? (
        <View style={styles.card}>
          <Text style={styles.label}>Inspection outcome</Text>
          <Text style={styles.value}>{result.result}</Text>
          {result.failureReason ? (
            <>
              <Text style={styles.label}>Reason</Text>
              <Text style={styles.value}>{result.failureReason}</Text>
            </>
          ) : null}
          {result.correctionNeeded ? (
            <>
              <Text style={styles.label}>Correction needed</Text>
              <Text style={styles.value}>{result.correctionNeeded}</Text>
            </>
          ) : null}
          {result.correctionDeadline ? (
            <>
              <Text style={styles.label}>Correction deadline</Text>
              <Text style={styles.value}>{formatDateTime(result.correctionDeadline)}</Text>
            </>
          ) : null}
        </View>
      ) : null}
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
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
