import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { getDocumentStatus } from '../../lib/compliance';
import { formatDate } from '../../lib/dates';
import { DocumentRecord } from '../../types/models';
import { StatusBadge } from '../ui/StatusBadge';

type DocumentRowProps = {
  document: DocumentRecord;
  onPress: () => void;
  ownerLabel: string;
};

export function DocumentRow({ document, onPress, ownerLabel }: DocumentRowProps) {
  const status = getDocumentStatus(document);

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons color={colors.info} name={document.mimeType.startsWith('image') ? 'image' : 'document'} size={18} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{document.title}</Text>
        <Text style={styles.meta}>
          {document.documentType} • {ownerLabel} • {formatDate(document.expirationDate)}
        </Text>
      </View>
      <View style={styles.trailing}>
        <StatusBadge status={status} />
      </View>
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
    gap: 6,
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
  trailing: {
    alignItems: 'flex-end',
  },
});
