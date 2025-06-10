'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/storage/supabase';
import { clearAllCookies } from '@/lib/utils';

// Global auth state cache to prevent unnecessary re-renders and multiple listeners
let globalUser: User | null = null;
let globalAuthLoading = true;
let globalAuthError: string | null = null;
let globalListeners: Array<() => void> = [];

// Helper to notify all listeners of auth state changes
const notifyListeners = () => {
  globalListeners.forEach(listener => listener());
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshAuth: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(globalAuthLoading);
  const [error, setError] = useState<string | null>(globalAuthError);

  const refreshAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      globalAuthLoading = true;
      globalAuthError = null;

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      const newUser = data.session?.user ?? null;
      globalUser = newUser;
      setUser(newUser);
      notifyListeners();
    } catch (error) {
      console.error('Error refreshing auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication error occurred';
      setError(errorMessage);
      globalAuthError = errorMessage;
      globalUser = null;
      setUser(null);
      notifyListeners();
    } finally {
      setLoading(false);
      globalAuthLoading = false;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      globalAuthLoading = true;
      
      await supabase.auth.signOut();
      
      globalUser = null;
      setUser(null);
      clearAllCookies();
      notifyListeners();
    } catch (error) {
      console.error('Error during logout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
      globalAuthError = errorMessage;
      notifyListeners();
    } finally {
      setLoading(false);
      globalAuthLoading = false;
    }
  };

  useEffect(() => {
    // Try to get session from localStorage first for immediate display
    try {
      if (typeof window !== 'undefined') {
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          if (parsed?.currentSession?.user) {
            globalUser = parsed.currentSession.user;
            setUser(parsed.currentSession.user);
          }
        }
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }

    // Register this component as a listener
    const listener = () => {
      setUser(globalUser);
      setLoading(globalAuthLoading);
      setError(globalAuthError);
    };
    globalListeners.push(listener);

    // Get initial session from server if we haven't already
    if (globalAuthLoading) {
      refreshAuth();
    }

    // Set up a single auth state listener that updates the global state
    const setupAuthListener = () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        globalUser = session?.user ?? null;
        globalAuthLoading = false;
        
        // Reset error on successful auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          globalAuthError = null;
        }
        
        notifyListeners();
      });

      return subscription;
    };

    const subscription = setupAuthListener();

    return () => {
      // Remove this component from listeners
      globalListeners = globalListeners.filter(l => l !== listener);
      
      // Unsubscribe from auth changes
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 