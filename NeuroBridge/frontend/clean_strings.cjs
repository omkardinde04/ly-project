const fs = require('fs');

const data = JSON.parse(fs.readFileSync('extracted_strings_v2.json', 'utf-8'));

const cleaned = data.filter(s => {
  if (s.includes('Math.hypot') || s.includes('dist(')) return false;
  if (s.startsWith('(') || s.startsWith(')') || s.startsWith('&')) return false;
  if (s.startsWith('];') || s.startsWith('};') || s.startsWith(');')) return false;
  if (s.startsWith('=')) return false;
  if (s.startsWith('>')) return false;
  if (s.startsWith('<')) return false;
  if (s.startsWith(':')) return false;
  if (s.startsWith(';')) return false;
  if (s.includes('.map(') || s.includes('useState')) return false;
  return true;
});

fs.writeFileSync('clean_strings.json', JSON.stringify(cleaned, null, 2));
console.log('Cleaned strings:', cleaned.length);
