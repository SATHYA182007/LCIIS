import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../lib/seedData';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (email: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lciis_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default to doctor account
    return DEMO_USERS[0];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lciis_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lciis_auth_user');
    }
  }, [user]);

  const login = async (email: string, selectedRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Match demo users or create user profile
    const match = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setUser(match);
      setIsLoading(false);
      return true;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0].toUpperCase(),
      role: selectedRole || 'doctor',
      department: 'Clinical Operations',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const signup = async (email: string, name: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (role === 'admin') {
      setIsLoading(false);
      throw new Error('Admin privileges must be provisioned through secure administrator authorization.');
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      department: 'Hospital Staff',
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    setIsLoading(false);
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
        logout,
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
