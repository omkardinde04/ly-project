import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTranslation } from '../../utils/translations';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

export function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const { language } = useDyslexia();
    const t = getTranslation(language);

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
                setMessage('Password reset successfully. Redirecting to login...');
                setTimeout(() => navigate('/login'), 2500);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#DBEAF5] -z-10 flex justify-center items-center py-4 px-4 sm:px-0">
            <div className="bg-white rounded-[40px] p-8 sm:p-10 w-full max-w-[480px] shadow-sm">
                <div className="mb-6">
                    <h1 className="text-[26px] font-black text-[#1A202C] mb-2">Create New Password</h1>
                    <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed">
                        Enter your new password below.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-[#2A3B4C] mb-2">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <div className="bg-yellow-100 p-1 rounded-md">
                                    <Lock className="h-4 w-4 text-yellow-600 stroke-[2.5]" />
                                </div>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                className="w-full pl-14 pr-12 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                            >
                                {showPassword ? (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                ) : (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-[#2A3B4C] mb-2">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <div className="bg-yellow-100 p-1 rounded-md">
                                    <Lock className="h-4 w-4 text-yellow-600 stroke-[2.5]" />
                                </div>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                className="w-full pl-14 pr-12 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
