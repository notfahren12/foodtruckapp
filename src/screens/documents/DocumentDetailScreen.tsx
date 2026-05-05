import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavHeader } from '../../components/ui/NavHeader';
import { Screen } from '../../components/ui/Screen';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { getDocumentStatus } from '../../lib/compliance';
import { formatDate } from '../../lib/dates';

export function DocumentDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data } = useAppState();

  const document = data.documents.find((item) => item.id === route.params.documentId);

  if (!document) {
    return (
      <Screen header={<NavHeader onBack={() => navigation.goBack()} title="Document" />}>
        <Text style={{ color: colors.textSecondary }}>Document not found.</Text>
      </Screen>
    );
  }

  const versions = data.documents
    .filter((item) => item.title === document.title || (item.documentType === document.documentType && item.truckId === document.truckId))
    .sort((left, right) => right.version - left.version);

  const requirement = data.requirements.find((item) => item.id === document.requirementId);
  const ownerLabel = document.eventId
    ? 'Event'
    : document.truckId
      ? data.trucks.find((truck) => truck.id === document.truckId)?.name ?? 'Truck'
      : 'Business-wide';

  return (
    <Screen header={<NavHeader onBack={() => navigation.goBack()} subtitle={ownerLabel} title={document.title} />}>
      <View style={styles.summary}>
        <StatusBadge status={getDocumentStatus(document)} />
        <Text style={styles.summaryText}>{document.notes}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Document detail</Text>
        <InfoRow label="Type" value={document.documentType} />
        <InfoRow label="Owner" value={ownerLabel} />
        <InfoRow label="Issue date" value={formatDate(document.issueDate)} />
        <InfoRow label="Expiration" value={formatDate(document.expirationDate)} />
        <InfoRow label="Version" value={`v${document.version}`} />
        <InfoRow label="Current file" value={document.isCurrent ? 'Yes' : 'No'} />
        <InfoRow label="File path" value={document.filePath} />
      </View>

      {requirement ? (
        <Pressable
          onPress={() => navigation.navigate('RequirementDetail', { requirementId: requirement.id })}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Linked requirement</Text>
          <Text style={styles.linkTitle}>{requirement.title}</Text>
          <Text style={styles.linkBody}>{requirement.category}</Text>
        </Pressable>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Version history</Text>
        {versions.map((version) => (
          <View key={version.id} style={styles.versionRow}>
            <Text style={styles.versionLabel}>Version {version.version}</Text>
            <Text style={styles.versionMeta}>
              {version.isCurrent ? 'Current' : 'Archived'} • {formatDate(version.createdAt)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {['Upload new version', 'Mark current', 'Attach to packet'].map((action) => (
          <Pressable key={action} onPress={() => Alert.alert(action, 'Document write actions are prepared for the next Supabase phase.')} style={styles.actionButton}>
            <Text style={styles.actionText}>{action}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    gap: 12,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  linkTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  linkBody: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  versionRow: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  versionLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  versionMeta: {
    color: colors.textSecondary,
    fontSize: 13,
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
