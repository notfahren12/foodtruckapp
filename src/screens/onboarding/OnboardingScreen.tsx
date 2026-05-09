import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { createBusiness, createMissingTruckPermitsForTruck, createTruck, textOrNull } from '../../lib/db';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({}: Props) {
  const { session, refreshBusiness } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [truckName, setTruckName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [yearRaw, setYearRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function validateYear(): number | null {
    const trimmed = yearRaw.trim();
    if (!trimmed) return null;
    const num = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(num)) {
      throw new Error('Year must be a valid number.');
    }
    const currentYear = new Date().getFullYear();
    if (num < 1980 || num > currentYear + 2) {
      throw new Error(`Year looks invalid (pick between 1980 and ${currentYear + 2}).`);
    }
    return num;
  }

  function validateForm(): string | null {
    if (businessName.trim().length < 2) return 'Business name must be at least 2 characters.';
    if (ownerName.trim().length < 2) return 'Owner name must be at least 2 characters.';
    if (!phone.trim()) return 'Enter a phone number.';
    const em = email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    if (!em || !emailOk) return 'Enter a valid contact email.';
    if (!city.trim()) return 'Enter a city.';
    if (!county.trim()) return 'Enter a county.';
    if (truckName.trim().length < 2) return 'Enter your first truck’s name.';
    if (!licensePlate.trim()) return 'Enter a license plate (or pending tag placeholder).';
    try {
      validateYear();
    } catch (e) {
      return e instanceof Error ? e.message : 'Year is invalid.';
    }
    return null;
  }

  async function handleSubmit() {
    setErrorMessage(null);
    const err = validateForm();
    if (err) {
      setErrorMessage(err);
      return;
    }

    const uid = session?.user?.id;
    if (!uid) {
      setErrorMessage('You are not signed in. Please sign in again.');
      return;
    }

    setBusy(true);
    try {
      let yearParsed: number | null = null;
      try {
        yearParsed = validateYear();
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : 'Year is invalid.');
        return;
      }

      const bizRes = await createBusiness({
        owner_id: uid,
        name: businessName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        county: county.trim(),
      });

      if (bizRes.error || !bizRes.data) {
        setErrorMessage(bizRes.error?.message ?? 'Could not create business. Check Supabase policies and connectivity.');
        return;
      }

      const truckRes = await createTruck({
        business_id: bizRes.data.id,
        name: truckName.trim(),
        license_plate: textOrNull(licensePlate),
        vin: textOrNull(vin),
        make: textOrNull(make),
        model: textOrNull(model),
        year: yearParsed,
        is_active: true,
      });

      if (truckRes.error || !truckRes.data) {
        setErrorMessage(
          truckRes.error?.message ?? 'Business was created but saving the truck failed. Add the truck later from Trucks settings.',
        );
        await refreshBusiness();
        return;
      }

      const checklistSeed = await createMissingTruckPermitsForTruck(truckRes.data.id);
      if (checklistSeed.error) {
        console.warn('createMissingTruckPermitsForTruck:', checklistSeed.error.message);
      }

      await refreshBusiness();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        subtitle="We’ll save one business record and one truck to Supabase. You can extend the fleet later."
        title="Business setup"
      />

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <Text style={styles.groupLabel}>Business</Text>
      <Field label="Business name *" editable={!busy} onChange={setBusinessName} value={businessName} />
      <Field label="Owner name *" editable={!busy} onChange={setOwnerName} value={ownerName} />
      <Field
        editable={!busy}
        keyboardType="phone-pad"
        label="Phone *"
        onChange={setPhone}
        value={phone}
      />
      <Field
        editable={!busy}
        keyboardType="email-address"
        label="Email *"
        onChange={setEmail}
        value={email}
        autoCapitalize="none"
      />
      <Field label="City *" editable={!busy} onChange={setCity} value={city} />
      <Field label="County *" editable={!busy} onChange={setCounty} value={county} />

      <Text style={[styles.groupLabel, { marginTop: 8 }]}>First truck</Text>
      <Field label="Truck name *" editable={!busy} onChange={setTruckName} value={truckName} />
      <Field label="License plate *" editable={!busy} onChange={setLicensePlate} value={licensePlate} />
      <Field optional label="VIN" editable={!busy} onChange={setVin} value={vin} autoCapitalize="characters" />
      <Field optional label="Make" editable={!busy} onChange={setMake} value={make} />
      <Field optional label="Model" editable={!busy} onChange={setModel} value={model} />
      <Field
        editable={!busy}
        keyboardType="number-pad"
        optional
        label="Year"
        onChange={(v) => setYearRaw(v.replace(/[^\d]/g, ''))}
        value={yearRaw}
      />

      <AppButton disabled={busy} title={busy ? 'Saving…' : 'Continue to app'} onPress={handleSubmit} />

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

function Field({
  autoCapitalize = 'sentences',
  editable = true,
  keyboardType = 'default',
  label,
  onChange,
  optional,
  value,
}: {
  label: string;
  value: string;
  optional?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'number-pad' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'characters' | 'words';
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onChange}
        placeholder={optional ? '(optional)' : label}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
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
