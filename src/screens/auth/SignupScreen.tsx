import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const MIN_PASSWORD = 8;

export function SignupScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function validate(): string | null {
    const name = fullName.trim();
    if (name.length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    const em = email.trim();
    if (!em) return 'Enter a valid email.';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(em)) {
      return 'That email doesn’t look valid.';
    }
    if (password.length < MIN_PASSWORD) {
      return `Password must be at least ${MIN_PASSWORD} characters.`;
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  }

  async function handleSignup() {
    setErrorMessage(null);
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setBusy(true);
    try {
      const { error, needsEmailConfirmation } = await signUp(email, password, fullName.trim());
      if (error) {
        setErrorMessage(error);
        return;
      }
      if (needsEmailConfirmation) {
        Alert.alert(
          'Check your email',
          'Confirm your address from the link Supabase sent, then return here to sign in.',
        );
        navigation.navigate('Login');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader subtitle="Creates your account and saves a starter profile row in Supabase." title="Sign up" />

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <AppCard title="Create Account">
        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            editable={!busy}
            autoCapitalize="words"
            onChangeText={setFullName}
            placeholder="Jordan Rivers"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            textContentType="name"
            value={fullName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            textContentType="emailAddress"
            value={email}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            editable={!busy}
            onChangeText={setPassword}
            placeholder={`At least ${MIN_PASSWORD} characters`}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
            textContentType="newPassword"
            value={password}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            editable={!busy}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
            textContentType="newPassword"
            value={confirmPassword}
          />
        </View>

        <AppButton disabled={busy} title={busy ? 'Creating account…' : 'Create account'} onPress={handleSignup} />
      </AppCard>

      <Pressable disabled={busy} onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, busy && styles.linkDisabled]}>Already have an account? Sign in</Text>
      </Pressable>

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
  },
  linkDisabled: {
    opacity: 0.45,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 8,
  },
});
