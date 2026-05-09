import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { MOCK_TRUCKS } from '../data/mockCompliance';

export type BusinessProfile = {
  businessName: string;
  ownerName: string;
  city: string;
  county: string;
  truckCount: number;
  primaryOperatingCities: string;
};

type AppContextValue = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  businessProfile: BusinessProfile | null;
  selectedTruckId: string | null;
  signIn: () => void;
  signUp: () => void;
  signOut: () => void;
  completeOnboarding: (profile: BusinessProfile) => void;
  resetOnboardingPreview: () => void;
  setSelectedTruckId: (truckId: string | null) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const emptyProfile: BusinessProfile = {
  businessName: '',
  ownerName: '',
  city: '',
  county: '',
  truckCount: 1,
  primaryOperatingCities: '',
};

export function AppProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(MOCK_TRUCKS[0]?.id ?? null);

  const value = useMemo<AppContextValue>(
    () => ({
      isAuthenticated,
      hasCompletedOnboarding,
      businessProfile,
      selectedTruckId,
      signIn: () => setIsAuthenticated(true),
      signUp: () => {
        setIsAuthenticated(true);
        setHasCompletedOnboarding(false);
        setBusinessProfile(null);
      },
      signOut: () => {
        setIsAuthenticated(false);
      },
      completeOnboarding: (profile) => {
        setBusinessProfile(profile);
        setHasCompletedOnboarding(true);
      },
      resetOnboardingPreview: () => {
        setBusinessProfile(null);
        setHasCompletedOnboarding(false);
      },
      setSelectedTruckId,
    }),
    [businessProfile, hasCompletedOnboarding, isAuthenticated, selectedTruckId],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used inside AppProvider');
  }
  return ctx;
}

export { emptyProfile };
