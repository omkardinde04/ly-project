import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_BASE } from '../config/api';
import { generateReadingProfile } from '../utils/profileGenerator';

export interface User {
  id: number;
  google_id?: string;
  name: string;
  email: string;
  profile_picture?: string;
  assessment_completed: boolean;
  assessment_score?: number;
  classification?: string;
  reading_profile?: any;
  email_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  /** Loads the profile (linking a pre-login test) and returns it, or null on failure */
  login: (token: string) => Promise<User | null>;
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
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser?.reading_profile && !localStorage.getItem('nbReadingProfile')) {
          localStorage.setItem('nbReadingProfile', JSON.stringify(parsedUser.reading_profile));
        }
      }
    } catch (err) {
      console.warn('Could not read user session from storage:', err);
    }
    
    setIsLoading(false);
  }, []);

  // Save token and user data to localStorage whenever they change
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (err) {
      console.warn('Could not persist auth_token to localStorage:', err);
    }
  }, [token]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('auth_user');
      }
    } catch (err) {
      console.warn('Could not persist auth_user to localStorage (quota exceeded?):', err);
      // In case quota is exceeded, strip out huge profile picture to preserve user session
      try {
        if (user) {
          const safeUser = { ...user, profile_picture: undefined };
          localStorage.setItem('auth_user', JSON.stringify(safeUser));
        }
      } catch (safeErr) {
        console.warn('Could not persist fallback user to localStorage:', safeErr);
      }
    }
  }, [user]);

  const login = async (newToken: string): Promise<User | null> => {
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

      userData = await tryFetch(`${API_BASE}/api/auth/email/me`);
      if (!userData) {
        userData = await tryFetch(`${API_BASE}/api/auth/google/me`);
      }

      if (!userData) {
        throw new Error('Could not load user profile. Please log in again.');
      }

      console.log('✅ User profile loaded:', userData.email);

      // Link any pre-login (anonymous) assessment to this account
      const tempAssessment = localStorage.getItem('temp_assessment');
      if (tempAssessment) {
        try {
          const assessmentData = JSON.parse(tempAssessment);
          const pendingProfile = assessmentData?.readingProfile || assessmentData?.reading_profile;
          if (pendingProfile) {
            localStorage.setItem('nbReadingProfile', JSON.stringify(pendingProfile));
          }
          if (!userData.assessment_completed) {
            const assessmentResponse = await fetch(`${API_BASE}/api/auth/google/assessment/complete`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              body: JSON.stringify({
                assessment_score: assessmentData.score,
                classification: assessmentData.classification,
                assessment_metrics: assessmentData.metrics ? JSON.stringify(assessmentData.metrics) : undefined,
                reading_profile: pendingProfile || undefined,
              }),
            });

            if (assessmentResponse.ok) {
              localStorage.removeItem('temp_assessment');
              const updatedData = await tryFetch(`${API_BASE}/api/auth/email/me`);
              if (updatedData) userData = updatedData;
            }
          }
        } catch (e) {
          console.warn('Failed parsing temp_assessment:', e);
        }
      }

      // Hydrate reading profile from backend if user already has one saved
      if (userData?.reading_profile) {
        localStorage.setItem('nbReadingProfile', JSON.stringify(userData.reading_profile));
      } else if (userData?.assessment_completed) {
        // If user completed assessment on backend but has no saved reading_profile, generate and persist to backend
        try {
          const rawProfile = localStorage.getItem('nbReadingProfile');
          let profileToSave = null;
          if (rawProfile) {
            profileToSave = JSON.parse(rawProfile);
          } else {
            const savedSettings = localStorage.getItem('dyslexiaSettings');
            const parsed = savedSettings ? JSON.parse(savedSettings) : null;
            profileToSave = generateReadingProfile({
              indicatorScore: typeof userData.assessment_score === 'number' ? userData.assessment_score : 25,
              cognitiveProfile: parsed?.cognitiveProfile || null,
            });
            localStorage.setItem('nbReadingProfile', JSON.stringify(profileToSave));
          }

          if (profileToSave) {
            fetch(`${API_BASE}/api/auth/google/reading-profile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`,
              },
              body: JSON.stringify({ reading_profile: profileToSave }),
            }).catch(() => {});
            userData.reading_profile = profileToSave;
          }
        } catch (_) {}
      }

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error loading user profile:', error);
      logout(); // Clear token if user data fetch fails
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // Clear only authentication session; NEVER wipe out accessibility preferences or reading profile
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('temp_assessment');
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
