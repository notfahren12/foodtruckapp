import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';
import { isSupabaseConfigured } from '../../lib/supabase/client';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { data, reopenOnboarding } = useAppState();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Profile, business controls, team roles, reminders, future billing, and admin-ready placeholders.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account profile</Text>
        <Text style={styles.value}>{data.user.fullName}</Text>
        <Text style={styles.meta}>{data.user.email}</Text>
        <Text style={styles.meta}>{data.user.phone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Business profile</Text>
        <Text style={styles.value}>{data.business.legalName}</Text>
        <Text style={styles.meta}>{data.business.address}</Text>
        <Text style={styles.meta}>Plan: {data.business.planTier}</Text>
        <Text style={styles.meta}>Quiet hours: {data.business.quietHours}</Text>
      </View>

      <SectionHeader title="Management" caption="MVP navigation for operational screens." />
      <SettingsLink label="Manage Trucks" onPress={() => navigation.navigate('ManageTrucks')} />
      <SettingsLink label="Contacts" onPress={() => navigation.navigate('Contacts')} />
      <SettingsLink label="Events" onPress={() => navigation.navigate('Events')} />
      <SettingsLink label="Manage Jurisdictions" onPress={() => {}} helper="Placeholder for future admin-backed jurisdiction management." />
      <SettingsLink label="Manage Users / Team" onPress={() => {}} helper="Roles already supported in the data model." />

      <SectionHeader title="Notifications" caption="Push reminder structure is scaffolded." />
      <View style={styles.card}>
        <Text style={styles.value}>{data.business.notificationsEnabled ? 'Push enabled' : 'Push disabled'}</Text>
        <Text style={styles.meta}>Default escalation: 60, 30, 14, 7, 1, day-of, overdue</Text>
      </View>

      <SectionHeader title="Platform readiness" caption="Future monetization and integrations." />
      <View style={styles.card}>
        <Text style={styles.meta}>Supabase configured: {isSupabaseConfigured() ? 'Yes' : 'No - placeholder ready'}</Text>
        <Text style={styles.meta}>Billing: placeholder only</Text>
        <Text style={styles.meta}>SMS reminders: reserved for paid plans later</Text>
        <Text style={styles.meta}>Data export: placeholder only</Text>
      </View>

      <Pressable
        onPress={() => {
          reopenOnboarding();
          navigation.navigate('Onboarding');
        }}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Preview Onboarding Again</Text>
      </Pressable>

      <Disclaimer />
    </Screen>
  );
}

function SettingsLink({ helper, label, onPress }: { label: string; onPress: () => void; helper?: string }) {
  return (
    <Pressable onPress={onPress} style={styles.linkCard}>
      <Text style={styles.linkLabel}>{label}</Text>
      {helper ? <Text style={styles.linkHelper}>{helper}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
    gap: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  value: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  linkCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  linkLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  linkHelper: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.info,
    fontSize: 15,
    fontWeight: '700',
  },
});
