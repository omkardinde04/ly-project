import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '../../utils/translations';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { User } from 'lucide-react';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { language } = useDyslexia();
    const t = getTranslation(language);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('http://localhost:4000/api/auth/email/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message);
            } else {
                setError(data.error || 'Failed to send reset email');
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
                    <h1 className="text-[26px] font-black text-[#1A202C] mb-2">Forgot Password</h1>
                    <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed">
                        Enter your email address and we'll send you a link to reset your password.
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
                        <label className="block text-sm font-bold text-[#2A3B4C] mb-2">{t.emailLabel}</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <div className="bg-orange-100 p-1 rounded-full">
                                    <User className="h-4 w-4 text-orange-500 stroke-[2.5]" />
                                </div>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t.emailPlaceholder}
                                required
                                className="w-full pl-14 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full mt-2 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl shadow-sm transition-colors text-[16px]"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
}
