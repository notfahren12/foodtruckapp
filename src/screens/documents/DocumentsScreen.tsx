import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DocumentRow } from '../../components/lists/DocumentRow';
import { FilterChip } from '../../components/ui/FilterChip';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TruckSwitcher } from '../../components/ui/TruckSwitcher';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { getDocumentStatus } from '../../lib/compliance';

const filters = ['All', 'Valid', 'Expiring Soon', 'Missing', 'Expired', 'Photos', 'PDFs'] as const;

export function DocumentsScreen() {
  const navigation = useNavigation<any>();
  const { data, scopedDocuments, scopedRequirements, selectedTruckId, setSelectedTruckId } = useAppState();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
  const [query, setQuery] = useState('');

  const filteredDocuments = useMemo(
    () =>
      scopedDocuments.filter((document) => {
        const status = getDocumentStatus(document);
        const matchesQuery =
          document.title.toLowerCase().includes(query.toLowerCase()) ||
          document.documentType.toLowerCase().includes(query.toLowerCase());
        const matchesFilter =
          activeFilter === 'All'
            ? true
            : activeFilter === 'Photos'
              ? document.mimeType.startsWith('image')
              : activeFilter === 'PDFs'
                ? document.mimeType === 'application/pdf'
                : activeFilter === 'Missing'
                  ? document.status === 'Missing'
                  : status === activeFilter;

        return matchesQuery && matchesFilter;
      }),
    [activeFilter, query, scopedDocuments],
  );

  const missingDocPlaceholders = scopedRequirements
    .filter((requirement) => requirement.requiredDocumentType)
    .filter(
      (requirement) =>
        !scopedDocuments.some(
          (document) =>
            document.requirementId === requirement.id ||
            (document.documentType === requirement.requiredDocumentType && document.isCurrent),
        ),
    )
    .slice(0, 3);

  const recentlyUploaded = [...scopedDocuments].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 3);
  const renewalDocs = scopedDocuments.filter((document) => {
    const status = getDocumentStatus(document);
    return status === 'Expiring Soon' || status === 'Expired';
  });

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Documents</Text>
        <Text style={styles.subtitle}>Keep versioned permits, certificates, photos, and COIs organized by business, truck, and event.</Text>
        <TruckSwitcher
          onSelect={setSelectedTruckId}
          selectedTruckId={selectedTruckId}
          trucks={data.trucks}
        />
      </View>

      <TextInput
        onChangeText={setQuery}
        placeholder="Search documents"
        placeholderTextColor={colors.textMuted}
        style={styles.search}
        value={query}
      />

      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <FilterChip key={filter} active={filter === activeFilter} label={filter} onPress={() => setActiveFilter(filter)} />
        ))}
      </View>

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Add Document</Text>
      </Pressable>

      <SectionHeader title="Document Library" caption={`${filteredDocuments.length} documents in the current view`} />
      {filteredDocuments.map((document) => (
        <DocumentRow
          key={document.id}
          document={document}
          onPress={() => navigation.navigate('DocumentDetail', { documentId: document.id })}
          ownerLabel={
            document.eventId
              ? 'Event'
              : document.truckId
                ? data.trucks.find((truck) => truck.id === document.truckId)?.name ?? 'Truck'
                : 'Business-wide'
          }
        />
      ))}

      <SectionHeader title="Missing Required Documents" caption="Placeholders surfaced from active requirements." />
      {missingDocPlaceholders.map((requirement) => (
        <View key={requirement.id} style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>{requirement.title}</Text>
          <Text style={styles.placeholderBody}>Needed: {requirement.requiredDocumentType}</Text>
        </View>
      ))}

      <SectionHeader title="Recently Uploaded" caption="Latest file activity and proof photos." />
      {recentlyUploaded.map((document) => (
        <DocumentRow
          key={document.id}
          document={document}
          onPress={() => navigation.navigate('DocumentDetail', { documentId: document.id })}
          ownerLabel={document.truckId ? data.trucks.find((truck) => truck.id === document.truckId)?.name ?? 'Truck' : 'Business-wide'}
        />
      ))}

      <SectionHeader title="Needed for Renewal" caption="Current or upcoming document pressure." />
      {renewalDocs.map((document) => (
        <DocumentRow
          key={document.id}
          document={document}
          onPress={() => navigation.navigate('DocumentDetail', { documentId: document.id })}
          ownerLabel={document.truckId ? data.trucks.find((truck) => truck.id === document.truckId)?.name ?? 'Truck' : 'Business-wide'}
        />
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
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  placeholderCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  placeholderTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  placeholderBody: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
});
