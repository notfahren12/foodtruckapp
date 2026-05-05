import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavHeader } from '../../components/ui/NavHeader';
import { Screen } from '../../components/ui/Screen';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../constants/colors';
import { useAppState } from '../../core/AppProvider';

export function ManageTrucksScreen() {
  const navigation = useNavigation<any>();
  const { data, getTruckCompliance, setSelectedTruckId } = useAppState();

  return (
    <Screen header={<NavHeader onBack={() => navigation.goBack()} subtitle="Multi-truck structure from day one" title="Manage Trucks" />}>
      <Pressable onPress={() => navigation.navigate('EditTruck', {})} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Add Truck</Text>
      </Pressable>

      <SectionHeader title="Fleet" caption="Truck details, jurisdictions, and checklist entry points." />
      {data.trucks.map((truck) => {
        const score = getTruckCompliance(truck.id).score;
        return (
          <View key={truck.id} style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.copy}>
                <Text style={styles.title}>{truck.name}</Text>
                <Text style={styles.meta}>
                  {truck.unitNumber} • {truck.licensePlate}
                </Text>
              </View>
              <StatusBadge status={truck.fireInspectionStatus} />
            </View>

            <Text style={styles.meta}>
              Jurisdictions: {(data.truckJurisdictionIds[truck.id] ?? []).length} • Score: {score}
            </Text>

            <View style={styles.actionRow}>
              <Pressable onPress={() => navigation.navigate('EditTruck', { truckId: truck.id })} style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSelectedTruckId(truck.id);
                  navigation.navigate('MainTabs', { screen: 'Checklist' });
                }}
                style={styles.secondaryAction}
              >
                <Text style={styles.secondaryActionText}>View Checklist</Text>
              </Pressable>
              <Pressable onPress={() => Alert.alert('Archive Truck', 'Archiving is reserved for the next persistence phase.')} style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Archive</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.info,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryAction: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryActionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
