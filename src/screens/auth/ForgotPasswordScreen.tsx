import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScreenHeader
        subtitle="Password reset will connect to Supabase Auth later. For now this screen is a placeholder."
        title="Forgot password"
      />

      <View style={styles.card}>
        <Text style={styles.body}>
          You will receive an email link to reset your password once backend auth is enabled.
        </Text>
      </View>

      <AppButton title="Back to sign in" onPress={() => navigation.navigate('Login')} variant="outline" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  body: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
