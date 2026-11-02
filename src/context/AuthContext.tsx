import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import {
  fetchProfileFromFirestore,
  saveProfileToFirestore,
  getOrCreateCloudSyncCode,
} from '../firebase/db';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  cloudSyncCode: string;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncProfile: (profile: UserProfile) => Promise<void>;
  onProfileSynced?: (cloudProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  cloudSyncCode: '',
  loginWithGoogle: async () => {},
  logout: async () => {},
  syncProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
  currentProfile: UserProfile;
  onProfileLoaded: (profile: UserProfile) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  currentProfile,
  onProfileLoaded,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudSyncCode, setCloudSyncCode] = useState<string>(() =>
    getOrCreateCloudSyncCode(currentProfile.name)
  );

  useEffect(() => {
    // Check if returning from redirect sign-in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          setUser(result.user);
          const cloudProfile = await fetchProfileFromFirestore(result.user.uid);
          if (cloudProfile) {
            onProfileLoaded(cloudProfile);
          } else {
            const initial: UserProfile = {
              ...currentProfile,
              name: result.user.displayName || currentProfile.name,
            };
            await saveProfileToFirestore(initial);
            onProfileLoaded(initial);
          }
        }
      })
      .catch((err) => {
        console.warn('Redirect sign-in check:', err?.message || err);
      });

    // Listen to Auth State Changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const cloudProfile = await fetchProfileFromFirestore(currentUser.uid);
          if (cloudProfile) {
            onProfileLoaded(cloudProfile);
          } else {
            const newCloudProfile: UserProfile = {
              ...currentProfile,
              name: currentUser.displayName || currentProfile.name,
            };
            await saveProfileToFirestore(newCloudProfile);
            onProfileLoaded(newCloudProfile);
          }
        } catch (err) {
          console.warn('Could not sync profile with Firestore:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        const cloudProfile = await fetchProfileFromFirestore(result.user.uid);
        if (cloudProfile) {
          onProfileLoaded(cloudProfile);
        } else {
          const initial: UserProfile = {
            ...currentProfile,
            name: result.user.displayName || currentProfile.name,
          };
          await saveProfileToFirestore(initial);
          onProfileLoaded(initial);
        }
      }
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.warn('Google Sign-In Attempt:', error?.code || error?.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const syncProfile = async (profile: UserProfile) => {
    try {
      await saveProfileToFirestore(profile);
      setCloudSyncCode(getOrCreateCloudSyncCode(profile.name));
    } catch (err) {
      console.warn('Failed to sync profile to cloud:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cloudSyncCode,
        loginWithGoogle,
        logout,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
