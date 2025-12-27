import fs from 'fs';
import { glob } from 'glob';

const TARGET_DIR = './src'; 
const OUTPUT_FILE = './all-texts.json';
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/public/**',
  '**/gql/**', // Ignore generated GraphQL files
  '**/*.d.ts',
];

async function extractText() {
  // Use ** to ensure recursive subfolder searching
  const files = await glob(`${TARGET_DIR}/**/*.{tsx,ts}`, { ignore: IGNORE_PATTERNS });
  const results = new Set();

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');

    // 1. JSX Children: >Text<
    const tagRegex = />([^<>{}\n\r]+)</g;
    
    // 2. Common Props: label="Text", title="Text", placeholder="Text", description="Text"
    const propRegex = /(?:label|placeholder|title|description|alt|error|helperText)="([^"]+)"/g;

    // 3. Text inside curly braces (JSX): { "Text" } or { 'Text' }
    const curlyRegex = /\{['"]([^'"]+)['"]\}/g;

    // 4. Alerts/Messages in logic: showSuccess("Text") or setError("Text")
    const funcRegex = /(?:showSuccess|setError|alert|console\.log)\(['"]([^'"]+)['"]\)/g;

    const findMatches = (regex) => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const text = match[1].trim();
        // Filter out: empty, single characters, purely numbers, or common code keywords
        if (text && 
            text.length > 1 && 
            isNaN(text) && 
            !text.includes('/') && // ignore paths
            !/^[a-z0-9_]+$/i.test(text) // ignore simple variable-like strings (camelCase/snake_case)
        ) {
          results.add(text);
        }
      }
    };

    findMatches(tagRegex);
    findMatches(propRegex);
    findMatches(curlyRegex);
    findMatches(funcRegex);
  });

  const sortedResults = Array.from(results).sort();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedResults, null, 2));
  
  console.log(`🔍 Scanned ${files.length} files.`);
  console.log(`✅ Extracted ${sortedResults.length} unique strings.`);
}

extractText();