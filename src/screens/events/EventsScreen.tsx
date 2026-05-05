import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EventRow } from '../../components/lists/EventRow';
import { NavHeader } from '../../components/ui/NavHeader';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';

export function EventsScreen() {
  const navigation = useNavigation<any>();
  const { scopedEvents } = useAppState();

  return (
    <Screen header={<NavHeader onBack={() => navigation.goBack()} subtitle="Future-ready event workflows" title="Events" />}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Vendor packets and event checklists</Text>
        <Text style={styles.heroBody}>
          Events are modeled as first-class records so packet generation, insurance COIs, and truck assignments can scale later.
        </Text>
        <Pressable onPress={() => Alert.alert('Packet summary', 'PDF export can plug into this screen next without changing the data model.')} style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Mock Packet Summary</Text>
        </Pressable>
      </View>

      <SectionHeader title="Upcoming Events" caption="Organizer docs, permits, and setup instructions." />
      {scopedEvents.map((event) => (
        <EventRow key={event.id} event={event} onPress={() => navigation.navigate('EventDetail', { eventId: event.id })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  heroBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.info,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
