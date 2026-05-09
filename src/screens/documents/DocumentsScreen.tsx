import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { EmptyState } from '../../components/EmptyState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import {
  DOCUMENT_CATEGORIES,
  MOCK_UPLOADED_DOCUMENTS,
} from '../../data/mockCompliance';

export function DocumentsScreen() {
  return (
    <Screen>
      <ScreenHeader subtitle="Organize proofs by category; uploads will connect to Supabase Storage later." title="Documents" />

      <AppButton
        title="Upload document (placeholder)"
        onPress={() => Alert.alert('Upload', 'Document uploads will open the device picker when Storage is wired up.')}
      />

      <Text style={styles.sectionLabel}>Categories</Text>
      <View style={styles.categoryWrap}>
        {DOCUMENT_CATEGORIES.map((category) => (
          <View key={category} style={styles.categoryChip}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Uploaded (placeholder)</Text>
      {MOCK_UPLOADED_DOCUMENTS.length ? (
        MOCK_UPLOADED_DOCUMENTS.map((doc) => (
          <AppCard key={doc.id} subtitle={doc.uploadedAtLabel} title={doc.category}>
            <Text style={styles.fileName}>{doc.fileName}</Text>
          </AppCard>
        ))
      ) : (
        <EmptyState
          message="Nothing uploaded yet. Use the upload placeholder above once Storage is ready."
          title="No documents yet"
        />
      )}

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fileName: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
