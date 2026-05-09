import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../context/AuthContext';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/types';

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { business, profile, signOut, user } = useAuth();

  async function confirmSignOut() {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Sign out failed', error);
    }
  }

  const emailDisplay = user?.email ?? 'Not signed in';
  const businessNameDisplay = business?.name ?? profile?.full_name ?? '—';
  const locality = [business?.city, business?.county].filter(Boolean).join(' • ') || '—';

  return (
    <Screen>
      <ScreenHeader subtitle="Profile, fleet, reminders, and jurisdictions stay editable here." title="Settings" />

      <View style={styles.metaCard}>
        <Text style={styles.sectionLabel}>Account</Text>
        <Text style={styles.emailText}>{emailDisplay}</Text>
      </View>

      <View style={styles.metaCard}>
        <Text style={styles.sectionLabel}>Business</Text>
        <DetailRow label="Business name" value={business?.name ?? '—'} />
        <DetailRow label="Owner name" value={business?.owner_name ?? '—'} />
        <DetailRow label="City / county" value={locality !== '—' ? locality.replace(' • ', ', ') : '—'} />
      </View>

      <SettingsRow helper={businessNameDisplay !== '—' ? businessNameDisplay : 'Save business onboarding details'} label="Business profile" onPress={() => navigation.navigate('BusinessProfile')} />
      <SettingsRow label="Trucks" onPress={() => navigation.navigate('TrucksSettings')} />
      <SettingsRow label="Notification settings" onPress={() => navigation.navigate('NotificationSettings')} />
      <SettingsRow label="Jurisdictions" onPress={() => navigation.navigate('JurisdictionsSettings')} />
      <SettingsRow label="Disclaimer" onPress={() => navigation.navigate('Disclaimer')} />

      <View style={styles.metaCard}>
        <Text style={styles.meta}>
          If you delete your business in Supabase, you will automatically return through onboarding next time you launch the signed-in app.
        </Text>
      </View>

      <Pressable
        onPress={() => {
          Alert.alert(
            'Onboarding repeats automatically',
            'You only see onboarding when Supabase finds no businesses row for your account. Clearing it requires deleting that row in the database or signing in as someone else.',
          );
        }}
        style={styles.secondary}
      >
        <Text style={styles.secondaryText}>About onboarding routing</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Alert.alert('Sign out', 'You will stay signed out until you log in again.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: () => void confirmSignOut() },
          ]);
        }}
        style={styles.signOut}
      >
        <Text style={styles.signOutText}>Logout</Text>
      </Pressable>

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function SettingsRow({ helper, label, onPress }: { label: string; onPress: () => void; helper?: string }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {helper ? <Text style={styles.rowHelper}>{helper}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    gap: 8,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rowHelper: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: '300',
  },
  metaCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: 6,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  secondary: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.info,
  },
  signOut: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
