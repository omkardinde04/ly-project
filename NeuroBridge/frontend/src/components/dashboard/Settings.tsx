import { useState } from 'react';
import { AccessibilityPreferences } from './AccessibilityPreferences';
import { Profile } from './Profile';

export function Settings() {
  const [activeSection, setActiveSection] = useState<'profile' | 'accessibility'>('profile');

  const navigateToSection = (section: 'profile' | 'accessibility') => {
    setActiveSection(section);
    document.getElementById(`settings-${section}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-[#1A202C]">Settings</h1>
        <p className="mt-1 text-sm font-medium text-[#64748B]">
          Manage your profile and personalize how NeuroBridge works for you.
        </p>
      </header>

      <nav
        aria-label="Settings sections"
        className="sticky top-0 z-30 -mx-2 flex gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur sm:mx-0"
      >
        {([
          ['profile', 'Profile'],
          ['accessibility', 'Accessibility'],
        ] as const).map(([section, label]) => (
          <button
            key={section}
            type="button"
            aria-current={activeSection === section ? 'location' : undefined}
            onClick={() => navigateToSection(section)}
            className={`min-h-11 flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              activeSection === section
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <section id="settings-profile" aria-label="Profile settings" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-extrabold text-[#1A202C]">Profile</h2>
        <Profile />
      </section>

      <section
        id="settings-accessibility"
        aria-label="Accessibility settings"
        className="scroll-mt-24 space-y-5"
      >
        <AccessibilityPreferences />
      </section>
    </div>
  );
}
