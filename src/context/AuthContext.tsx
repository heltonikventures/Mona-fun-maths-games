import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { fetchProfileFromFirestore, saveProfileToFirestore } from '../firebase/db';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncProfile: (profile: UserProfile) => Promise<void>;
  onProfileSynced?: (cloudProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Attempt to load cloud profile
          const cloudProfile = await fetchProfileFromFirestore(currentUser.uid);
          if (cloudProfile) {
            // Restore cloud profile to learner
            onProfileLoaded(cloudProfile);
          } else {
            // First time login: back up local guest profile to Firestore!
            const newCloudProfile: UserProfile = {
              ...currentProfile,
              name: currentUser.displayName || currentProfile.name,
              avatar: currentProfile.avatar || '⭐',
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
        // Sync or restore profile
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
        console.log('Login popup was closed by student/user');
        return;
      }
      console.error('Google Sign-In Error:', error);
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
    if (user) {
      try {
        await saveProfileToFirestore(profile);
      } catch (err) {
        console.warn('Failed to sync profile to cloud:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        logout,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
