import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  rightAccessory?: ReactNode;
};

export function ScreenHeader({ rightAccessory, subtitle, title }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightAccessory ? <View style={styles.right}>{rightAccessory}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  right: {
    paddingTop: 4,
  },
});
