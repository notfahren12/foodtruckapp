export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  PermitDetail: { permitId: string };
  BusinessProfile: undefined;
  TrucksSettings: undefined;
  NotificationSettings: undefined;
  JurisdictionsSettings: undefined;
  Disclaimer: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Permits: undefined;
  Documents: undefined;
  Inspections: undefined;
  Settings: undefined;
};
