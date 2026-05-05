import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { mockData } from '../data/mockData';
import { calculateComplianceScore } from '../lib/compliance';
import { Appointment, Contact, DocumentRecord, EventRecord, InspectionResult, Requirement, Truck } from '../types/models';

type TruckScope = 'all' | string;

type AppContextValue = {
  data: typeof mockData;
  selectedTruckId: TruckScope;
  selectedTruck: Truck | null;
  scopeLabel: string;
  hasCompletedOnboarding: boolean;
  setSelectedTruckId: (truckId: TruckScope) => void;
  completeOnboarding: () => void;
  reopenOnboarding: () => void;
  scopedRequirements: Requirement[];
  scopedDocuments: DocumentRecord[];
  scopedAppointments: Appointment[];
  scopedEvents: EventRecord[];
  scopedContacts: Contact[];
  scopedInspectionResults: InspectionResult[];
  getTruckCompliance: (truckId: string) => ReturnType<typeof calculateComplianceScore>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [selectedTruckId, setSelectedTruckId] = useState<TruckScope>('all');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const selectedTruck = useMemo(
    () => mockData.trucks.find((truck) => truck.id === selectedTruckId) ?? null,
    [selectedTruckId],
  );

  const scopedRequirements = useMemo(() => {
    if (selectedTruckId === 'all') return mockData.requirements;
    return mockData.requirements.filter(
      (requirement) => !requirement.truckId || requirement.truckId === selectedTruckId,
    );
  }, [selectedTruckId]);

  const scopedDocuments = useMemo(() => {
    if (selectedTruckId === 'all') return mockData.documents;
    return mockData.documents.filter((document) => !document.truckId || document.truckId === selectedTruckId);
  }, [selectedTruckId]);

  const scopedAppointments = useMemo(() => {
    if (selectedTruckId === 'all') return mockData.appointments;
    return mockData.appointments.filter(
      (appointment) => !appointment.truckId || appointment.truckId === selectedTruckId,
    );
  }, [selectedTruckId]);

  const scopedEvents = useMemo(() => {
    if (selectedTruckId === 'all') return mockData.events;
    return mockData.events.filter((event) => event.assignedTruckIds.includes(selectedTruckId));
  }, [selectedTruckId]);

  const scopedContacts = useMemo(() => {
    if (selectedTruckId === 'all') return mockData.contacts;
    return mockData.contacts.filter((contact) => !contact.truckId || contact.truckId === selectedTruckId);
  }, [selectedTruckId]);

  const scopedInspectionResults = useMemo(() => {
    if (selectedTruckId === 'all') return mockData.inspectionResults;
    return mockData.inspectionResults.filter((result) => result.truckId === selectedTruckId);
  }, [selectedTruckId]);

  const value = useMemo<AppContextValue>(
    () => ({
      data: mockData,
      selectedTruckId,
      selectedTruck,
      scopeLabel: selectedTruck ? selectedTruck.name : 'All Trucks',
      hasCompletedOnboarding,
      setSelectedTruckId,
      completeOnboarding: () => setHasCompletedOnboarding(true),
      reopenOnboarding: () => setHasCompletedOnboarding(false),
      scopedRequirements,
      scopedDocuments,
      scopedAppointments,
      scopedEvents,
      scopedContacts,
      scopedInspectionResults,
      getTruckCompliance: (truckId) =>
        calculateComplianceScore(
          mockData.requirements.filter((requirement) => requirement.truckId === truckId),
          mockData.documents.filter((document) => document.truckId === truckId),
          mockData.inspectionResults.filter((result) => result.truckId === truckId),
        ),
    }),
    [
      hasCompletedOnboarding,
      scopedAppointments,
      scopedContacts,
      scopedDocuments,
      scopedEvents,
      scopedInspectionResults,
      scopedRequirements,
      selectedTruck,
      selectedTruckId,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppProvider');
  }

  return context;
}
