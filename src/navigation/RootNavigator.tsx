import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
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
import { AuthStackParamList, MainTabParamList, RootStackParamList } from './types';
import { navigationTheme } from './theme';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

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

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingFlowNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AppStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AppStack.Navigator>
  );
}

function MainAppNavigator() {
  return (
    <AppStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AppStack.Screen name="MainTabs" component={MainTabs} />
      <AppStack.Screen name="PermitDetail" component={PermitDetailScreen} />
      <AppStack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <AppStack.Screen name="TrucksSettings" component={TrucksScreen} />
      <AppStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <AppStack.Screen name="JurisdictionsSettings" component={JurisdictionsScreen} />
      <AppStack.Screen name="Disclaimer" component={DisclaimerScreen} />
    </AppStack.Navigator>
  );
}

/** Signed-in routing: onboarding until a businesses row exists, then full app tabs. */
function SignedInNavigator() {
  const { business } = useAuth();

  if (!business) {
    return <OnboardingFlowNavigator />;
  }
  return <MainAppNavigator />;
}

export function RootNavigator() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator accessibilityLabel="Loading session" color={colors.info} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!session ? <AuthStackNavigator /> : <SignedInNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
