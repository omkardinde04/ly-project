import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            setError('No reset token found. Please request a new password reset link.');
        } else {
            setTokenValid(true);
        }
    }, [token]);

    const passwordStrength = () => {
        if (!password) return null;
        if (password.length < 6) return { label: 'Too short', color: 'bg-red-400', width: '25%' };
        if (password.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: '50%' };
        if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: 'bg-yellow-400', width: '75%' };
        return { label: 'Strong', color: 'bg-green-400', width: '100%' };
    };
    const strength = passwordStrength();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:4000/api/auth/email/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setStatus('error');
                setError(data.error || 'Failed to reset password. The link may have expired.');
            }
        } catch {
            setStatus('error');
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-[#DBEAF5] -z-10" />

            <div className="flex justify-center items-center min-h-screen py-8 px-4">
                <div className="bg-white rounded-[40px] p-8 sm:p-10 w-full max-w-[480px] shadow-sm">

                    {/* No token case */}
                    {tokenValid === false && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h1 className="text-[24px] font-black text-[#1A202C] mb-3">Invalid Reset Link</h1>
                            <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed mb-6">
                                This password reset link is invalid or has expired. Please request a new one.
                            </p>
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors text-[16px]"
                            >
                                Request New Reset Link
                            </button>
                        </div>
                    )}

                    {/* Success state */}
                    {status === 'success' && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h1 className="text-[24px] font-black text-[#1A202C] mb-3">Password Reset!</h1>
                            <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed mb-4">
                                {message}
                            </p>
                            <div className="p-4 bg-blue-50 rounded-2xl mb-6">
                                <p className="text-blue-700 text-sm font-medium">
                                    Redirecting you to login in 3 seconds...
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors text-[16px]"
                            >
                                Go to Login Now →
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    {tokenValid === true && status !== 'success' && (
                        <>
                            <div className="mb-8">
                                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                                    <Lock className="w-7 h-7 text-purple-500" />
                                </div>
                                <h1 className="text-[26px] font-black text-[#1A202C] mb-2">Create New Password</h1>
                                <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed">
                                    Choose a strong password for your NeuroBridge account.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
                                    {error}
                                    {status === 'error' && (
                                        <div className="mt-3">
                                            <button
                                                onClick={() => navigate('/forgot-password')}
                                                className="text-blue-600 font-bold underline text-sm"
                                            >
                                                Request a new reset link →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-bold text-[#2A3B4C] mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <div className="bg-yellow-100 p-1 rounded-md">
                                                <Lock className="h-4 w-4 text-yellow-600 stroke-[2.5]" />
                                            </div>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            placeholder="Enter new password (min 6 chars)"
                                            required
                                            className="w-full pl-14 pr-12 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        >
                                            {showPassword
                                                ? <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                : <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            }
                                        </button>
                                    </div>
                                    {/* Password strength bar */}
                                    {strength && (
                                        <div className="mt-2">
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                                                    style={{ width: strength.width }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 font-medium">{strength.label}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-bold text-[#2A3B4C] mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <div className="bg-yellow-100 p-1 rounded-md">
                                                <Lock className="h-4 w-4 text-yellow-600 stroke-[2.5]" />
                                            </div>
                                        </div>
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                            placeholder="Re-enter your new password"
                                            required
                                            className={`w-full pl-14 pr-12 py-3.5 bg-[#F8FAFC] border rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
                                                confirmPassword && password !== confirmPassword
                                                    ? 'border-red-300 focus:ring-red-100'
                                                    : confirmPassword && password === confirmPassword
                                                        ? 'border-green-300 focus:ring-green-100'
                                                        : 'border-[#E2E8F0] focus:ring-blue-100'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        >
                                            {showConfirm
                                                ? <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                : <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            }
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">Passwords do not match</p>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <p className="text-green-500 text-xs mt-1 font-medium">✓ Passwords match</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !password || !confirmPassword}
                                    className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                            Resetting Password...
                                        </span>
                                    ) : 'Reset Password'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 text-[#5b6b79] hover:text-[#1A202C] font-bold text-[15px] transition-colors"
                                >
                                    ← Back to Login
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
