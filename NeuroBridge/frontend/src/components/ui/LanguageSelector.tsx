import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';

export function LanguageSelector() {
  const { language, setLanguage } = useDyslexia();
  const t = getTranslation(language);

  return (
    <div className="flex items-center gap-2">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
        className="bg-white border-2 border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium focus:border-blue-400 focus:outline-none transition-colors cursor-pointer"
        aria-label="Select language"
      >
        <option value="en">🇬🇧 English</option>
        <option value="hi">🇮🇳 हिन्दी</option>
        <option value="mr">🇮🇳 मराठी</option>
      </select>
    </div>
  );
}
