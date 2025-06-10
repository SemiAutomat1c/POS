'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/storage/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get session from localStorage first for immediate display
    try {
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed?.currentSession?.user) {
          setUser(parsed.currentSession.user);
        }
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }

    // Get initial session from server
    refreshAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 