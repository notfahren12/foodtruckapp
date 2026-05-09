import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type AppCardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

export function AppCard({ children, subtitle, title }: AppCardProps) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 16,
    gap: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
