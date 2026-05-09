import { Alert, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TrucksSettings'>;

export function TrucksScreen({ navigation }: Props) {
  const { trucks } = useAuth();

  return (
    <Screen>
      <ScreenHeader subtitle="Fleet data comes from Supabase. Add/remove flows will plug in later." title="Trucks" />

      {trucks.length ? (
        trucks.map((truck) => (
          <View key={truck.id} style={styles.card}>
            <Text style={styles.name}>{truck.name}</Text>
            <Text style={styles.meta}>{truck.license_plate ? `Plate: ${truck.license_plate}` : 'Plate: —'}</Text>
            {[truck.make, truck.model, truck.year].some(Boolean) ? (
              <Text style={styles.meta}>{[truck.make, truck.model, truck.year ?? null].filter(Boolean).join(' • ')}</Text>
            ) : null}
            {truck.vin ? <Text style={styles.meta}>VIN: {truck.vin}</Text> : null}
            <Text style={styles.micro}>ID {truck.id}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No trucks on file yet.</Text>
      )}

      <AppButton title="Add truck (coming soon)" onPress={() => Alert.alert('Fleet tools', 'Truck CRUD arrives in the next sprint.')} variant="outline" />

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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  micro: {
    fontSize: 11,
    color: colors.textMuted,
  },
  empty: {
    fontSize: 15,
    color: colors.textSecondary,
    paddingVertical: 8,
  },
});
