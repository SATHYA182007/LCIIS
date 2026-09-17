import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../lib/seedData';
import { auth, isFirebaseConfigured, rtdb } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { cleanUndefined } from '../services/firebaseService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  signup: (email: string, password?: string, name?: string, role?: UserRole, employeeId?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lciis_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEMO_USERS[0];
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync Firebase Auth session listener
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        // Try to fetch profile from RTDB
        if (rtdb) {
          try {
            const userRef = ref(rtdb, `users/${fbUser.uid}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
              const profile = snapshot.val() as UserProfile;
              setUser(profile);
              localStorage.setItem('lciis_auth_user', JSON.stringify(profile));
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Error fetching user profile from Firebase:', e);
          }
        }

        // Fallback user profile from Firebase User credentials
        const fallbackProfile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0].toUpperCase() : 'CLINICAL USER'),
          role: 'doctor',
          department: 'Clinical Operations',
          createdAt: new Date().toISOString()
        };
        setUser(fallbackProfile);
        localStorage.setItem('lciis_auth_user', JSON.stringify(fallbackProfile));
      } else {
        // User signed out in Firebase
        const saved = localStorage.getItem('lciis_auth_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // If saved user was from Firebase, clear it
            if (parsed.id?.startsWith('fb-') || parsed.id?.length > 20) {
              setUser(null);
              localStorage.removeItem('lciis_auth_user');
            }
          } catch (e) { /* ignore */ }
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lciis_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lciis_auth_user');
    }
  }, [user]);

  const checkAccountStatus = (userProfile: UserProfile) => {
    const status = userProfile.status || (userProfile.approvalStatus === 'PENDING' ? 'PENDING' : 'ACTIVE');
    if (userProfile.approvalStatus === 'PENDING' || status === 'PENDING') {
      throw new Error('Access Pending: Your registration is awaiting Administrator approval. You will be able to log in once an Admin approves your account.');
    }
    if (status === 'FROZEN') {
      throw new Error('Account Frozen: Your access has been temporarily suspended by the Administrator.');
    }
    if (status === 'RESTRICTED') {
      throw new Error('Account Restricted: Your account access has been restricted by system administration.');
    }
    if (status === 'REVOKED') {
      throw new Error('Access Revoked: Your account credentials have been removed by the Administrator.');
    }
    if (status === 'INACTIVE') {
      throw new Error('Account Deactivated: Your profile is currently inactive.');
    }
  };

  const login = async (email: string, password?: string, selectedRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);

    // Check existing stored user records in localStorage
    const savedAll = localStorage.getItem('lciis_all_users');
    let allUsersList: UserProfile[] = DEMO_USERS;
    if (savedAll) {
      try {
        const parsed = JSON.parse(savedAll);
        if (Array.isArray(parsed)) allUsersList = parsed;
      } catch (e) { /* ignore */ }
    }

    const localMatch = allUsersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const demoMatch = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const matchedProfile = localMatch || demoMatch;

    if (matchedProfile) {
      checkAccountStatus(matchedProfile);
    }

    if (isFirebaseConfigured() && auth && password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        let userProfile: UserProfile | null = matchedProfile || null;
        if (rtdb) {
          try {
            const userRef = ref(rtdb, `users/${fbUser.uid}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
              userProfile = snapshot.val() as UserProfile;
            }
          } catch (err) {
            console.warn('Could not read user profile from RTDB:', err);
          }
        }

        if (!userProfile) {
          userProfile = {
            id: fbUser.uid,
            email: fbUser.email || email,
            name: fbUser.displayName || (matchedProfile ? matchedProfile.name : email.split('@')[0].toUpperCase()),
            role: selectedRole || (matchedProfile ? matchedProfile.role : 'doctor'),
            employeeId: matchedProfile?.employeeId,
            department: matchedProfile ? matchedProfile.department : 'Clinical Operations',
            status: 'ACTIVE',
            approvalStatus: 'APPROVED',
            createdAt: new Date().toISOString()
          };
          if (rtdb) {
            await set(ref(rtdb, `users/${fbUser.uid}`), cleanUndefined(userProfile)).catch(() => {});
          }
        }

        checkAccountStatus(userProfile);

        setUser(userProfile);
        setIsLoading(false);
        return true;
      } catch (error: any) {
        if (error.message && error.message.startsWith('Account') || error.message?.startsWith('Access')) {
          setIsLoading(false);
          throw error;
        }

        // If login failed because demo user is not registered in Firebase Auth yet, try creating account automatically!
        if (matchedProfile && (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found')) {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const fbUser = userCredential.user;
            const userProfile: UserProfile = {
              ...matchedProfile,
              id: fbUser.uid,
              email: fbUser.email || email,
            };
            if (rtdb) {
              await set(ref(rtdb, `users/${fbUser.uid}`), cleanUndefined(userProfile)).catch(() => {});
            }
            setUser(userProfile);
            setIsLoading(false);
            return true;
          } catch (createErr) {
            setUser(matchedProfile);
            setIsLoading(false);
            return true;
          }
        }

        // Fallback for demo users
        if (matchedProfile) {
          setUser(matchedProfile);
          setIsLoading(false);
          return true;
        }

        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
          setIsLoading(false);
          throw new Error('Email/Password Sign-In is not enabled in Firebase Console yet. Go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.');
        }

        setIsLoading(false);
        throw new Error(error.message || 'Firebase authentication failed.');
      }
    }

    // Fallback for local users
    if (matchedProfile) {
      setUser(matchedProfile);
      setIsLoading(false);
      return true;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0].toUpperCase(),
      role: selectedRole || 'doctor',
      department: 'Clinical Operations',
      status: 'ACTIVE',
      approvalStatus: 'APPROVED',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const signup = async (
    email: string,
    password?: string,
    name?: string,
    role?: UserRole,
    employeeId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    const userRole = role || 'doctor';
    const userName = name || email.split('@')[0].toUpperCase();

    if (userRole === 'admin') {
      setIsLoading(false);
      throw new Error('Admin privileges must be provisioned through secure administrator authorization.');
    }

    try {
      let uid = `user-${Date.now()}`;
      if (isFirebaseConfigured() && auth && password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
      }

      const newProfile: UserProfile = {
        id: uid,
        email,
        name: userName,
        role: userRole,
        employeeId: employeeId || (userRole === 'receptionist' ? 'REC001' : undefined),
        department: userRole === 'receptionist' ? 'Admissions & Desk' : 'Hospital Staff',
        status: 'PENDING',
        approvalStatus: 'PENDING',
        registeredAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      if (rtdb) {
        await set(ref(rtdb, `users/${uid}`), newProfile).catch((err) =>
          console.warn('Could not save user profile to RTDB:', err)
        );
      }

      // Add to localStorage list so admin sees pending user in RealtimeContext
      const savedAll = localStorage.getItem('lciis_all_users');
      let currentUsers: UserProfile[] = DEMO_USERS;
      if (savedAll) {
        try {
          const parsed = JSON.parse(savedAll);
          if (Array.isArray(parsed)) currentUsers = parsed;
        } catch (e) { /* ignore */ }
      }

      const updatedUsers = [...currentUsers.filter((u) => u.email.toLowerCase() !== email.toLowerCase()), newProfile];
      localStorage.setItem('lciis_all_users', JSON.stringify(updatedUsers));

      // Clear current logged in session so pending user is NOT logged in
      setUser(null);
      localStorage.removeItem('lciis_auth_user');

      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password Sign-Up is not enabled in Firebase Console yet. Go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.');
      }
      throw new Error(error.message || 'Firebase sign up failed.');
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (!email) throw new Error('Please enter your account email address.');
    if (isFirebaseConfigured() && auth) {
      await sendPasswordResetEmail(auth, email);
      return true;
    }
    // Simulation fallback
    return true;
  };

  const logout = () => {
    if (isFirebaseConfigured() && auth) {
      firebaseSignOut(auth).catch((err) => console.warn('Firebase SignOut notice:', err));
    }
    setUser(null);
    localStorage.removeItem('lciis_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
