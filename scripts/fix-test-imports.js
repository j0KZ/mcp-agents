#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixTestImports() {
  const packages = [
    'smart-reviewer',
    'security-scanner',
    'architecture-analyzer',
    'refactor-assistant',
    'api-designer',
    'db-schema',
    'doc-generator',
    'config-wizard'
  ];

  for (const pkg of packages) {
    const testsDir = path.join(__dirname, '..', 'packages', pkg, 'tests');

    if (!fs.existsSync(testsDir)) continue;

    const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.ts'));

    for (const file of testFiles) {
      const filePath = path.join(testsDir, file);
      let content = fs.readFileSync(filePath, 'utf-8');

      // Fix the import path
      // From: import * as target from './D:\Users\...\src\analyzer';
      // To: import * as target from '../src/analyzer.js';

      const srcFileName = file.replace('.test.ts', '.ts');

      // Find the broken import line
      const brokenImportRegex = /import \* as target from '.*\\src\\(.+)';/;
      const match = content.match(brokenImportRegex);

      if (match) {
        const fileName = match[1].replace(/\\/g, '/');
        const correctImport = `import * as target from '../src/${fileName}.js';`;
        content = content.replace(brokenImportRegex, correctImport);
      } else {
        // Try another pattern
        const altBrokenImportRegex = /import \* as target from '.*[/\\]([^/\\]+)';/;
        const altMatch = content.match(altBrokenImportRegex);

        if (altMatch) {
          const fileName = altMatch[1].replace('.ts', '').replace('.js', '');
          const correctImport = `import * as target from '../src/${fileName}.js';`;
          content = content.replace(altBrokenImportRegex, correctImport);
        }
      }

      // Also fix the class/function references
      // Replace instances like: new CodeAnalyzer() with new target.CodeAnalyzer()
      content = content.replace(/new (\w+)\(/g, (match, className) => {
        if (className === 'target') return match;
        return `new target.${className}(`;
      });

      // Fix function calls
      content = content.replace(/expect\((\w+)\(/g, (match, funcName) => {
        if (funcName === 'target' || funcName === 'instance') return match;
        return `expect(target.${funcName}(`;
      });

      // Fix the instance variable declarations
      content = content.replace(/let instance: (\w+);/g, 'let instance: any;');

      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in ${pkg}/tests/${file}`);
    }
  }
}

fixTestImports();
console.log('\nAll test imports fixed!');