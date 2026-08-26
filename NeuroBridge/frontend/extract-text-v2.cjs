const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const exts = ['.tsx', '.ts'];
const extractedStrings = new Set();

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (exts.includes(path.extname(fullPath))) {
      extractFromFile(fullPath);
    }
  }
}

function extractFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Extract JSX text between tags
  const jsxRegex = />([^<{}]+)</g;
  let match;
  while ((match = jsxRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && /[a-zA-Z]/.test(text) && text.length > 1) {
      extractedStrings.add(text);
    }
  }

  // 2. Extract specific attributes (placeholder, title, aria-label)
  const attrRegex = /(?:placeholder|title|aria-label)\s*=\s*(?:["'](.*?)["']|{["'](.*?)["']})/g;
  while ((match = attrRegex.exec(content)) !== null) {
    const text = (match[1] || match[2] || '').trim();
    if (text && /[a-zA-Z]/.test(text)) {
      extractedStrings.add(text);
    }
  }
}

walk(srcDir);

// Filter out some garbage (code remnants, single symbols)
const cleaned = Array.from(extractedStrings).filter(s => {
  if (s.length < 2) return false;
  if (/^[A-Za-z0-9_-]+$/.test(s) && !s.includes(' ')) {
    // Single word without spaces - probably fine to translate but let's check it's not a CSS class
    // CSS classes are usually lowercase and hyphenated. If it's a normal capitalized word it's fine.
    if (s.includes('-')) return false;
  }
  // Exclude strings that look like JS code
  if (s.includes('=>') || s.includes('===') || s.includes('()')) return false;
  return true;
}).sort();

fs.writeFileSync(
  path.join(__dirname, 'extracted_strings_v2.json'),
  JSON.stringify(cleaned, null, 2)
);

console.log(`Extracted ${cleaned.length} high-quality strings.`);
