import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role?: 'user' | 'admin';
  full_name?: string;
  avatar_url?: string;
  email_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateProfile: (fullName: string, avatarUrl?: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAdmin: () => boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);

            // Fetch full profile
            const profileResponse = await fetch('/api/user/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              setUser(prev => prev ? { ...prev, ...profile } : null);
            }
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Supabase token auto-refresh — session renew ஆகும்போது localStorage update பண்ணு
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        localStorage.setItem('auth_token', session.access_token);
      }
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Signup failed');

      // Get session token
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.access_token) {
        localStorage.setItem('auth_token', sessionData.session.access_token);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'user',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('Login failed');

      // Get session token
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.access_token) {
        localStorage.setItem('auth_token', sessionData.session.access_token);

        // Fetch user profile from backend
        const response = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        });

        if (response.ok) {
          const profile = await response.json();
          setUser({
            id: data.user.id,
            email: data.user.email!,
            ...profile,
          });
        } else {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            role: 'user',
          });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await supabase.auth.signOut();
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    }
  };

  const verifyEmail = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token || !user?.email) throw new Error('Not authenticated');

      const { error } = await supabase.auth.resendEnrollmentEmail(user.email);
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Email verification failed';
      setError(message);
      throw err;
    }
  };

  const updateProfile = async (fullName: string, avatarUrl?: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Update failed');
      }

      const updated = await response.json();
      setUser(prev => prev ? { ...prev, ...updated } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      setError(message);
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Password change failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password change failed';
      setError(message);
      throw err;
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Account deletion failed');
      }

      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Account deletion failed';
      setError(message);
      throw err;
    }
  };

  const isAdmin = () => user?.role === 'admin';

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        resetPassword,
        verifyEmail,
        updateProfile,
        deleteAccount,
        changePassword,
        isAdmin,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
