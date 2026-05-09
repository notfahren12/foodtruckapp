import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { BusinessProfile, emptyProfile, useAppState } from '../../core/AppProvider';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const { completeOnboarding } = useAppState();
  const [form, setForm] = useState<BusinessProfile>(emptyProfile);

  function update<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleContinue() {
    const truckCount = Number(form.truckCount);
    completeOnboarding({
      ...form,
      truckCount: Number.isFinite(truckCount) && truckCount > 0 ? Math.floor(truckCount) : 1,
    });
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  }

  return (
    <Screen>
      <ScreenHeader
        subtitle="Tell us about your operation so the dashboard can stay scoped to your trucks and cities."
        title="Business setup"
      />

      <Field label="Business name" onChange={(v) => update('businessName', v)} value={form.businessName} />
      <Field label="Owner name" onChange={(v) => update('ownerName', v)} value={form.ownerName} />
      <Field label="City" onChange={(v) => update('city', v)} value={form.city} />
      <Field label="County" onChange={(v) => update('county', v)} value={form.county} />

      <View style={styles.field}>
        <Text style={styles.label}>Number of food trucks</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={(v) => update('truckCount', Number(v.replace(/[^0-9]/g, '')) || 0)}
          placeholder="1"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={form.truckCount ? String(form.truckCount) : ''}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Primary operating cities</Text>
        <TextInput
          multiline
          onChangeText={(v) => update('primaryOperatingCities', v)}
          placeholder="e.g. Birmingham, Hoover, Pelham"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.textArea]}
          value={form.primaryOperatingCities}
        />
      </View>

      <AppButton title="Continue to app" onPress={handleContinue} />

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

function Field({
  label,
  onChange,
  value,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput onChangeText={onChange} placeholder={label} placeholderTextColor={colors.textMuted} style={styles.input} value={value} />
    </View>
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
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 8,
  },
});
