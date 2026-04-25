import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Palette } from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { speakText, stopSpeech, changeSpeechSpeed } from '../../utils/textToSpeech';

export function Login() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { isDyslexiaMode, toggleDyslexiaMode, language, setLanguage, audioSpeed, setAudioSpeed } = useDyslexia();
    const t = getTranslation(language);
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);

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

                    {/* Form */}
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        {/* Email */}
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
                                    placeholder={t.emailPlaceholder}
                                    className="w-full pl-14 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
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
                        </div>

                        {activeTab === 'register' && (
                            /* Re-Enter Password */
                            <div>
                                <label className="block text-sm font-bold text-[#2A3B4C] mb-2">Re-Enter Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <div className="bg-yellow-100 p-1 rounded-md">
                                            <Lock className="h-4 w-4 text-yellow-600 stroke-[2.5]" />
                                        </div>
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-Enter Your Password"
                                        className="w-full pl-14 pr-12 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[15px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                                    >
                                        {showConfirmPassword ? (
                                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        ) : (
                                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'login' && (
                            /* Forgot Password */
                            <div className="flex justify-end pt-1">
                                <button type="button" className="text-[13px] font-bold text-[#2563EB] hover:text-blue-700 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {activeTab === 'register' && (
                            /* Terms Checkbox */
                            <div className="flex items-start gap-3 mt-4 pt-1 px-1">
                                <div className="flex items-center h-5 mt-0.5">
                                    <input 
                                        id="terms" 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded border-gray-300 text-[#1D64D8] focus:ring-blue-500 cursor-pointer" 
                                    />
                                </div>
                                <label htmlFor="terms" className="text-[13px] font-bold text-[#0F172A] leading-[1.6]">
                                    I agree to the <a href="#" className="text-[#2563EB] hover:text-blue-700">Terms of Service</a> and <a href="#" className="text-[#2563EB] hover:text-blue-700">Privacy Policy</a>. I understand NeuroBridge is built to be inclusive for all learners.
                                </label>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button 
                                type="button" 
                                onClick={handleLogin}
                                className="w-full py-3.5 bg-[#1D64D8] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm transition-colors text-[16px]"
                            >
                                {activeTab === 'login' ? t.loginButton : 'Create My Account'}
                            </button>
                        </div>
                    </form>

                    {activeTab === 'login' && (
                        <>
                            {/* Divider */}
                            <div className="mt-8 mb-6 relative flex items-center">
                                <div className="grow border-t border-gray-200"></div>
                                <span className="shrink-0 mx-4 text-[13px] font-bold text-[#94A3B8]">or continue with</span>
                                <div className="grow border-t border-gray-200"></div>
                            </div>

                            {/* Social Buttons */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC] hover:bg-gray-50 transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M23.52 12.2727C23.52 11.4218 23.4436 10.6036 23.3018 9.81818H12V14.4545H18.4582C18.18 15.9491 17.34 17.2255 16.0364 18.0982V21.1091H19.9145C22.1836 19.0145 23.52 15.9273 23.52 12.2727Z" fill="#4285F4" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 24C15.24 24 17.9673 22.9255 20.0018 21.0273L16.0364 18.0982C14.9345 18.8345 13.5764 19.2764 12 19.2764C8.98364 19.2764 6.42545 17.2418 5.50909 14.5091H1.54909V17.5855C3.47455 21.4091 7.42909 24 12 24Z" fill="#34A853" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M5.50909 14.4273C5.27455 13.7127 5.14364 12.8727 5.14364 12C5.14364 11.1273 5.27455 10.2873 5.50909 9.57273V6.49636H1.54909C0.763636 8.06727 0.327273 9.97636 0.327273 12C0.327273 14.0236 0.763636 15.9327 1.54909 17.5036L5.50909 14.4273Z" fill="#FBBC05" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 4.72364C13.7618 4.72364 15.3436 5.32909 16.5873 6.51273L20.0891 3.01091C17.9618 1.03636 15.2345 0 12 0C7.42909 0 3.47455 2.59091 1.54909 6.49636L5.50909 9.57273C6.42545 6.75818 8.98364 4.72364 12 4.72364Z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-[15px] font-bold text-[#475569]">Google</span>
                                </button>

                                <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC] hover:bg-gray-50 transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24 12.073C24 5.405 18.627 0 12 0C5.373 0 0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.563H7.078V12.073H10.125V9.414C10.125 6.388 11.916 4.715 14.657 4.715C15.97 4.715 17.348 4.95 17.348 4.95V7.925H15.832C14.339 7.925 13.875 8.854 13.875 9.805V12.073H17.203L16.671 15.563H13.875V24C19.612 23.094 24 18.101 24 12.073Z" fill="#1877F2" />
                                    </svg>
                                    <span className="text-[15px] font-bold text-[#475569]">Facebook</span>
                                </button>
                            </div>
                        </>
                    )}

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