import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { DocumentsScreen } from '../screens/documents/DocumentsScreen';
import { InspectionsScreen } from '../screens/inspections/InspectionsScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { PermitDetailScreen } from '../screens/permits/PermitDetailScreen';
import { PermitsScreen } from '../screens/permits/PermitsScreen';
import { BusinessProfileScreen } from '../screens/settings/BusinessProfileScreen';
import { DisclaimerScreen } from '../screens/settings/DisclaimerScreen';
import { JurisdictionsScreen } from '../screens/settings/JurisdictionsScreen';
import { NotificationSettingsScreen } from '../screens/settings/NotificationSettingsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { TrucksScreen } from '../screens/settings/TrucksScreen';
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
          borderTopColor: colors.borderSoft,
          paddingTop: 6,
          height: 72,
        },
        tabBarActiveTintColor: colors.info,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const iconName = (() => {
            switch (route.name) {
              case 'Dashboard':
                return 'home';
              case 'Permits':
                return 'document-text';
              case 'Documents':
                return 'folder-open';
              case 'Inspections':
                return 'shield-checkmark';
              case 'Settings':
                return 'settings';
            }
          })();
          return <Ionicons color={color} name={iconName} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Permits" component={PermitsScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Inspections" component={InspectionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { hasCompletedOnboarding, isAuthenticated } = useAppState();

  const initialRouteName = !isAuthenticated
    ? 'Login'
    : !hasCompletedOnboarding
      ? 'Onboarding'
      : 'MainTabs';

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="PermitDetail" component={PermitDetailScreen} />
        <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
        <Stack.Screen name="TrucksSettings" component={TrucksScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="JurisdictionsSettings" component={JurisdictionsScreen} />
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
