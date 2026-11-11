import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * "How do I get in?" box for public feature pages. Shows the right next step:
 *  - logged out              → Take the test · Log in
 *  - logged in, no test yet  → Take the test
 *  - logged in, test done    → Go to Dashboard
 */
export function FeatureAccessCTA({ featureName }: { featureName: string }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const loggedIn = !!token && !!user;
  const testDone = loggedIn && !!user?.assessment_completed;

  const message = testDone
    ? `Open ${featureName} from your dashboard.`
    : loggedIn
      ? `Take the short test to unlock ${featureName}.`
      : `Take the short test and create a free account to use ${featureName}.`;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-text">Ready to start?</h2>
        <p className="text-text-muted text-sm mt-1">{message}</p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        {testDone ? (
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 focus-visible:ring-offset-2"
          >
            <LayoutDashboard size={16} />
            <span>Go to Dashboard</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate('/assessment')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shadow-xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 focus-visible:ring-offset-2"
            >
              <span>Take the test</span>
              <ArrowRight size={16} />
            </button>
            {!loggedIn && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 hover:opacity-90 border border-border text-text text-sm font-bold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 focus-visible:ring-offset-2"
              >
                <LogIn size={16} />
                <span>Log in</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
