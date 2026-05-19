import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
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

    // Ensure persistence is set
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error('Persistence error:', err);
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
      // Force popup for better compatibility with iframe-based previews if sanitized
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign in error details:', {
        code: err.code,
        message: err.message,
        domain: currentDomain
      });
      
      // If popup is blocked
      if (err.code === 'auth/popup-blocked') {
        alert('SIGN IN BLOCKED: Your browser blocked the sign-in popup. Please click "Allow popups" in the address bar and try again.');
        return;
      }

      // If network fails (common in restricted iframes)
      if (err.code === 'auth/network-request-failed') {
        alert('CONNECTION ERROR: Firebase cannot connect. This often happens in private window or when third-party cookies are blocked.\n\nPRO TIP: Try opening the app in a "New Tab" (button in the top right) to fix this!');
        return;
      }

      if (err.code === 'auth/unauthorized-domain') {
        const projectId = auth.app.options.projectId;
        alert(`ACCESS DENIED: The domain "${currentDomain}" is not authorized in your Firebase project (${projectId}).\n\nPlease go to Firebase Console > Authentication > Settings > Authorized Domains and add: ${currentDomain}`);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        alert(`Sign in error (${err.code}): ${err.message}\n\nIf this persists, try opening the app in a new tab.`);
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
