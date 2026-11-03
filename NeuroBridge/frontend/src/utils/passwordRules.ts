/**
 * Password rules shared by the sign-up and reset-password forms.
 * The backend (routes/emailAuth.ts → passwordProblem) enforces the same rules.
 */
export interface PasswordRule {
  id: 'length' | 'number' | 'special';
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { id: 'number', label: 'At least 1 number (0-9)', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'At least 1 special character (! @ # $ …)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const meetsPasswordRules = (password: string) =>
  password.length <= 128 && PASSWORD_RULES.every((rule) => rule.test(password));

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  level: StrengthLevel; // 0 = empty
  label: '' | 'Weak' | 'Fair' | 'Good' | 'Strong';
}

/**
 * Strength in real time. A password that misses any required rule is never
 * better than "Weak"; past that, length and variety push it up.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { level: 0, label: '' };
  if (!meetsPasswordRules(password)) return { level: 1, label: 'Weak' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if ((password.match(/[^A-Za-z0-9]/g) || []).length >= 2 || (password.match(/\d/g) || []).length >= 2) score++;
  // Very common shapes ("password1!", "qwerty1!", one repeated character) are easy to guess
  if (/^(.)\1+$/.test(password.replace(/[^A-Za-z0-9]/g, '')) || /password|qwerty|123456|abcdef|letmein|welcome/i.test(password)) {
    return { level: 1, label: 'Weak' };
  }

  if (score <= 1) return { level: 2, label: 'Fair' };
  if (score <= 2) return { level: 3, label: 'Good' };
  return { level: 4, label: 'Strong' };
}
