import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BusinessProfile'>;

export function BusinessProfileScreen({ navigation }: Props) {
  const { business, profile } = useAuth();

  return (
    <Screen>
      <ScreenHeader subtitle="Read-only preview from Supabase. Editing arrives in a future release." title="Business profile" />

      {business ? (
        <>
          <ProfileRow label="Business name" value={business.name || '—'} />
          <ProfileRow label="Owner name" value={business.owner_name || '—'} />
          <ProfileRow label="Phone" value={business.phone || '—'} />
          <ProfileRow label="Email" value={business.email || '—'} />
          <ProfileRow label="City" value={business.city || '—'} />
          <ProfileRow label="County" value={business.county || '—'} />
        </>
      ) : (
        <Text style={styles.empty}>
          No business record yet.{profile?.full_name ? ` Signed in as ${profile.full_name}.` : ''} Finish onboarding first.
        </Text>
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
