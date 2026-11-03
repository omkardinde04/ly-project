/**
 * Turn what the speech engine heard into letters.
 * Engines often write letter names as words ("see", "bee", "double you"),
 * or glue capitals together ("FGH"). Common filler words ("the", "um",
 * "and") are ignored on purpose.
 */
const NAMES: Record<string, string> = {
  a: 'a', ay: 'a',
  b: 'b', be: 'b', bee: 'b',
  c: 'c', see: 'c', sea: 'c', cee: 'c',
  d: 'd', dee: 'd',
  e: 'e', ee: 'e',
  f: 'f', ef: 'f', eff: 'f',
  g: 'g', gee: 'g', jee: 'g',
  h: 'h', aitch: 'h', haitch: 'h', each: 'h', etch: 'h',
  i: 'i', eye: 'i', aye: 'i',
  j: 'j', jay: 'j',
  k: 'k', kay: 'k',
  l: 'l', el: 'l', ell: 'l',
  m: 'm', em: 'm',
  n: 'n', en: 'n',
  o: 'o', oh: 'o',
  p: 'p', pee: 'p', pea: 'p',
  q: 'q', cue: 'q', queue: 'q',
  r: 'r', are: 'r', ar: 'r',
  s: 's', es: 's', ess: 's',
  t: 't', tee: 't', tea: 't',
  u: 'u', you: 'u',
  v: 'v', vee: 'v',
  w: 'w', doubleyou: 'w',
  x: 'x', ex: 'x',
  y: 'y', why: 'y', wye: 'y',
  z: 'z', zee: 'z', zed: 'z',
};

export function lettersFromSpeech(text: string): string[] {
  const tokens = text
    .replace(/double\s+(you|u)\b/gi, 'doubleyou')
    .replace(/[^A-Za-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const out: string[] = [];
  for (const token of tokens) {
    const w = token.toLowerCase();
    if (NAMES[w]) out.push(NAMES[w]);
    else if (/^[A-Z]{2,6}$/.test(token)) out.push(...w.split('')); // "FGH"
  }
  return out;
}
