import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  google_id?: string;
  name: string;
  email: string;
  profile_picture?: string;
  assessment_completed: boolean;
  assessment_score?: number;
  classification?: string;
  email_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user data from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  // Save token and user data to localStorage whenever they change
  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = async (newToken: string): Promise<void> => {
    setToken(newToken);
    setIsLoading(true);

    try {
      // Both email-auth and Google-auth users use the same JWT format.
      // We try /api/auth/email/me first (works for all users), fall back to /google/me.
      let userData = null;

      const tryFetch = async (url: string) => {
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${newToken}` },
        });
        if (res.ok) return res.json();
        return null;
      };

      userData = await tryFetch('http://localhost:4000/api/auth/email/me');
      if (!userData) {
        userData = await tryFetch('http://localhost:4000/api/auth/google/me');
      }

      if (!userData) {
        throw new Error('Could not load user profile. Please log in again.');
      }

      console.log('✅ User profile loaded:', userData.email);

      // Link any pre-login (anonymous) assessment to this account
      const tempAssessment = localStorage.getItem('temp_assessment');
      if (tempAssessment && !userData.assessment_completed) {
        const assessmentData = JSON.parse(tempAssessment);
        const assessmentResponse = await fetch('http://localhost:4000/api/auth/google/assessment/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
          body: JSON.stringify({
            assessment_score: assessmentData.score,
            classification: assessmentData.classification,
          }),
        });

        if (assessmentResponse.ok) {
          localStorage.removeItem('temp_assessment');
          const updatedData = await tryFetch('http://localhost:4000/api/auth/email/me');
          if (updatedData) userData = updatedData;
        }
      }

      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      logout(); // Clear token if user data fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear all localStorage entries
    localStorage.clear();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
