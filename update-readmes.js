#!/usr/bin/env node
/**
 * Update all 8 MCP package READMEs with complete information
 */

import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const packagesDir = './packages';

// Standard Related Packages section for ALL READMEs
const relatedPackagesSection = `
## 📦 Complete @j0kz MCP Development Toolkit

This package is part of a comprehensive suite of 8 MCP agents for professional development:

### 🎯 Code Quality Suite
- **[@j0kz/smart-reviewer-mcp](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp)** - AI-powered code review and quality analysis
- **[@j0kz/test-generator-mcp](https://www.npmjs.com/package/@j0kz/test-generator-mcp)** - Automated test generation with edge cases
- **[@j0kz/refactor-assistant-mcp](https://www.npmjs.com/package/@j0kz/refactor-assistant-mcp)** - Intelligent code refactoring tools

### 🏗️ Architecture & Design
- **[@j0kz/architecture-analyzer-mcp](https://www.npmjs.com/package/@j0kz/architecture-analyzer-mcp)** - Architecture analysis and dependency graphs
- **[@j0kz/api-designer-mcp](https://www.npmjs.com/package/@j0kz/api-designer-mcp)** - REST/GraphQL API design and OpenAPI generation
- **[@j0kz/db-schema-mcp](https://www.npmjs.com/package/@j0kz/db-schema-mcp)** - Database schema design and migrations

### 📚 Documentation & Security
- **[@j0kz/doc-generator-mcp](https://www.npmjs.com/package/@j0kz/doc-generator-mcp)** - Automated JSDoc, README, and API documentation
- **[@j0kz/security-scanner-mcp](https://www.npmjs.com/package/@j0kz/security-scanner-mcp)** - Security vulnerability scanning and OWASP checks

### Install Complete Suite

\`\`\`bash
# Claude Code - Install all 8 MCPs
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user
claude mcp add doc-generator "npx @j0kz/doc-generator-mcp" --scope user
claude mcp add security-scanner "npx @j0kz/security-scanner-mcp" --scope user
claude mcp add refactor-assistant "npx @j0kz/refactor-assistant-mcp" --scope user
claude mcp add api-designer "npx @j0kz/api-designer-mcp" --scope user
claude mcp add db-schema "npx @j0kz/db-schema-mcp" --scope user

# Verify all installed
claude mcp list
\`\`\`

### Other Editors

**Cursor/Windsurf/Roo Code**: See [Editor Compatibility Guide](https://github.com/j0kz/mcp-agents/blob/main/EDITOR_COMPATIBILITY.md)
`;

const packages = [
  'smart-reviewer',
  'test-generator',
  'architecture-analyzer',
  'doc-generator',
  'security-scanner',
  'refactor-assistant',
  'api-designer',
  'db-schema'
];

console.log('🔄 Updating all 8 MCP package READMEs...\n');

packages.forEach(pkg => {
  const readmePath = join(packagesDir, pkg, 'README.md');

  try {
    let content = readFileSync(readmePath, 'utf-8');

    // Remove any Spanish sections
    content = content.replace(/## Limitaciones.*?(?=##|$)/gs, '');
    content = content.replace(/❌.*?\n/g, '');

    // Replace Related Packages section or add it before Contributing
    const relatedPackagesRegex = /## 📦 Related Packages.*?(?=##|$)/gs;

    if (relatedPackagesRegex.test(content)) {
      content = content.replace(relatedPackagesRegex, relatedPackagesSection);
    } else {
      // Add before Contributing section
      content = content.replace(
        /## 🤝 Contributing/,
        relatedPackagesSection + '\n\n---\n\n## 🤝 Contributing'
      );
    }

    // Write updated content
    writeFileSync(readmePath, content, 'utf-8');
    console.log(`✅ Updated ${pkg}/README.md`);

  } catch (error) {
    console.error(`❌ Failed to update ${pkg}/README.md:`, error.message);
  }
});

console.log('\n✨ All READMEs updated successfully!');
console.log('\nNext steps:');
console.log('1. npm run build');
console.log('2. Publish to NPM');
