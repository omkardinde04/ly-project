import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDyslexia } from '../contexts/DyslexiaContext';
import { API_BASE } from '../config/api';
import { resetExtensionProfile } from '../utils/extensionBridge';

/**
 * Resets local assessment state and opens the test again. Shared by the
 * dashboard card and the sidebar.
 */
export function useRetakeAssessment() {
  const { user, token, updateUser } = useAuth();
  const { resetTest } = useDyslexia();
  const navigate = useNavigate();
  const [isRetaking, setIsRetaking] = useState(false);

  const retakeAssessment = useCallback(async () => {
    if (!token || !user) {
      navigate('/assessment');
      return;
    }
    setIsRetaking(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/assessment/retake`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        updateUser({
          assessment_completed: false,
          assessment_score: undefined,
          classification: undefined,
          reading_profile: undefined,
        });
        resetTest();
        localStorage.removeItem('temp_assessment');
        resetExtensionProfile();
        navigate('/assessment');
      } else {
        console.error(`Assessment reset failed with status ${response.status}.`);
        updateUser({
          assessment_completed: false,
          assessment_score: undefined,
          classification: undefined,
          reading_profile: undefined,
        });
        resetTest();
        localStorage.removeItem('temp_assessment');
        resetExtensionProfile();
        navigate('/assessment');
      }
    } catch (error) {
      console.error('Error retaking assessment:', error);
      updateUser({
        assessment_completed: false,
        assessment_score: undefined,
        classification: undefined,
        reading_profile: undefined,
      });
      resetTest();
      localStorage.removeItem('temp_assessment');
      resetExtensionProfile();
      navigate('/assessment');
    } finally {
      setIsRetaking(false);
    }
  }, [token, user, updateUser, resetTest, navigate]);

  return { retakeAssessment, isRetaking };
}
