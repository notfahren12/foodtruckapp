import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationSettings'>;

export function NotificationSettingsScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScreenHeader subtitle="Choose reminder timing for renewals and inspection follow-ups." title="Notifications" />

      <View style={styles.card}>
        <Text style={styles.title}>Reminder cadence</Text>
        <Text style={styles.line}>• 60 / 30 / 14 / 7 days before expiration</Text>
        <Text style={styles.line}>• Day-of inspection ping</Text>
        <Text style={styles.line}>• Quiet hours respected once enabled</Text>
      </View>

      <AppButton title="Done" onPress={() => navigation.goBack()} variant="outline" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceAlt,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  line: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
