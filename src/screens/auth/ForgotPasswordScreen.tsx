import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScreenHeader
        subtitle="Password reset can be wired to supabase.auth.resetPasswordForEmail from this screen when you’re ready."
        title="Forgot password"
      />

      <AppCard title="Recovery Placeholder">
        <Text style={styles.body}>
          You’ll receive an email link to reset your password once recovery is hooked up on this screen.
        </Text>
      </AppCard>

      <AppButton title="Back to sign in" onPress={() => navigation.navigate('Login')} variant="outline" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
