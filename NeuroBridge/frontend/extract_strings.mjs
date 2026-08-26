import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
         arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(srcDir);
const strings = new Set();

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Extract JSX text (heuristic)
  const jsxRegex = />([^<>{}\n]+)</g;
  let match;
  while ((match = jsxRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text.length > 1 && /[a-zA-Z]/.test(text)) {
      strings.add(text);
    }
  }

  // Extract placeholders
  const placeholderRegex = /placeholder=(['"])(.*?)\1/g;
  while ((match = placeholderRegex.exec(content)) !== null) {
    const text = match[2].trim();
    if (text.length > 1) {
      strings.add(text);
    }
  }

  // Extract text inside single quotes that look like UI strings (heuristic)
  // This might catch some code strings, but we can filter them out manually or programmatically
  // Actually, let's stick to JSX text and placeholders for now to avoid too much noise,
  // but also catch title tags and standard label text.
});

// Remove existing ones from translations.ts to see what's NEW.
// Actually, let's just dump everything to a JSON file.
fs.writeFileSync(path.join(__dirname, 'extracted_strings.json'), JSON.stringify(Array.from(strings).sort(), null, 2));
console.log(`Extracted ${strings.size} strings.`);
