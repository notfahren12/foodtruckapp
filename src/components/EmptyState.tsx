import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { AppButton } from './AppButton';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ actionLabel, message, onAction, title }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <AppButton title={actionLabel} onPress={onAction} variant="outline" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
});
