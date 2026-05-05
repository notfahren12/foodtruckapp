import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ChecklistScreen } from '../screens/checklist/ChecklistScreen';
import { RequirementDetailScreen } from '../screens/checklist/RequirementDetailScreen';
import { DocumentsScreen } from '../screens/documents/DocumentsScreen';
import { DocumentDetailScreen } from '../screens/documents/DocumentDetailScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { AppointmentDetailScreen } from '../screens/calendar/AppointmentDetailScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import { ContactsScreen } from '../screens/contacts/ContactsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ManageTrucksScreen } from '../screens/trucks/ManageTrucksScreen';
import { EditTruckScreen } from '../screens/trucks/EditTruckScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { colors } from '../constants/colors';
import { useAppState } from '../core/AppProvider';
import { MainTabParamList, RootStackParamList } from './types';
import { navigationTheme } from './theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 76,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const iconName = (() => {
            switch (route.name) {
              case 'Dashboard':
                return 'grid';
              case 'Calendar':
                return 'calendar';
              case 'Documents':
                return 'document-text';
              case 'Checklist':
                return 'checkmark-circle';
              case 'Settings':
                return 'settings';
            }
          })();

          return <Ionicons color={color} name={iconName} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Checklist" component={ChecklistScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { hasCompletedOnboarding } = useAppState();

  const initialRoute = useMemo(() => (hasCompletedOnboarding ? 'MainTabs' : 'Onboarding'), [hasCompletedOnboarding]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!hasCompletedOnboarding ? <Stack.Screen name="Onboarding" component={OnboardingScreen} /> : null}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="RequirementDetail" component={RequirementDetailScreen} />
        <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
        <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="ManageTrucks" component={ManageTrucksScreen} />
        <Stack.Screen name="EditTruck" component={EditTruckScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
