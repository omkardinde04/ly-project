import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Palette } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../utils/translations';
import { speakText, stopSpeech, changeSpeechSpeed } from '../../utils/textToSpeech';
import { GoogleLogin } from '../auth/GoogleLogin';

export function Login() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { isDyslexiaMode, toggleDyslexiaMode, language, setLanguage, audioSpeed, setAudioSpeed } = useDyslexia();
    const { login } = useAuth();
    const t = getTranslation(language);
    const navigate = useNavigate();
    const location = useLocation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Check for URL parameters (Google OAuth errors or tokens)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlError = params.get('error');
        const token = params.get('token');
        
        if (urlError) {
            setError(decodeURIComponent(urlError));
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        if (token) {
            // Handle successful Google OAuth
            login(token);
            const redirect = params.get('redirect') || '/dashboard';
            navigate(redirect);
        }
    }, [location.search, login, navigate]);

    useEffect(() => {
        if (location.state?.createAccount) {
            setActiveTab('register');
        }
    }, [location.state]);

    const speechText = activeTab === 'login' 
        ? `${t.loginTitle}. Login to continue your learning journey.` 
        : `Join NeuroBridge. Create a free account and start learning your way today.`;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:4000/api/auth/email/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                await login(data.token);
                navigate(data.redirect || '/dashboard');
            } else {
                // If email not verified, show resend option in message
                if (data.needsVerification) {
                    setError(data.error + ' Click "Resend Verification" below if you need a new link.');
                    setSuccess('');
                } else {
                    setError(data.error || 'Login failed');
                }
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!formData.email) {
            setError('Please enter your email address first.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:4000/api/auth/email/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();
            if (data.success) {
                setSuccess('Verification email resent! Please check your inbox.');
            } else {
                setError(data.error || 'Failed to resend verification email.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/auth/email/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (data.success) {
                setFormData({ ...formData, password: '', confirmPassword: '' });

                // Show dev verify link if email not configured
                if (data.devVerifyLink) {
                    setSuccess(
                        `Account created! (Email not configured) Click to verify: ${data.devVerifyLink}`
                    );
                } else {
                    setSuccess(data.message || 'Account created! Check your email to verify your account.');
                }

                setTimeout(() => {
                    setActiveTab('login');
                    setSuccess('');
                }, 5000);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
        // Navigate to dashboard — users choose to start assessment from there
        navigate('/dashboard');
    };

    return (
        <>
            {/* Background override for Login page */}
            <div className="fixed inset-0 bg-[#EAF4F8] -z-10"></div>

            <div className="flex justify-center items-center py-6 px-4 sm:px-0 min-h-[calc(100vh-64px)]">
                <div className="bg-surface rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-sm border border-border">

                    {/* Top Toggle */}
                    <div className="flex bg-surface-2 border border-border p-1 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'login' ? 'text-text bg-surface shadow-sm' : 'text-text-muted hover:text-text'}`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'register' ? 'text-text bg-surface shadow-sm' : 'text-text-muted hover:text-text'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Heading */}
                    <div className="mb-6 text-left">
                        <h1 className="text-3xl font-black text-text mb-2">
                            {activeTab === 'login' ? t.loginTitle : 'Join NeuroBridge'}
                        </h1>
                        <p className="text-text-muted text-sm font-medium leading-relaxed">
                            {activeTab === 'login' ? 'Login to continue your learning journey.' : 'Create a free account and start learning your way today.'}
                        </p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                            <p>{error}</p>
                            {activeTab === 'login' && error.includes('Resend Verification') && (
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    className="mt-2 text-blue-600 font-bold underline text-sm"
                                >
                                    Resend Verification Email
                                </button>
                            )}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-xl text-green-700 text-sm">
                            {success.includes('http') ? (
                                <>
                                    <p className="mb-1">Account created! Email not configured — use this link to verify:</p>
                                    <a href={success.split('verify: ')[1]} target="_blank" rel="noreferrer"
                                        className="text-blue-600 underline break-all text-xs">
                                        {success.split('verify: ')[1]}
                                    </a>
                                </>
                            ) : success}
                        </div>
                    )}

                    {/* Form */}
                    <form className="flex flex-col gap-4" onSubmit={activeTab === 'login' ? handleEmailLogin : handleRegister}>
                        <div className={`grid gap-4 ${activeTab === 'register' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                            {activeTab === 'register' && (
                                <div>
                                    <label className="block text-sm font-bold text-text mb-1.5">Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <div className="bg-coral-soft p-1.5 rounded-full">
                                                <User className="h-4 w-4 text-coral stroke-[2.5]" />
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your name"
                                            className="w-full pl-14 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-medium text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-colors"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-text mb-1.5">{t.emailLabel}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <div className="bg-coral-soft p-1.5 rounded-full">
                                            <User className="h-4 w-4 text-coral stroke-[2.5]" />
                                        </div>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder={t.emailPlaceholder}
                                        className="w-full pl-14 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-medium text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-1.5">{t.passwordLabel}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <div className="bg-coral-soft p-1.5 rounded-full">
                                            <Lock className="h-4 w-4 text-coral stroke-[2.5]" />
                                        </div>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder={t.passwordPlaceholder}
                                        className="w-full pl-14 pr-10 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-medium text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <Eye className="h-4 w-4 text-text-muted hover:text-text transition-colors" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-text-muted hover:text-text transition-colors" />
                                        )}
                                    </button>
                                </div>
                                {activeTab === 'login' && (
                                    <div className="mt-2 flex justify-between items-center">
                                        <button
                                            type="button"
                                            onClick={handleResendVerification}
                                            className="text-xs font-bold text-text-muted hover:text-text transition-colors cursor-pointer"
                                        >
                                            Resend Verification
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/forgot-password')}
                                            className="text-xs font-bold text-primary hover:text-blue-700 transition-colors cursor-pointer"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password — register only */}
                            {activeTab === 'register' && (
                                <div>
                                    <label className="block text-sm font-bold text-text mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <div className="bg-coral-soft p-1.5 rounded-full">
                                                <Lock className="h-4 w-4 text-coral stroke-[2.5]" />
                                            </div>
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Re-enter password"
                                            className="w-full pl-14 pr-10 py-2.5 bg-surface-2 border border-border rounded-xl text-sm font-medium text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        >
                                            {showConfirmPassword ? (
                                                <Eye className="h-4 w-4 text-text-muted hover:text-text transition-colors" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-text-muted hover:text-text transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (activeTab === 'login' ? 'Logging in...' : 'Creating account...') : (activeTab === 'login' ? t.loginButton : 'Create My Account')}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 mb-4 relative flex items-center">
                        <div className="grow border-t border-border"></div>
                        <span className="shrink-0 mx-4 text-xs font-bold text-text-muted">or continue with</span>
                        <div className="grow border-t border-border"></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="mb-4">
                        <GoogleLogin className="w-full" />
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-4">
                        <p className="text-xs font-bold text-text-muted">
                            {activeTab === 'login' ? (
                                <>Don't have an account? <button type="button" onClick={() => setActiveTab('register')} className="text-primary hover:text-blue-700 ml-1">Create one free &rarr;</button></>
                            ) : (
                                <>Already have an account? <button type="button" onClick={() => setActiveTab('login')} className="text-primary hover:text-blue-700 ml-1">Login &rarr;</button></>
                            )}
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}