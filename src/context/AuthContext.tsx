import type { Dispatch, SetStateAction } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  BusinessRow,
  ProfileRow,
  TruckRow,
  ensureProfileForAuthUser,
  getMyBusiness,
  getMyProfile,
  getMyTrucks,
} from '../lib/db';
import { supabase } from '../lib/supabase';

type SignUpResult = {
  error: string | null;
  needsEmailConfirmation: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  business: BusinessRow | null;
  trucks: TruckRow[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signOut: () => Promise<{ error: string | null }>;
  refreshBusiness: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resetWorkspace(
  setProfile: Dispatch<SetStateAction<ProfileRow | null>>,
  setBusiness: Dispatch<SetStateAction<BusinessRow | null>>,
  setTrucks: Dispatch<SetStateAction<TruckRow[]>>,
) {
  setProfile(null);
  setBusiness(null);
  setTrucks([]);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [business, setBusiness] = useState<BusinessRow | null>(null);
  const [trucks, setTrucks] = useState<TruckRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSeq = useRef(0);
  const activeUserIdRef = useRef<string | null>(null);
  activeUserIdRef.current = session?.user?.id ?? null;

  const user = session?.user ?? null;

  const loadOrgForUser = useCallback(
    async (sessionUser: User, visibility: 'blocking' | 'silent') => {
      const requestId = visibility === 'blocking' ? ++loadSeq.current : loadSeq.current;

      if (visibility === 'blocking') {
        setLoading(true);
      }

      try {
        const ensure = await ensureProfileForAuthUser(sessionUser);
        if (visibility === 'blocking' && requestId !== loadSeq.current) return;
        if (visibility === 'silent' && activeUserIdRef.current !== sessionUser.id) return;
        if (ensure.error) {
          console.warn('ensureProfileForAuthUser:', ensure.error.message);
        }

        const profRes = await getMyProfile(sessionUser.id);
        if (visibility === 'blocking' && requestId !== loadSeq.current) return;
        if (visibility === 'silent' && activeUserIdRef.current !== sessionUser.id) return;
        if (profRes.error) {
          console.warn('getMyProfile:', profRes.error.message);
          setProfile(null);
        } else {
          setProfile(profRes.data);
        }

        const biz = await getMyBusiness(sessionUser.id);
        if (visibility === 'blocking' && requestId !== loadSeq.current) return;
        if (visibility === 'silent' && activeUserIdRef.current !== sessionUser.id) return;
        setBusiness(biz);

        if (biz?.id) {
          const truckRes = await getMyTrucks(biz.id);
          if (visibility === 'blocking' && requestId !== loadSeq.current) return;
          if (visibility === 'silent' && activeUserIdRef.current !== sessionUser.id) return;
          if (truckRes.error) {
            console.warn('getMyTrucks:', truckRes.error.message);
            setTrucks([]);
          } else {
            setTrucks(truckRes.data);
          }
        } else {
          setTrucks([]);
        }
      } finally {
        if (visibility === 'blocking' && requestId === loadSeq.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const reconcileSession = useCallback(
    async (nextSession: Session | null) => {
      const nextUserId = nextSession?.user?.id ?? null;
      activeUserIdRef.current = nextUserId;

      setSession(nextSession);
      const sessionUser = nextSession?.user ?? null;

      if (!sessionUser?.id) {
        loadSeq.current += 1;
        resetWorkspace(setProfile, setBusiness, setTrucks);
        setLoading(false);
        return;
      }

      await loadOrgForUser(sessionUser, 'blocking');
    },
    [loadOrgForUser],
  );

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        console.warn('getSession:', error.message);
        await reconcileSession(null);
        return;
      }
      await reconcileSession(data.session ?? null);
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void reconcileSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [reconcileSession]);

  const refreshBusiness = useCallback(async () => {
    if (!session?.user) return;
    await loadOrgForUser(session.user, 'silent');
  }, [loadOrgForUser, session?.user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    return { error: error ? error.message : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
      },
    });

    if (error) {
      return { error: error.message, needsEmailConfirmation: true };
    }

    const createdUser = data.user;
    if (!createdUser) {
      return {
        error: null,
        needsEmailConfirmation: !data.session,
      };
    }

    const profilePayload = {
      id: createdUser.id,
      email: createdUser.email ?? trimmedEmail,
      full_name: trimmedName,
    };

    const { error: profileError } = await supabase.from('profiles').upsert(profilePayload, {
      onConflict: 'id',
    });

    if (profileError) {
      return {
        error: `Account created but profile could not be saved: ${profileError.message}. Try signing in, or confirm email verification is complete.`,
        needsEmailConfirmation: !data.session,
      };
    }

    return { error: null, needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      business,
      trucks,
      loading,
      signIn,
      signUp,
      signOut,
      refreshBusiness,
    }),
    [
      business,
      loading,
      profile,
      refreshBusiness,
      session,
      signIn,
      signOut,
      signUp,
      trucks,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
