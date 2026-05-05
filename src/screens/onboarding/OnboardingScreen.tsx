import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../../constants/colors';
import { Screen } from '../../components/ui/Screen';
import { Disclaimer } from '../../components/ui/Disclaimer';
import { useAppState } from '../../core/AppProvider';

export function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const { completeOnboarding, data } = useAppState();

  const questions = [
    ['Propane setup', data.questionnaire.usePropane],
    ['Generator usage', data.questionnaire.useGenerator],
    ['Fry food', data.questionnaire.fryFood],
    ['Hood system', data.questionnaire.hoodSystem],
    ['Fire suppression', data.questionnaire.fireSuppressionSystem],
    ['Multiple cities', data.questionnaire.multipleCities],
    ['Temporary events', data.questionnaire.temporaryEvents],
    ['Commissary kitchen', data.questionnaire.commissaryKitchen],
    ['Employees', data.questionnaire.employees],
    ['Prepackaged only', data.questionnaire.prepackagedOnly],
    ['Event permits', data.questionnaire.eventPermits],
    ['COIs for events', data.questionnaire.insuranceCoiForEvents],
  ] as const;

  return (
    <Screen padded>
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons color={colors.textPrimary} name="restaurant" size={28} />
        </View>
        <Text style={styles.heroTitle}>Food Truck Permit Tracker</Text>
        <Text style={styles.heroBody}>
          A Central Alabama compliance assistant for permits, inspections, renewals, documents, events, and reminders.
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>First-run setup</Text>
        {[
          'Create account',
          'Create business',
          'Add first truck',
          'Select jurisdictions',
          'Answer setup questionnaire',
          'Upload documents',
          'Enter known expiration dates',
          'Generate checklist',
          'Enable notifications',
        ].map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepIndex}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seed business preview</Text>
        <Text style={styles.cardBody}>{data.business.legalName}</Text>
        <Text style={styles.cardCaption}>2 trucks • Birmingham, Hoover, Pelham, Alabaster • Pro plan structure</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Questionnaire logic</Text>
        <View style={styles.tagGrid}>
          {questions.map(([label, value]) => (
            <View key={label} style={[styles.tag, value ? styles.tagOn : styles.tagOff]}>
              <Text style={[styles.tagText, value ? styles.tagTextOn : styles.tagTextOff]}>
                {label}: {value ? 'Yes' : 'No'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Disclaimer />

      <Pressable
        onPress={() => {
          completeOnboarding();
          navigation.replace('MainTabs');
        }}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  heroBody: {
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
    gap: 12,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardCaption: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndex: {
    color: colors.info,
    fontSize: 12,
    fontWeight: '800',
  },
  stepText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagOn: {
    backgroundColor: `${colors.success}14`,
    borderColor: `${colors.success}35`,
  },
  tagOff: {
    backgroundColor: `${colors.border}44`,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextOn: {
    color: colors.success,
  },
  tagTextOff: {
    color: colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: colors.info,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});
