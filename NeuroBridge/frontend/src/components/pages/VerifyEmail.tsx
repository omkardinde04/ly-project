import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing verification token.');
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/api/auth/email/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. The link may have expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="fixed inset-0 bg-[#DBEAF5] -z-10 flex justify-center items-center py-4 px-4 sm:px-0">
      <div className="bg-white rounded-[40px] p-8 sm:p-10 w-full max-w-[480px] shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-[26px] font-black text-[#1A202C] mb-2">Email Verification</h1>
          <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed">
            We're verifying your email address...
          </p>
        </div>

        <div className="flex justify-center mb-8">
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-[#5b6b79] font-medium">Verifying...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-green-700 font-bold">Email Verified!</p>
                <p className="text-[#5b6b79] text-sm mt-1">Your account is now active.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center">
                <p className="text-red-700 font-bold">Verification Failed</p>
              </div>
            </div>
          )}
        </div>

        <div className={`mb-6 p-4 rounded-lg text-center text-sm font-medium ${
          status === 'verifying' ? 'bg-blue-50 text-blue-700' :
          status === 'success' ? 'bg-green-50 text-green-700' :
          'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>

        {status === 'success' && (
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-[16px]"
          >
            Go to Login →
          </button>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-[16px]"
            >
              Back to Login →
            </button>
            <button
              onClick={() => navigate('/login', { state: { createAccount: true } })}
              className="w-full py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl shadow-sm transition-colors text-[16px]"
            >
              Try Again with Different Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
