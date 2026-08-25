import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LinkedInConnect } from './LinkedInConnect';
import { 
  User, Mail, Shield, Globe, 
  LogOut, AlertTriangle, Key, Edit2, Save, Activity, Smartphone, Camera, X
} from 'lucide-react';

export function Profile() {
  const { user, token, logout, updateUser } = useAuth();
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Local state for personal info form (mocking fields not in backend yet)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    preferredName: user?.name?.split(' ')[0] || '',
    phone: '',
    location: '',
  });

  const [preferences, setPreferences] = useState({
    language: 'English (US)',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emailNotifications: true,
    platformReminders: true,
  });

  const handleSavePersonalInfo = async () => {
    const name = personalInfo.fullName.trim();
    if (!name || !token) return;
    const response = await fetch('http://localhost:4000/api/auth/email/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name }) });
    if (!response.ok) return;
    const updated = await response.json();
    updateUser(updated);
    setPersonalInfo(value => ({ ...value, fullName: updated.name, preferredName: updated.name.split(' ')[0] }));
    setIsEditingPersonal(false);
  };

  const handleDeleteAccount = () => {
    // In a real app, make API call to delete account
    logout();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ profile_picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'August 2026'; // Fallback if no creation date

  const isSignedInWithGoogle = !!user?.google_id;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* 1. Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl shadow-sm border border-border p-8 flex flex-col md:flex-row items-center gap-6"
      >
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-blue-50">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#4A90E2]">{getInitials(user?.name || 'User')}</span>
            )}
          </div>
          
          {user?.profile_picture && (
            <button 
              onClick={() => updateUser({ profile_picture: undefined })}
              className="absolute top-0 right-0 w-7 h-7 bg-white hover:bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-colors z-10"
              title="Remove photo"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}

          <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#4A90E2] hover:bg-[#3A80D2] rounded-full text-white flex items-center justify-center shadow-md cursor-pointer transition-colors border-2 border-white" title="Update profile picture">
            <Camera size={14} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-text mb-1">{user?.name}</h1>
          <p className="text-text-muted font-medium mb-2 flex items-center justify-center md:justify-start gap-2">
            <Mail size={16} /> {user?.email}
          </p>
          <p className="text-sm text-[#4A90E2] font-bold bg-blue-50 inline-block px-3 py-1 rounded-full">
            Member since {memberSince}
          </p>
        </div>
        
        <div>
          <button 
            onClick={() => setIsEditingPersonal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#4A90E2] hover:bg-[#3A80D2] text-white rounded-xl font-bold transition-all shadow-sm"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
          >
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                <User size={20} className="text-[#4A90E2]" />
                Personal Information
              </h2>
              {!isEditingPersonal && (
                <button 
                  onClick={() => setIsEditingPersonal(true)}
                  className="text-[#4A90E2] hover:text-[#3A80D2] text-sm font-bold"
                >
                  Edit
                </button>
              )}
            </div>
            
            <div className="p-6">
              {isEditingPersonal ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-[#4A90E2] focus:outline-none text-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">Preferred Name</label>
                      <input 
                        type="text" 
                        value={personalInfo.preferredName}
                        onChange={(e) => setPersonalInfo({...personalInfo, preferredName: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-[#4A90E2] focus:outline-none text-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        placeholder="Optional"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-[#4A90E2] focus:outline-none text-text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text mb-2">Location</label>
                      <input 
                        type="text" 
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                        placeholder="City, Country"
                        className="w-full px-4 py-2 rounded-xl border border-border focus:border-[#4A90E2] focus:outline-none text-text"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end mt-6 pt-4 border-t border-border">
                    <button 
                      onClick={() => setIsEditingPersonal(false)}
                      className="px-6 py-2 text-text font-bold hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSavePersonalInfo}
                      className="px-6 py-2 bg-[#4A90E2] text-white font-bold rounded-xl hover:bg-[#3A80D2] transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <span className="text-sm font-semibold text-text-muted block mb-1">Full Name</span>
                    <span className="font-bold text-text">{user?.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-muted block mb-1">Preferred Name</span>
                    <span className="font-bold text-text">{personalInfo.preferredName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-muted block mb-1">Email Address</span>
                    <span className="font-bold text-text">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-muted block mb-1">Phone Number</span>
                    <span className="font-bold text-text">{personalInfo.phone || 'Not provided'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-text-muted block mb-1">Location</span>
                    <span className="font-bold text-text">{personalInfo.location || 'Not provided'}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 4. User Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
          >
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                <Globe size={20} className="text-[#4A90E2]" />
                Platform Preferences
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Preferred Language</label>
                  <select 
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-[#4A90E2] focus:outline-none bg-white font-medium text-text"
                  >
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">Time Zone</label>
                  <select 
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-border focus:border-[#4A90E2] focus:outline-none bg-white font-medium text-text"
                  >
                    <option>{Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-bold text-text mb-4">Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <div className="font-bold text-text transition-colors">Email Notifications</div>
                      <div className="text-sm text-text-muted">Receive updates about new opportunities and features</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${preferences.emailNotifications ? 'bg-[#4A90E2]' : 'bg-gray-300'}`}
                         onClick={() => setPreferences({...preferences, emailNotifications: !preferences.emailNotifications})}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.emailNotifications ? 'left-7' : 'left-1'}`} />
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <div className="font-bold text-text transition-colors">Platform Reminders</div>
                      <div className="text-sm text-text-muted">In-app notifications for learning progress</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${preferences.platformReminders ? 'bg-[#4A90E2]' : 'bg-gray-300'}`}
                         onClick={() => setPreferences({...preferences, platformReminders: !preferences.platformReminders})}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${preferences.platformReminders ? 'left-7' : 'left-1'}`} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column (Account & Security) */}
        <div className="space-y-8">
          
          {/* 3. Account Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
          >
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                <Shield size={20} className="text-[#4A90E2]" />
                Account
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm font-semibold text-text-muted block mb-1">Account Status</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-sm border border-green-200">
                  <Activity size={14} /> Active
                </span>
              </div>
              
              <div className="pt-2">
                <span className="text-sm font-semibold text-text-muted block mb-1">Sign-in Method</span>
                <div className="flex items-center gap-2 mt-1">
                  {isSignedInWithGoogle ? (
                    <>
                      <div className="bg-white p-1 rounded border border-gray-200 shadow-sm flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <span className="font-bold text-text">Signed in with Google</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-100 p-1.5 rounded border border-gray-200">
                        <Mail size={16} className="text-gray-600" />
                      </div>
                      <span className="font-bold text-text">Signed in with Email</span>
                    </>
                  )}
                </div>
                <div className="text-sm text-text-muted mt-2 truncate">{user?.email}</div>
              </div>
            </div>
          </motion.div>

          {/* 5. Security & Connections */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
          >
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                <Key size={20} className="text-[#4A90E2]" />
                Security & Access
              </h2>
            </div>
            <div className="p-6 space-y-6">
              
              {!isSignedInWithGoogle && (
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <div className="font-bold text-text">Password</div>
                    <div className="text-sm text-text-muted">Last changed 3 months ago</div>
                  </div>
                  <button className="px-4 py-2 border border-border rounded-xl font-bold text-text hover:bg-gray-50 transition-colors shadow-sm">
                    Change
                  </button>
                </div>
              )}


              <div className="pt-4 border-t border-border">
                <div className="font-bold text-text mb-3 flex items-center gap-2">
                  <Smartphone size={18} className="text-text-muted" /> Active Sessions
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <div>
                    <div className="font-bold text-text text-sm">Windows PC • Chrome</div>
                    <div className="text-xs text-text-muted">Current session • {personalInfo.location || 'Unknown Location'}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl font-bold text-text hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>

            </div>
          </motion.div>

          {/* 6. Danger Zone */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface rounded-2xl shadow-sm border border-red-200 overflow-hidden"
          >
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-start">
              <div className="text-xl font-bold text-[#F88379] flex items-center gap-2 text-left">
                <AlertTriangle size={20} className="text-[#F88379]" />
                <span>Danger Zone</span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-text-muted mb-4 font-medium">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!isDeletingAccount ? (
                <button 
                  onClick={() => setIsDeletingAccount(true)}
                  className="w-full py-3 bg-white border border-red-200 text-[#F88379] hover:bg-red-50 hover:border-[#F88379] rounded-xl font-bold transition-colors shadow-sm"
                >
                  Delete Account
                </button>
              ) : (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <p className="font-bold text-red-700 mb-3 text-sm">Are you absolutely sure?</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsDeletingAccount(false)}
                      className="flex-1 py-2 bg-white border border-gray-300 text-text rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      className="flex-1 py-2 bg-[#F88379] hover:bg-red-500 text-white rounded-lg font-bold transition-colors shadow-sm"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
