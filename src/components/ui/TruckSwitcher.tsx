import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { colors } from '../../constants/colors';
import { Truck } from '../../types/models';

type TruckSwitcherProps = {
  selectedTruckId: 'all' | string;
  trucks: Truck[];
  onSelect: (truckId: 'all' | string) => void;
};

export function TruckSwitcher({ onSelect, selectedTruckId, trucks }: TruckSwitcherProps) {
  const [visible, setVisible] = useState(false);
  const selectedLabel =
    selectedTruckId === 'all' ? 'All Trucks' : trucks.find((truck) => truck.id === selectedTruckId)?.name ?? 'Truck';

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={styles.trigger}>
        <Text style={styles.label}>{selectedLabel}</Text>
        <Ionicons color={colors.textSecondary} name="chevron-down" size={18} />
      </Pressable>

      <Modal animationType="fade" transparent visible={visible}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {[{ id: 'all', name: 'All Trucks' }, ...trucks].map((truck) => {
              const active = truck.id === selectedTruckId;
              return (
                <Pressable
                  key={truck.id}
                  onPress={() => {
                    onSelect(truck.id as 'all' | string);
                    setVisible(false);
                  }}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{truck.name}</Text>
                  {active ? <Ionicons color={colors.info} name="checkmark" size={18} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  menu: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 8,
    gap: 4,
  },
  option: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionActive: {
    backgroundColor: colors.backgroundElevated,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  optionLabelActive: {
    color: colors.info,
  },
});
