import { Check, X } from 'lucide-react';
import { PASSWORD_RULES, getPasswordStrength } from '../../utils/passwordRules';

const LEVEL_STYLE = [
  { bar: 'bg-slate-200', text: 'text-slate-500' },
  { bar: 'bg-red-500', text: 'text-red-600' },
  { bar: 'bg-amber-500', text: 'text-amber-700' },
  { bar: 'bg-blue-500', text: 'text-blue-700' },
  { bar: 'bg-emerald-500', text: 'text-emerald-700' },
] as const;

/**
 * Live strength meter + rule checklist, shown under a "new password" field.
 * The rule list is announced politely to screen readers as it changes.
 */
export function PasswordStrength({ password, id }: { password: string; id?: string }) {
  const strength = getPasswordStrength(password);
  const style = LEVEL_STYLE[strength.level];

  return (
    <div id={id} className="mt-2.5 space-y-2.5" data-password-strength>
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-4 gap-1.5 flex-1" aria-hidden>
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={`h-1.5 rounded-full transition-colors duration-200 ${
                strength.level >= segment ? style.bar : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <span
          className={`text-xs font-bold min-w-[3.5rem] text-right ${style.text}`}
          aria-live="polite"
        >
          {strength.label ? `${strength.label}` : ''}
        </span>
      </div>
      {strength.label && <span className="sr-only">Password strength: {strength.label}</span>}

      <ul className="space-y-1" aria-label="Password rules">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                ok ? 'text-emerald-700' : password ? 'text-red-600' : 'text-slate-500'
              }`}
            >
              <span
                className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  ok ? 'bg-emerald-100 text-emerald-700' : password ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                }`}
                aria-hidden
              >
                {ok ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
              </span>
              <span>{rule.label}</span>
              <span className="sr-only">{ok ? '(done)' : '(not yet)'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
