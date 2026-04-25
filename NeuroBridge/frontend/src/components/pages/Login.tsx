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

    const handlePlay = () => {
        if (isPlaying) {
            stopSpeech();
            setIsPlaying(false);
        } else {
            speakText(speechText, language, audioSpeed);
            setIsPlaying(true);
        }
    };

    const handleSpeedChange = (newSpeed: number) => {
        setAudioSpeed(newSpeed);
        changeSpeechSpeed(newSpeed);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login form submitted', { email: formData.email, password: formData.password });
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

            console.log('Login response status:', response.status);
            const data = await response.json();
            console.log('Login response data:', data);
            
            if (data.success) {
                console.log('Login successful, token:', data.token);
                login(data.token);
                navigate(data.redirect);
            } else {
                console.log('Login failed:', data.error);
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Register form submitted', { name: formData.name, email: formData.email, password: formData.password });
        setIsLoading(true);
        setError('');
        
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

            console.log('Register response status:', response.status);
            const data = await response.json();
            console.log('Register response data:', data);
            
            if (data.success) {
                console.log('Registration successful');
                setSuccess('Account created successfully. Please login.');
                setActiveTab('login');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            } else {
                console.log('Registration failed:', data.error);
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
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
            <div className="fixed inset-0 bg-[#DBEAF5] -z-10"></div>

            <div className="flex justify-center items-center py-4 px-4 sm:px-0">
                <div className="bg-white rounded-[40px] p-8 sm:p-10 w-full max-w-[480px] shadow-sm">

                    {/* Top Toggle */}
                    <div className="flex bg-[#FCFBF4] p-1.5 rounded-2xl mb-8">
                        <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'login' ? 'text-gray-800 bg-white shadow-sm' : 'text-[#7C8B99] hover:text-gray-700'}`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'register' ? 'text-gray-800 bg-white shadow-sm' : 'text-[#7C8B99] hover:text-gray-700'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Combined Audio & Language Control (Theme-Matched) */}
                    <div className="flex items-center bg-[#F4F9FD] rounded-full px-5 py-2.5 border border-blue-100 max-w-max mb-6 shadow-sm">
                        {/* Audio Button */}
                        <button
                            type="button"
                            onClick={handlePlay}
                            className={`flex items-center gap-2 font-bold text-[15px] transition-colors ${isPlaying ? 'text-red-500' : 'text-[#1D64D8] hover:text-blue-700'}`}
                        >
                            {isPlaying ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
                                    </svg>
                                    <span>{t.stop}</span>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    </div>
                                    <span>{t.listen}</span>
                                </>
                            )}
                        </button>
                        
                        {/* Speed Controls */}
                        <div className="flex items-center bg-blue-50/50 rounded-full p-0.5 ml-4 border border-blue-100/30">
                          <button
                            onClick={() => handleSpeedChange(0.5)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 ${
                              audioSpeed === 0.5
                                ? 'bg-white text-blue-600 shadow-sm shadow-blue-900/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                          >
                            0.5x
                          </button>
                          <button
                            onClick={() => handleSpeedChange(1)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 ${
                              audioSpeed === 1
                                ? 'bg-white text-blue-600 shadow-sm shadow-blue-900/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                          >
                            1.0x
                          </button>
                        </div>
                        
                        {/* Divider */}
                        <div className="h-5 w-px bg-[#D1E4F9] mx-4"></div>

                        {/* Language Dropdown */}
                        <div className="relative flex items-center gap-2 text-[#4A5568] font-bold text-[15px] hover:text-[#2D3748] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
                                className="appearance-none bg-transparent outline-none cursor-pointer pr-4 font-bold"
                            >
                                <option value="en">EN</option>
                                <option value="hi">HI</option>
                                <option value="mr">MR</option>
                            </select>
                            {/* Custom caret */}
                            <div className="absolute right-0 pointer-events-none opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-6">
                        <h1 className="text-[26px] font-black text-[#1A202C] mb-2">
                            {activeTab === 'login' ? t.loginTitle : 'Join NeuroBridge'}
                        </h1>
                        <p className="text-[#5b6b79] text-[15px] font-medium leading-relaxed">
                            {activeTab === 'login' ? 'Login to continue your learning journey.' : 'Create a free account and start learning your way today.'}
                        </p>
                    </div>

                    {/* Dyslexia Mode Toggle */}
                    <div className="flex items-center justify-between bg-[#F4F9FD] p-5 rounded-2xl mb-8 border border-blue-50/50">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 shrink-0">
                                <Palette className="w-7 h-7 text-blue-400 stroke-[1.5]" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-extrabold text-[#1A202C] text-[15px] mb-0.5">{t.dyslexiaMode}</h3>
                                <p className="text-[#5b6b79] text-[13px] leading-snug font-medium">
                                    Larger text, extra spacing, warm background
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={toggleDyslexiaMode}
                            className={`w-[46px] h-[24px] rounded-full p-1 transition-colors ${isDyslexiaMode ? 'bg-blue-500' : 'bg-[#E5E7EB] shadow-inner'} relative flex items-center`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDyslexiaMode ? 'translate-x-[22px]' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={activeTab === 'login' ? handleEmailLogin : handleRegister}>
                        {activeTab === 'register' && (
                            <div>
                                <label className="block text-sm font-bold text-[#2A3B4C] mb-2">Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <div className="bg-blue-100 p-1 rounded-full">
                                            <User className="h-4 w-4 text-blue-500 stroke-[2.5]" />
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your name"
                                        className="w-full pl-14 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        )}

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
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder={t.emailPlaceholder}
                                    className="w-full pl-14 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#2A3B4C] mb-2">{t.passwordLabel}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <div className="bg-yellow-100 p-1 rounded-md">
                                        <Lock className="h-4 w-4 text-yellow-600 stroke-[2.5]" />
                                    </div>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder={t.passwordPlaceholder}
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
                            {activeTab === 'login' && (
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-sm font-bold text-[#2563EB] hover:text-blue-700 transition-colors cursor-pointer"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (activeTab === 'login' ? 'Logging in...' : 'Creating account...') : (activeTab === 'login' ? t.loginButton : 'Create My Account')}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 mb-6 relative flex items-center">
                        <div className="grow border-t border-gray-200"></div>
                        <span className="shrink-0 mx-4 text-[13px] font-bold text-[#94A3B8]">or continue with</span>
                        <div className="grow border-t border-gray-200"></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="mb-4">
                        <GoogleLogin className="w-full" />
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-6">
                        <p className="text-[14px] font-bold text-[#94A3B8]">
                            {activeTab === 'login' ? (
                                <>Don't have an account? <button type="button" onClick={() => setActiveTab('register')} className="text-[#2563EB] hover:text-blue-700 ml-1">Create one free &rarr;</button></>
                            ) : (
                                <>Already have an account? <button type="button" onClick={() => setActiveTab('login')} className="text-[#2563EB] hover:text-blue-700 ml-1">Login &rarr;</button></>
                            )}
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}