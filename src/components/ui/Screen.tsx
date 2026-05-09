import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

type ScreenProps = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
  padded?: boolean;
}>;

export function Screen({ children, footer, header, padded = true }: ScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, padded && styles.padded]}
      >
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100,
  },
  padded: {
    paddingHorizontal: 20,
    gap: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
});
