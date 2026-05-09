import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { signUp } = useAppState();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSignup() {
    signUp();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  }

  return (
    <Screen>
      <ScreenHeader
        subtitle="Create a placeholder account. Supabase Auth will replace this flow."
        title="Sign up"
      />

      <View style={styles.field}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          onChangeText={setName}
          placeholder="Jordan Rivers"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={name}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={email}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={password}
        />
      </View>

      <AppButton title="Create account" onPress={handleSignup} />

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
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
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 8,
  },
});
