import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ActionCard } from '../../components/cards/ActionCard';
import { ComplianceScoreCard } from '../../components/cards/ComplianceScoreCard';
import { AppointmentRow } from '../../components/lists/AppointmentRow';
import { RequirementRow } from '../../components/lists/RequirementRow';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TruckSwitcher } from '../../components/ui/TruckSwitcher';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { calculateComplianceScore, getHighestRiskTruck, getMissingItems, getOverdueItems, getUpcomingItems } from '../../lib/compliance';
import { formatDate } from '../../lib/dates';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const {
    data,
    scopedAppointments,
    scopedDocuments,
    scopedInspectionResults,
    scopedRequirements,
    selectedTruck,
    selectedTruckId,
    setSelectedTruckId,
  } = useAppState();

  const breakdown = calculateComplianceScore(scopedRequirements, scopedDocuments, scopedInspectionResults);
  const expiringSoon = getUpcomingItems(scopedRequirements.filter((item) => item.expirationDate), 30).slice(0, 3);
  const missingItems = getMissingItems(scopedRequirements).slice(0, 3);
  const overdueItems = getOverdueItems(scopedRequirements).slice(0, 3);
  const upcomingAppointments = getUpcomingItems(scopedAppointments, 14).slice(0, 3);
  const highestRisk = getHighestRiskTruck(data.trucks, data.requirements, data.documents, data.inspectionResults);

  const nextAction =
    [...missingItems, ...overdueItems, ...expiringSoon]
      .sort((left, right) => new Date(left.nextActionDate ?? left.dueDate ?? '').getTime() - new Date(right.nextActionDate ?? right.dueDate ?? '').getTime())[0] ??
    scopedRequirements[0] ??
    data.requirements[0];
  const nextActionCard = nextAction ?? {
    title: 'No active actions',
    notes: 'Your current scope does not have any pending next actions.',
    nextActionDate: undefined,
    dueDate: undefined,
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Central Alabama</Text>
        <Text style={styles.title}>Compliance Dashboard</Text>
        <Text style={styles.subtitle}>
          Track every truck, every permit, and every inspection window without losing the company-wide view.
        </Text>
        <TruckSwitcher
          onSelect={setSelectedTruckId}
          selectedTruckId={selectedTruckId}
          trucks={data.trucks}
        />
      </View>

      <ComplianceScoreCard
        breakdown={breakdown}
        subtitle={selectedTruck ? `${selectedTruck.name} readiness` : 'Company-wide readiness'}
      />

      <View style={styles.actionGrid}>
        <ActionCard icon="cloud-upload-outline" label="Add Document" onPress={() => navigation.navigate('Documents')} />
        <ActionCard icon="calendar-outline" label="Schedule Appointment" onPress={() => navigation.navigate('Calendar')} />
        <ActionCard icon="briefcase-outline" label="Generate Packet" onPress={() => navigation.navigate('Events')} />
        <ActionCard icon="add-circle-outline" label="Add Truck" onPress={() => navigation.navigate('ManageTrucks')} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>Next Best Action</Text>
        <Text style={styles.cardTitle}>{nextActionCard.title}</Text>
        <Text style={styles.cardBody}>{nextActionCard.notes}</Text>
        <Text style={styles.cardMeta}>Target date: {formatDate(nextActionCard.nextActionDate ?? nextActionCard.dueDate)}</Text>
      </View>

      {selectedTruckId === 'all' && highestRisk.truck ? (
        <Pressable
          onPress={() => setSelectedTruckId(highestRisk.truck!.id)}
          style={styles.card}
        >
          <Text style={styles.cardEyebrow}>Highest-risk truck</Text>
          <Text style={styles.cardTitle}>{highestRisk.truck.name}</Text>
          <Text style={styles.cardBody}>
            Fire and event readiness are dragging this truck below the rest of the fleet. Tap to isolate its checklist.
          </Text>
          <Text style={styles.cardMeta}>Current score: {highestRisk.score}</Text>
        </Pressable>
      ) : null}

      <SectionHeader title="Expiring Soon" caption="Renewals and certificates closing in." />
      {expiringSoon.map((requirement) => (
        <RequirementRow
          key={requirement.id}
          onPress={() => navigation.navigate('RequirementDetail', { requirementId: requirement.id })}
          requirement={requirement}
          truckLabel={data.trucks.find((truck) => truck.id === requirement.truckId)?.name}
        />
      ))}

      <SectionHeader title="Missing Requirements" caption="Items blocking approval or event readiness." />
      {missingItems.map((requirement) => (
        <RequirementRow
          key={requirement.id}
          onPress={() => navigation.navigate('RequirementDetail', { requirementId: requirement.id })}
          requirement={requirement}
          truckLabel={data.trucks.find((truck) => truck.id === requirement.truckId)?.name}
        />
      ))}

      <SectionHeader title="Overdue" caption="Past-due tasks and deadlines." />
      {overdueItems.length ? (
        overdueItems.map((requirement) => (
          <RequirementRow
            key={requirement.id}
            onPress={() => navigation.navigate('RequirementDetail', { requirementId: requirement.id })}
            requirement={requirement}
            truckLabel={data.trucks.find((truck) => truck.id === requirement.truckId)?.name}
          />
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No overdue items in this view right now.</Text>
        </View>
      )}

      <SectionHeader title="Upcoming Appointments" caption="Inspections, reviews, and confirmed visits." actionLabel="Open calendar" onPressAction={() => navigation.navigate('Calendar')} />
      {upcomingAppointments.map((appointment) => (
        <AppointmentRow
          key={appointment.id}
          appointment={appointment}
          onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appointment.id })}
          truckLabel={data.trucks.find((truck) => truck.id === appointment.truckId)?.name}
        />
      ))}

      <Pressable
        onPress={() => Alert.alert('Packet Generator', 'Packet generation is scaffolded here and ready for PDF export later.')}
        style={styles.card}
      >
        <Text style={styles.cardEyebrow}>Packet Generator</Text>
        <Text style={styles.cardTitle}>Fire Inspection Packet</Text>
        <Text style={styles.cardBody}>
          Combine the business license, health permit, fire certificate, tag photos, insurance COI, truck photo, and setup notes into one review packet.
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
  },
  eyebrow: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  cardEyebrow: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cardMeta: {
    color: colors.info,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
