import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type AppRole = 'citizen' | 'engineer' | 'admin' | null;

interface AuthState {
  session: Session | null;
  user: User | null;
  role: AppRole;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    role: null,
    loading: true,
  });

  const fetchRole = async (user: User): Promise<AppRole> => {
    // 1. Check user_metadata
    if (user.user_metadata?.role) {
      return user.user_metadata.role as AppRole;
    }

    // 2. Check localStorage override if set during login
    const savedRole = localStorage.getItem(`civo_role_${user.id}`);
    if (savedRole && ['citizen', 'engineer', 'admin'].includes(savedRole)) {
      return savedRole as AppRole;
    }

    // 3. Query public.users table
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!error && data?.role) {
        return data.role as AppRole;
      }
    } catch (err) {
      console.error('Error fetching role from DB:', err);
    }

    // 4. Fallback based on email address pattern
    const email = user.email?.toLowerCase() || '';
    if (email.includes('admin')) return 'admin';
    if (email.includes('engineer')) return 'engineer';

    return 'citizen';
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          const role = await fetchRole(session.user);
          setState({ session, user: session.user, role, loading: false });
        } else {
          setState({ session: null, user: null, role: null, loading: false });
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) setState(s => ({ ...s, loading: false }));
      }
    }

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        // If user signs in, fetch role
        if (!state.user || state.user.id !== session.user.id) {
          setState(s => ({ ...s, loading: true }));
          const role = await fetchRole(session.user);
          setState({ session, user: session.user, role, loading: false });
        } else {
           setState(s => ({ ...s, session, user: session.user }));
        }
      } else {
        setState({ session: null, user: null, role: null, loading: false });
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
