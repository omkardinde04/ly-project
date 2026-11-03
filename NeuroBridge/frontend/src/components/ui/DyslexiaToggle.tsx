import { FunModeMenu } from './FunModeMenu';

/**
 * Kept for existing imports (navbar, dashboard header): this control is now
 * "Fun mode" — a dropdown with font, line-spacing, weight, letter-spacing and
 * text-size settings that apply across the site in real time.
 */
export function DyslexiaToggle({ className = '' }: { className?: string }) {
  return <FunModeMenu className={className} />;
}
