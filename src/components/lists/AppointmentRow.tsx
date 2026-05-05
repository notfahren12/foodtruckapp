import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { formatDateTime } from '../../lib/dates';
import { Appointment } from '../../types/models';

type AppointmentRowProps = {
  appointment: Appointment;
  onPress: () => void;
  truckLabel?: string;
};

export function AppointmentRow({ appointment, onPress, truckLabel }: AppointmentRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.info} name="calendar-outline" size={18} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{appointment.title}</Text>
        <Text style={styles.meta}>
          {appointment.status} • {truckLabel ?? appointment.type}
        </Text>
        <Text style={styles.time}>{formatDateTime(appointment.startTime)}</Text>
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
