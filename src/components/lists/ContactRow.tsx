import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { Contact } from '../../types/models';

type ContactRowProps = {
  contact: Contact;
};

export function ContactRow({ contact }: ContactRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{contact.organization}</Text>
          <Text style={styles.subtitle}>
            {contact.name} • {contact.role}
          </Text>
        </View>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.info} name="call-outline" size={18} />
        </View>
      </View>
      <Text style={styles.meta}>{contact.phone}</Text>
      {contact.email ? <Text style={styles.meta}>{contact.email}</Text> : null}
      {contact.address ? <Text style={styles.meta}>{contact.address}</Text> : null}
      <Text style={styles.notes}>{contact.notes}</Text>
      {contact.website ? (
        <Pressable onPress={() => Linking.openURL(contact.website!)}>
          <Text style={styles.link}>{contact.website}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  notes: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  link: {
    color: colors.info,
    fontSize: 13,
    fontWeight: '600',
  },
});
