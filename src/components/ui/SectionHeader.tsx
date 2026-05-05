import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

type SectionHeaderProps = {
  title: string;
  caption?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function SectionHeader({ actionLabel, caption, onPressAction, title }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onPressAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  action: {
    color: colors.info,
    fontSize: 14,
    fontWeight: '600',
  },
});
