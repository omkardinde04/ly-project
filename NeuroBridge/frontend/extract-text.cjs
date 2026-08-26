const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const exts = ['.tsx', '.ts'];
const extractedStrings = new Set();

// A simple recursive directory traversal
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

// Basic regex to find JSX text and string literals
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

  // 2. Extract string literals in quotes (single, double, backticks)
  // This is a naive regex but works for grabbing potential dictionary keys
  const strRegex = /(['"`])(.*?)\1/g;
  while ((match = strRegex.exec(content)) !== null) {
    const text = match[2].trim();
    // Exclude obvious non-UI strings (paths, hex colors, single words that are likely variables)
    if (text && text.length > 2 && text.length < 200 && /[A-Z]/.test(text[0]) && text.includes(' ')) {
      extractedStrings.add(text);
    }
  }
}

walk(srcDir);

// Filter and sort the results
const sortedStrings = Array.from(extractedStrings).sort();

fs.writeFileSync(
  path.join(__dirname, 'extracted_strings.json'),
  JSON.stringify(sortedStrings, null, 2)
);

console.log(`Extracted ${sortedStrings.length} potential strings.`);
