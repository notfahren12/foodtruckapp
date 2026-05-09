import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { AppCard } from '../../components/AppCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { MOCK_PERMITS } from '../../data/mockCompliance';
import { RootStackParamList } from '../../navigation/types';

export function PermitsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen>
      <ScreenHeader subtitle="Requirements vary by jurisdiction; confirm details with each agency." title="Permits" />

      {MOCK_PERMITS.map((permit) => (
        <AppCard key={permit.id}>
          <View style={styles.cardTop}>
            <View style={styles.titleBlock}>
              <Text style={styles.permitName}>{permit.name}</Text>
              <Text style={styles.jurisdiction}>{permit.jurisdiction}</Text>
            </View>
            <StatusBadge status={permit.status} />
          </View>
          <Text style={styles.expiration}>{permit.expirationPlaceholder}</Text>
          <AppButton title="View Details" onPress={() => navigation.navigate('PermitDetail', { permitId: permit.id })} variant="outline" />
        </AppCard>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  permitName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  jurisdiction: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  expiration: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
