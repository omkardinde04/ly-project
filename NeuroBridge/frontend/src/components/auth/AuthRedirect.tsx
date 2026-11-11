import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AuthRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const redirectPath = urlParams.get('redirect') || '/dashboard';

    if (token) {
      const processLogin = async () => {
        // Login with the token (awaits user profile fetch)
        const loaded = await login(token);

        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        // Use the loaded account (a test taken before login may have just been linked)
        navigate(loaded ? (loaded.assessment_completed ? '/dashboard' : '/assessment') : redirectPath);
      };
      
      processLogin();
    } else {
      // No token found, redirect to login
      navigate('/login');
    }
  }, [login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg" style={{ color: 'var(--color-text)' }}>
          Signing you in...
        </p>
      </div>
    </div>
  );
};
