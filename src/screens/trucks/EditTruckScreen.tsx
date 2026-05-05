import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TruckForm } from '../../components/forms/TruckForm';
import { NavHeader } from '../../components/ui/NavHeader';
import { Screen } from '../../components/ui/Screen';
import { useAppState } from '../../core/AppProvider';

export function EditTruckScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { data } = useAppState();

  const truck = data.trucks.find((item) => item.id === route.params?.truckId);

  return (
    <Screen
      header={
        <NavHeader
          onBack={() => navigation.goBack()}
          subtitle={truck ? 'Edit existing truck' : 'Add new truck'}
          title={truck ? truck.name : 'Add Truck'}
        />
      }
    >
      <TruckForm
        initialTruck={truck}
        onSave={(values) => {
          Alert.alert('Truck Saved', `${values.name ?? 'Truck'} has been staged in the UI shell. Persist this next with Supabase.`);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
