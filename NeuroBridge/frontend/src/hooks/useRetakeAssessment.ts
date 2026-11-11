import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config/api';

/**
 * Clears the saved assessment result on the server and sends the student to
 * /assessment to take it again. Shared by the dashboard card and the sidebar.
 */
export function useRetakeAssessment() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isRetaking, setIsRetaking] = useState(false);

  const retakeAssessment = useCallback(async () => {
    if (!token || !user) {
      navigate('/assessment');
      return;
    }
    setIsRetaking(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/google/assessment/retake`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        updateUser({ assessment_completed: false, assessment_score: undefined });
        navigate('/assessment');
      } else {
        console.error('Failed to retake assessment');
      }
    } catch (error) {
      console.error('Error retaking assessment:', error);
    } finally {
      setIsRetaking(false);
    }
  }, [token, user, updateUser, navigate]);

  return { retakeAssessment, isRetaking };
}
