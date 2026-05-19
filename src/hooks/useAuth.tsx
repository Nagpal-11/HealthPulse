import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    // Handle redirect result
    getRedirectResult(auth).catch((err) => {
      console.error('Redirect result error:', err);
    });

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        
        // Listen for real-time profile updates
        unsubProfile = onSnapshot(docRef, async (snap) => {
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            // Only create if it doesn't exist (e.g. first login)
            const newProfile = {
              userId: u.uid,
              name: u.displayName || 'User',
              email: u.email,
              avatar: u.photoURL,
              role: 'patient',
              createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        });
      } else {
        setProfile(null);
        if (unsubProfile) unsubProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    const currentDomain = window.location.hostname;
    
    console.log('Attempting sign in on domain:', currentDomain);

    try {
      // Try popup first
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign in error details:', {
        code: err.code,
        message: err.message,
        domain: currentDomain
      });
      
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/internal-error' || err.code === 'auth/network-request-failed') {
        console.log('Popup failed or closed, trying redirect as fallback...');
        try {
          // Before redirecting, alert the user about the domain requirement if it's likely an authorization issue
          if (err.code === 'auth/internal-error' && !currentDomain.includes('firebaseapp.com')) {
             alert(`Sign-in issue detected.\n\nPlease ensure "${currentDomain}" is added to "Authorized Domains" in Firebase Console > Authentication > Settings.\n\nTrying an alternative method now...`);
          }
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          console.error('Redirect error:', redirectErr);
          alert(`Sign in failed: ${redirectErr.message}\nDomain: ${currentDomain}`);
        }
        return;
      }

      if (err.code === 'auth/unauthorized-domain') {
        alert(`ACCESS DENIED: The domain "${currentDomain}" is not authorized in your Firebase project.\n\nPlease go to Firebase Console > Authentication > Settings > Authorized Domains and add: ${currentDomain}`);
      } else {
        alert(`Sign in error (${err.code}): ${err.message}`);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
