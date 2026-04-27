import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { User, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [devLink, setDevLink] = useState('');
    const navigate = useNavigate();
    const { language } = useDyslexia();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        setDevLink('');

        try {
            const response = await fetch('http://localhost:4000/api/auth/email/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim() })
            });

            const data = await response.json();

            if (data.success) {
                setSent(true);
                setMessage(data.message);
                // In dev mode the backend may return a direct link (email not configured)
                if (data.devResetLink) {
                    setDevLink(data.devResetLink);
                }
            } else {
                setError(data.error || 'Failed to send reset email. Please try again.');
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Full-page background */}
            <div className="fixed inset-0 bg-[#DBEAF5] -z-10" />

            <div className="flex justify-center items-center min-h-screen py-8 px-4">
                <div className="bg-white rounded-[40px] p-8 sm:p-10 w-full max-w-[480px] shadow-sm">

                    {/* Back button */}
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-[#5b6b79] hover:text-[#1A202C] font-semibold text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>

                    {!sent ? (
                        <>
                            {/* Header */}
                            <div className="mb-8">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                    <Mail className="w-7 h-7 text-blue-500" />
                                </div>
                                <h1 className="text-[26px] font-black text-[#1A202C] mb-2">Forgot Password?</h1>
                                <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed">
                                    No worries! Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-[#2A3B4C] mb-2">Email Address</label>
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
                                            placeholder="Enter your registered email"
                                            required
                                            className="w-full pl-14 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                            Sending Reset Link...
                                        </span>
                                    ) : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Success state */
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h1 className="text-[24px] font-black text-[#1A202C] mb-3">Check Your Inbox!</h1>
                            <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed mb-6">
                                {message}
                            </p>

                            {/* Dev link — shown only when email SMTP is not configured */}
                            {devLink && (
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                                    <p className="text-amber-700 text-xs font-bold mb-2 uppercase tracking-wide">
                                        ⚙️ Dev Mode — Email not configured
                                    </p>
                                    <p className="text-amber-600 text-xs mb-2">
                                        Your Gmail App Password isn't set yet. Use this link directly:
                                    </p>
                                    <a
                                        href={devLink}
                                        className="text-blue-600 underline text-xs break-all font-medium"
                                    >
                                        {devLink}
                                    </a>
                                </div>
                            )}

                            <div className="p-4 bg-blue-50 rounded-2xl text-left mb-6">
                                <p className="text-blue-700 text-sm font-medium leading-relaxed">
                                    📬 Didn't receive the email? Check your spam folder. The link expires in <strong>1 hour</strong>.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => { setSent(false); setEmail(''); }}
                                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-[15px]"
                                >
                                    Try a Different Email
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 text-[#1D64D8] font-bold text-[15px] hover:underline"
                                >
                                    Back to Login →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
