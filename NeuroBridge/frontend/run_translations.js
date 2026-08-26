import fs from 'fs';
import translate from 'google-translate-api-x';

const strings = JSON.parse(fs.readFileSync('clean_strings.json', 'utf8'));

// Common replacements for tech terms
const techReplacementsHi = {
  'नियंत्रण कक्ष': 'डैशबोर्ड',
  'डैशबोर्ड': 'डैशबोर्ड',
  'वेबसाइट': 'वेबसाइट',
  'वेब पेज': 'वेब पेज',
  'ऑनलाइन': 'ऑनलाइन',
  'प्रोफ़ाइल': 'प्रोफ़ाइल',
};

const techReplacementsMr = {
  'नियंत्रण कक्ष': 'डॅशबोर्ड',
  'डॅशबोर्ड': 'डॅशबोर्ड',
  'वेबसाइट': 'वेबसाईट',
  'वेब पेज': 'वेब पेज',
  'ऑनलाइन': 'ऑनलाइन',
  'प्रोफाइल': 'प्रोफाइल',
};

function applyReplacements(text, map) {
  let result = text;
  for (const [key, value] of Object.entries(map)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  return result;
}

// Ensure quotes are escaped in the output strings so they don't break TS
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '');
}

async function doTranslations() {
  const hiDict = {};
  const mrDict = {};

  console.log(`Starting translation of ${strings.length} strings...`);

  // We will do chunks of 20 to avoid getting banned instantly
  const chunkSize = 20;
  for (let i = 0; i < strings.length; i += chunkSize) {
    const chunk = strings.slice(i, i + chunkSize);
    console.log(`Translating chunk ${Math.floor(i/chunkSize) + 1} / ${Math.ceil(strings.length/chunkSize)}...`);
    
    try {
      // Hindi
      const hiRes = await translate(chunk, { to: 'hi' });
      const hiArr = Array.isArray(hiRes) ? hiRes : [hiRes];
      
      // Marathi
      const mrRes = await translate(chunk, { to: 'mr' });
      const mrArr = Array.isArray(mrRes) ? mrRes : [mrRes];

      chunk.forEach((str, idx) => {
        let hiText = hiArr[idx].text || str;
        let mrText = mrArr[idx].text || str;
        
        hiText = applyReplacements(hiText, techReplacementsHi);
        mrText = applyReplacements(mrText, techReplacementsMr);

        hiDict[str] = hiText;
        mrDict[str] = mrText;
      });
      
      // Wait a bit to avoid rate limits
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error('Translation error on chunk:', err.message);
      // Fallback: just map to English
      chunk.forEach((str) => {
        hiDict[str] = str;
        mrDict[str] = str;
      });
    }
  }

  console.log('Writing dictionary...');
  
  // We'll output the new dictionaries into a fresh TS file for now
  // We can merge it manually with the old one, but actually let's just generate the whole file since it's massive.
  let output = `// Auto-generated translations

export const globalHindiDictionary: Record<string, string> = {
`;
  for (const [key, val] of Object.entries(hiDict)) {
    output += `  '${escapeQuotes(key)}': '${escapeQuotes(val)}',\n`;
  }
  output += `};\n\n`;

  output += `export const globalMarathiDictionary: Record<string, string> = {
`;
  for (const [key, val] of Object.entries(mrDict)) {
    output += `  '${escapeQuotes(key)}': '${escapeQuotes(val)}',\n`;
  }
  output += `};\n`;

  fs.writeFileSync('new_dictionaries.ts', output);
  console.log('Done! Generated new_dictionaries.ts');
}

doTranslations();
