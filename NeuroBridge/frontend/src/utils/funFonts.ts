/**
 * Fonts offered in Fun mode. Each is chosen for readability; the web fonts
 * are linked in index.html (the browser only downloads a font file once it
 * is actually used on screen).
 */
export type FunFontId =
  | 'lexend'
  | 'opendyslexic'
  | 'atkinson'
  | 'comic-neue'
  | 'andika'
  | 'nunito'
  | 'verdana'
  | 'arial';

export interface FunFont {
  id: FunFontId;
  label: string;
  /** Full CSS font-family stack. */
  stack: string;
}

export const FUN_FONTS: FunFont[] = [
  { id: 'lexend', label: 'Lexend', stack: "'Lexend', 'Nunito', Arial, sans-serif" },
  { id: 'opendyslexic', label: 'OpenDyslexic', stack: "'OpenDyslexic', 'Lexend', Arial, sans-serif" },
  { id: 'atkinson', label: 'Atkinson', stack: "'Atkinson Hyperlegible', 'Lexend', Arial, sans-serif" },
  { id: 'comic-neue', label: 'Comic Neue', stack: "'Comic Neue', 'Comic Sans MS', 'Lexend', sans-serif" },
  { id: 'andika', label: 'Andika', stack: "'Andika', 'Lexend', Arial, sans-serif" },
  { id: 'nunito', label: 'Nunito', stack: "'Nunito', 'Lexend', Arial, sans-serif" },
  { id: 'verdana', label: 'Verdana', stack: "Verdana, Tahoma, 'Lexend', sans-serif" },
  { id: 'arial', label: 'Arial', stack: "Arial, Helvetica, sans-serif" },
];

export const fontStack = (id: FunFontId) => (FUN_FONTS.find((f) => f.id === id) ?? FUN_FONTS[0]).stack;

/** Defaults used when Fun mode is first switched on (and by "Reset"). */
export const FUN_DEFAULTS = {
  funFont: 'lexend' as FunFontId,
  funLineHeight: 1.8,
  funWeight: 400,
  funLetterSpacing: 0.03,
};

/** Slider ranges. */
export const FUN_RANGES = {
  lineHeight: { min: 1.2, max: 2.6, step: 0.1 },
  weight: { min: 300, max: 800, step: 100 },
  letterSpacing: { min: 0, max: 0.2, step: 0.01 },
  textSize: { min: 90, max: 150, step: 5 },
};

export const weightName = (w: number) =>
  w <= 300 ? 'Light' : w <= 400 ? 'Regular' : w <= 500 ? 'Medium' : w <= 600 ? 'Semi-bold' : w <= 700 ? 'Bold' : 'Extra bold';
