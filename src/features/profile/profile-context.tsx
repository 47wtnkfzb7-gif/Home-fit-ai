// Provider et hook d'accès au profil — unique source de vérité du profil.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { getJson, setJson } from '@/services/db';
import { emptyProfile, type UserProfile } from './types';

const PROFILE_KEY = 'profile';

interface ProfileState {
  status: 'loading' | 'ready';
  profile: UserProfile | null;
}

interface ProfileContextValue extends ProfileState {
  save: (profile: UserProfile) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProfileState>(() => {
    try {
      const stored = getJson<UserProfile>(PROFILE_KEY);
      return { status: 'ready' as const, profile: stored ?? emptyProfile() };
    } catch {
      return { status: 'ready' as const, profile: emptyProfile() };
    }
  });

  const save = useCallback((profile: UserProfile) => {
    const stamped = { ...profile, updatedAt: new Date().toISOString() };
    setJson(PROFILE_KEY, stamped);
    setState({ status: 'ready', profile: stamped });
  }, []);

  const value = useMemo(() => ({ ...state, save }), [state, save]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile doit être utilisé dans ProfileProvider');
  return ctx;
}
