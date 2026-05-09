import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { RootNavigator } from '../navigation/RootNavigator';
import { AppProvider } from './AppProvider';

export function AppShell() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </AppProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
