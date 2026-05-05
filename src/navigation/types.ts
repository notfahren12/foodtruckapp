export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  RequirementDetail: { requirementId: string };
  DocumentDetail: { documentId: string };
  AppointmentDetail: { appointmentId: string };
  Events: undefined;
  EventDetail: { eventId: string };
  Contacts: undefined;
  ManageTrucks: undefined;
  EditTruck: { truckId?: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Documents: undefined;
  Checklist: undefined;
  Settings: undefined;
};
