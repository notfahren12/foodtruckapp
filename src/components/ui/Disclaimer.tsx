import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

const disclaimerText =
  'This app is not legal advice, does not replace official agency guidance, and does not guarantee permit approval. Requirements may change. Users are responsible for verifying requirements with the proper city, county, state, fire, health, and event authorities.';

export function Disclaimer() {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Disclaimer</Text>
      <Text style={styles.body}>{disclaimerText}</Text>
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
  label: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
