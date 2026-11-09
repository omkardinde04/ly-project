import { Profile } from './Profile';

export function Settings() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-[#1A202C]">Settings</h1>
        <p className="mt-1 text-sm font-medium text-[#64748B]">
          Manage your profile and personalize how NeuroBridge works for you.
        </p>
      </header>

      <section id="settings-profile" aria-label="Profile settings" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-extrabold text-[#1A202C]">Profile</h2>
        <Profile />
      </section>
    </div>
  );
}
