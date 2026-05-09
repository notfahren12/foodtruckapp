import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { MOCK_TRUCKS } from '../../data/mockCompliance';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TrucksSettings'>;

export function TrucksScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScreenHeader subtitle="Fleet CRUD will sync with Supabase later; labels below are mock trucks." title="Trucks" />

      {MOCK_TRUCKS.map((truck) => (
        <View key={truck.id} style={styles.card}>
          <Text style={styles.name}>{truck.name}</Text>
          <Text style={styles.meta}>Truck editor placeholder • ID: {truck.id}</Text>
        </View>
      ))}

      <AppButton
        title="Add truck (placeholder)"
        onPress={() => Alert.alert('Add truck', 'Fleet editing will sync with Supabase later.')}
        variant="outline"
      />

      <AppButton title="Done" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
