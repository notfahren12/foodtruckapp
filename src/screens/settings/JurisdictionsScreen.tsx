import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../../components/AppButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/colors';
import { PERMIT_JURISDICTIONS } from '../../data/mockCompliance';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JurisdictionsSettings'>;

export function JurisdictionsScreen({ navigation }: Props) {
  return (
    <Screen>
      <ScreenHeader subtitle="Track territories and office contacts used in permit and document filters." title="Territories & Offices" />

      <View style={styles.wrap}>
        {PERMIT_JURISDICTIONS.map((name) => (
          <View key={name} style={styles.chip}>
            <Text style={styles.chipText}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.note}>Requirement source needed for each office before relying on any checklist item.</Text>

      <AppButton title="Done" onPress={() => navigation.goBack()} variant="outline" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  note: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
