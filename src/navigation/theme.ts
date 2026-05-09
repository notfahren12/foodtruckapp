import { DefaultTheme } from '@react-navigation/native';
import { colors } from '../constants/colors';

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.info,
    text: colors.textPrimary,
    border: colors.borderSoft,
    notification: colors.danger,
  },
};
