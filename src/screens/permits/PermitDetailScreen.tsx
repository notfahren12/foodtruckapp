import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { MOCK_PERMITS } from '../../data/mockCompliance';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PermitDetail'>;

export function PermitDetailScreen({ navigation, route }: Props) {
  const permit = MOCK_PERMITS.find((item) => item.id === route.params.permitId);

  if (!permit) {
    return (
      <Screen>
        <ScreenHeader subtitle="This permit is not in the mock catalog." title="Not found" />
        <AppButton title="Go back" onPress={() => navigation.goBack()} variant="outline" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader subtitle={`${permit.jurisdiction} • placeholder detail view`} title={permit.name} />

      <View style={styles.row}>
        <StatusBadge status={permit.status} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Expiration</Text>
        <Text style={styles.value}>{permit.expirationPlaceholder}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.body}>
          Official steps, fees, and contacts will appear here after data sources are connected. Until then, use this card as a workspace note.
        </Text>
      </View>

      <AppButton title="Close" onPress={() => navigation.goBack()} />

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
