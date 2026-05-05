import { DarkTheme } from '@react-navigation/native';
import { colors } from '../constants/colors';

export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.info,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
};
