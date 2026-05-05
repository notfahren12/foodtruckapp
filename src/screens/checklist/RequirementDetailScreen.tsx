import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { NavHeader } from '../../components/ui/NavHeader';
import { Screen } from '../../components/ui/Screen';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { formatDate } from '../../lib/dates';

export function RequirementDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data } = useAppState();

  const requirement = data.requirements.find((item) => item.id === route.params.requirementId);

  if (!requirement) {
    return (
      <Screen header={<NavHeader onBack={() => navigation.goBack()} title="Requirement" />}>
        <Text style={{ color: colors.textSecondary }}>Requirement not found.</Text>
      </Screen>
    );
  }

  const relatedDocuments = data.documents.filter(
    (document) => document.requirementId === requirement.id || document.documentType === requirement.requiredDocumentType,
  );
  const relatedAppointments = data.appointments.filter((appointment) => appointment.requirementId === requirement.id);
  const truck = data.trucks.find((item) => item.id === requirement.truckId);

  return (
    <Screen header={<NavHeader onBack={() => navigation.goBack()} subtitle={truck?.name ?? 'Business-wide requirement'} title={requirement.title} />}>
      <View style={styles.summary}>
        <StatusBadge status={requirement.status} />
        <Text style={styles.summaryText}>{requirement.description}</Text>
      </View>

      <DetailCard
        rows={[
          ['Why it matters', requirement.description],
          ['Applies to', requirement.appliesTo],
          ['Jurisdiction', data.jurisdictions.find((item) => item.id === requirement.jurisdictionId)?.name ?? 'Multi-jurisdiction / direct agency'],
          ['Source agency', requirement.sourceAgency],
          ['Contact info', requirement.sourceContact ?? 'Not listed'],
          ['Last verified', formatDate(requirement.lastVerifiedAt)],
          ['Renewal / due', formatDate(requirement.expirationDate ?? requirement.dueDate)],
          ['Required document', requirement.requiredDocumentType ?? 'No document linked'],
          ['Notes', requirement.notes],
        ]}
        title="Requirement detail"
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Linked documents</Text>
        {relatedDocuments.map((document) => (
          <Pressable
            key={document.id}
            onPress={() => navigation.navigate('DocumentDetail', { documentId: document.id })}
            style={styles.row}
          >
            <Text style={styles.rowTitle}>{document.title}</Text>
            <Text style={styles.rowMeta}>{document.documentType}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Related appointments</Text>
        {relatedAppointments.length ? (
          relatedAppointments.map((appointment) => (
            <Pressable
              key={appointment.id}
              onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appointment.id })}
              style={styles.row}
            >
              <Text style={styles.rowTitle}>{appointment.title}</Text>
              <Text style={styles.rowMeta}>{formatDate(appointment.startTime)}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyText}>No appointment is linked yet.</Text>
        )}
      </View>

      <View style={styles.actions}>
        {[
          'Mark Complete',
          'Mark Not Applicable',
          'Upload Proof',
          'Schedule Appointment',
        ].map((action) => (
          <Pressable key={action} onPress={() => Alert.alert(action, 'This action is scaffolded for the next data-write phase.')} style={styles.actionButton}>
            <Text style={styles.actionText}>{action}</Text>
          </Pressable>
        ))}
      </View>

      <Disclaimer />
    </Screen>
  );
}

function DetailCard({ rows, title }: { title: string; rows: Array<[string, string]> }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  rowMeta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.info,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
