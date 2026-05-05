import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppointmentRow } from '../../components/lists/AppointmentRow';
import { EventRow } from '../../components/lists/EventRow';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TruckSwitcher } from '../../components/ui/TruckSwitcher';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { formatDate, getMonthGrid } from '../../lib/dates';

type CalendarDot = { color: string; key: string };

export function CalendarScreen() {
  const navigation = useNavigation<any>();
  const { data, scopedAppointments, scopedEvents, scopedRequirements, selectedTruckId, setSelectedTruckId } = useAppState();

  const anchor = new Date('2026-05-05T12:00:00-05:00');
  const monthCells = getMonthGrid(anchor);

  const itemDots = useMemo(() => {
    const map = new Map<string, CalendarDot[]>();

    const pushDot = (dateInput: string | undefined, color: string, key: string) => {
      if (!dateInput) return;
      const date = new Date(dateInput);
      if (date.getMonth() !== anchor.getMonth() || date.getFullYear() !== anchor.getFullYear()) return;
      const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      const dots = map.get(dayKey) ?? [];
      dots.push({ color, key });
      map.set(dayKey, dots.slice(0, 3));
    };

    scopedRequirements.forEach((requirement) => {
      pushDot(requirement.dueDate ?? requirement.expirationDate, requirement.status === 'Expired' ? colors.danger : colors.warning, requirement.id);
    });
    scopedAppointments.forEach((appointment) => pushDot(appointment.startTime, colors.info, appointment.id));
    scopedEvents.forEach((event) => pushDot(event.startTime, colors.purple, event.id));

    return map;
  }, [anchor, scopedAppointments, scopedEvents, scopedRequirements]);

  const upcomingDeadlines = [...scopedRequirements]
    .filter((requirement) => requirement.dueDate || requirement.expirationDate)
    .sort((left, right) => new Date(left.dueDate ?? left.expirationDate ?? '').getTime() - new Date(right.dueDate ?? right.expirationDate ?? '').getTime())
    .slice(0, 4);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>See deadlines, inspections, events, and overdue items in one mobile-first timeline.</Text>
        <TruckSwitcher
          onSelect={setSelectedTruckId}
          selectedTruckId={selectedTruckId}
          trucks={data.trucks}
        />
      </View>

      <View style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>May 2026</Text>
        <View style={styles.weekdays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.weekdayText}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {monthCells.map((cell) => {
            const dots = itemDots.get(cell.key) ?? [];
            return (
              <View key={cell.key} style={styles.cell}>
                <Text style={[styles.cellText, cell.dayNumber === 5 && styles.todayText]}>{cell.dayNumber ?? ''}</Text>
                <View style={styles.dotRow}>
                  {dots.map((dot) => (
                    <View key={dot.key} style={[styles.dot, { backgroundColor: dot.color }]} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <SectionHeader title="Upcoming Deadlines" caption="Permits, renewals, and due dates." />
      {upcomingDeadlines.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => navigation.navigate('RequirementDetail', { requirementId: item.id })}
          style={styles.deadlineCard}
        >
          <Text style={styles.deadlineTitle}>{item.title}</Text>
          <Text style={styles.deadlineMeta}>{formatDate(item.dueDate ?? item.expirationDate)}</Text>
        </Pressable>
      ))}

      <SectionHeader title="Appointments" caption="Inspection visits and confirmed agency meetings." />
      {scopedAppointments.map((appointment) => (
        <AppointmentRow
          key={appointment.id}
          appointment={appointment}
          onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appointment.id })}
          truckLabel={data.trucks.find((truck) => truck.id === appointment.truckId)?.name}
        />
      ))}

      <SectionHeader title="Events" caption="Purple dots indicate event days." />
      {scopedEvents.map((event) => (
        <EventRow key={event.id} event={event} onPress={() => navigation.navigate('EventDetail', { eventId: event.id })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  calendarTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayText: {
    width: '14%',
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '13.2%',
    minHeight: 58,
    backgroundColor: colors.backgroundElevated,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  todayText: {
    color: colors.info,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  deadlineCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    padding: 16,
    gap: 4,
  },
  deadlineTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  deadlineMeta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
