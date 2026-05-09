import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BusinessProfile'>;

export function BusinessProfileScreen({ navigation }: Props) {
  const { businessProfile } = useAppState();

  return (
    <Screen>
      <ScreenHeader subtitle="Values come from onboarding until Supabase sync exists." title="Business profile" />

      {businessProfile ? (
        <>
          <ProfileRow label="Business name" value={businessProfile.businessName || '—'} />
          <ProfileRow label="Owner name" value={businessProfile.ownerName || '—'} />
          <ProfileRow label="City" value={businessProfile.city || '—'} />
          <ProfileRow label="County" value={businessProfile.county || '—'} />
          <ProfileRow label="Food trucks" value={String(businessProfile.truckCount)} />
          <ProfileRow label="Primary operating cities" value={businessProfile.primaryOperatingCities || '—'} />
        </>
      ) : (
        <Text style={styles.empty}>No profile saved yet. Finish onboarding first.</Text>
      )}

      <AppButton title="Done" onPress={() => navigation.goBack()} variant="outline" />
    </Screen>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSoft,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  empty: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
