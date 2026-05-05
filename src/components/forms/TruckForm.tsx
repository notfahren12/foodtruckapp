import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/colors';
import { Truck } from '../../types/models';

type TruckFormProps = {
  initialTruck?: Truck;
  onSave: (values: Partial<Truck>) => void;
};

export function TruckForm({ initialTruck, onSave }: TruckFormProps) {
  const [name, setName] = useState(initialTruck?.name ?? '');
  const [unitNumber, setUnitNumber] = useState(initialTruck?.unitNumber ?? '');
  const [vin, setVin] = useState(initialTruck?.vin ?? '');
  const [licensePlate, setLicensePlate] = useState(initialTruck?.licensePlate ?? '');
  const [notes, setNotes] = useState(initialTruck?.notes ?? '');
  const [active, setActive] = useState(initialTruck?.active ?? true);

  return (
    <View style={styles.form}>
      <Field label="Truck Name" value={name} onChangeText={setName} />
      <Field label="Unit Number" value={unitNumber} onChangeText={setUnitNumber} />
      <Field label="VIN" value={vin} onChangeText={setVin} />
      <Field label="License Plate" value={licensePlate} onChangeText={setLicensePlate} />
      <Field label="Notes" multiline value={notes} onChangeText={setNotes} />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Active Truck</Text>
        <Switch
          onValueChange={setActive}
          thumbColor={colors.textPrimary}
          trackColor={{ false: colors.border, true: colors.success }}
          value={active}
        />
      </View>

      <Pressable
        onPress={() => onSave({ name, unitNumber, vin, licensePlate, notes, active })}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Save Truck Profile</Text>
      </Pressable>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
};

function Field({ label, multiline, onChangeText, value }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    fontSize: 15,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  button: {
    backgroundColor: colors.info,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});
