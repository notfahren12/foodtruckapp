import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { LEGAL_DISCLAIMER } from '../../constants/legal';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { isSupabaseConfigured } from '../../lib/supabase/client';
import { RootStackParamList } from '../../navigation/types';

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { businessProfile, resetOnboardingPreview, signOut } = useAppState();

  return (
    <Screen>
      <ScreenHeader subtitle="Profile, fleet, reminders, and jurisdictions stay editable here." title="Settings" />

      <SettingsRow
        helper={businessProfile?.businessName ?? 'Complete onboarding to fill this in'}
        label="Business profile"
        onPress={() => navigation.navigate('BusinessProfile')}
      />
      <SettingsRow label="Trucks" onPress={() => navigation.navigate('TrucksSettings')} />
      <SettingsRow label="Notification settings" onPress={() => navigation.navigate('NotificationSettings')} />
      <SettingsRow label="Jurisdictions" onPress={() => navigation.navigate('JurisdictionsSettings')} />
      <SettingsRow label="Disclaimer" onPress={() => navigation.navigate('Disclaimer')} />

      <View style={styles.metaCard}>
        <Text style={styles.meta}>Supabase configured: {isSupabaseConfigured() ? 'Yes' : 'No (env keys not set)'}</Text>
        <Text style={styles.meta}>Backend sync is not enabled in this skeleton.</Text>
      </View>

      <Pressable
        onPress={() => {
          resetOnboardingPreview();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }}
        style={styles.secondary}
      >
        <Text style={styles.secondaryText}>Preview onboarding flow again</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Alert.alert('Sign out', 'Use mock sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign out',
              style: 'destructive',
              onPress: () => {
                signOut();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ]);
        }}
        style={styles.signOut}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <Text style={styles.disclaimer}>{LEGAL_DISCLAIMER}</Text>
    </Screen>
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
