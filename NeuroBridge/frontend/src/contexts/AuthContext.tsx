import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  google_id: string;
  name: string;
  email: string;
  profile_picture: string;
  assessment_completed: boolean;
  assessment_score?: number;
  classification?: string;
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
      // Fetch user data with the new token
      const response = await fetch('http://localhost:4000/api/auth/google/me', {
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let userData = await response.json();
      console.log('User data fetched:', userData);
      
      // Check for temporary assessment data and link it
      const tempAssessment = localStorage.getItem('temp_assessment');
      if (tempAssessment && !userData.assessment_completed) {
        const assessmentData = JSON.parse(tempAssessment);
        console.log('Linking temporary assessment to user:', assessmentData);
        
        // Save assessment to database
        const assessmentResponse = await fetch('http://localhost:4000/api/auth/google/assessment/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify({
            assessment_score: assessmentData.score,
            classification: assessmentData.classification
          })
        });
        
        if (assessmentResponse && assessmentResponse.ok) {
          console.log('Assessment linked successfully');
          // Clear temporary assessment
          localStorage.removeItem('temp_assessment');
          // Fetch updated user data
          const updatedResponse = await fetch('http://localhost:4000/api/auth/google/me', {
            headers: {
              'Authorization': `Bearer ${newToken}`
            }
          });
          const updatedUserData = await updatedResponse.json();
          if (updatedUserData) {
            userData = updatedUserData;
          }
        }
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout(); // Clear token if user data fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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
