import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Disclaimer'>;

export function DisclaimerScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScreenHeader subtitle="Please read carefully." title="Disclaimer" />

      <Text style={styles.body}>{LEGAL_DISCLAIMER}</Text>

      <Text style={styles.more}>
        Requirements change by jurisdiction and over time. Always verify deadlines, fees, and submission channels with the responsible agencies.
        Nothing in this app constitutes legal advice or an endorsement by any government entity.
      </Text>

      <AppButton title="Done" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  more: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
