# Documentation Generator MCP

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

Automated documentation generation for TypeScript/JavaScript projects. This MCP (Model Context Protocol) server provides comprehensive tools for generating JSDoc comments, README files, API documentation, and changelogs from your source code.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [As MCP Server](#as-mcp-server)
  - [As Library](#as-library)
- [MCP Tools](#mcp-tools)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Examples](#examples)
- [Development](#development)
- [License](#license)

## Features

- **JSDoc Generation**: Automatically generate JSDoc comments for functions, classes, and interfaces
- **README Generation**: Create comprehensive README files from project structure and package.json
- **API Documentation**: Generate detailed API reference documentation
- **Changelog Generation**: Create changelogs from git commit history using conventional commits
- **TypeScript Support**: First-class TypeScript support with type inference
- **Multiple Formats**: Output in Markdown, HTML, or JSON
- **Configurable**: Extensive configuration options for all documentation types
- **MCP Integration**: Full Model Context Protocol integration for AI assistants

## Installation

### As MCP Server

Add to your MCP settings (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "doc-generator": {
      "command": "npx",
      "args": ["-y", "@my-claude-agents/doc-generator"]
    }
  }
}
```

### As Library

```bash
npm install @my-claude-agents/doc-generator
```

## Usage

### As MCP Server

Once configured, the MCP server provides the following tools to AI assistants:

- `generate_jsdoc` - Generate JSDoc comments for source files
- `generate_readme` - Create README.md files
- `generate_api_docs` - Generate API documentation
- `generate_changelog` - Create changelogs from git history
- `generate_full_docs` - Generate all documentation at once

### As Library

```typescript
import {
  generateJSDoc,
  generateReadme,
  generateApiDocs,
  generateChangelog,
} from '@my-claude-agents/doc-generator';

// Generate JSDoc for a file
const jsdoc = await generateJSDoc('./src/utils.ts', {
  style: 'typescript',
  inferTypes: true,
  addTodoTags: true,
});
console.log(jsdoc.content);

// Generate README
const readme = await generateReadme('./my-project', {
  includeBadges: true,
  includeInstallation: true,
  includeUsage: true,
});
fs.writeFileSync('README.md', readme.content);

// Generate API documentation
const apiDocs = await generateApiDocs('./src', {
  groupByCategory: true,
  includeTypes: true,
  includeInterfaces: true,
});
fs.writeFileSync('API.md', apiDocs.content);

// Generate changelog
const changelog = await generateChangelog('./', {
  conventionalCommits: true,
  groupByType: true,
  includeAuthors: true,
});
fs.writeFileSync('CHANGELOG.md', changelog.content);
```

## MCP Tools

### generate_jsdoc

Generate JSDoc comments for TypeScript/JavaScript files.

**Parameters:**
- `filePath` (string, required) - Path to source file
- `config` (object, optional):
  - `style` ('standard' | 'google' | 'typescript') - JSDoc style
  - `addTodoTags` (boolean) - Add @todo for missing docs
  - `inferTypes` (boolean) - Infer types from TypeScript
  - `includePrivate` (boolean) - Include private members

**Example:**
```json
{
  "filePath": "./src/utils.ts",
  "config": {
    "style": "typescript",
    "addTodoTags": true,
    "inferTypes": true
  }
}
```

### generate_readme

Generate comprehensive README.md files.

**Parameters:**
- `projectPath` (string, required) - Path to project root
- `config` (object, optional):
  - `projectName` (string) - Project name
  - `version` (string) - Version number
  - `author` (string) - Author information
  - `license` (string) - License type
  - `includeInstallation` (boolean) - Include installation section
  - `includeUsage` (boolean) - Include usage examples
  - `includeAPI` (boolean) - Include API reference
  - `includeBadges` (boolean) - Include badges
  - `includeTOC` (boolean) - Include table of contents

**Example:**
```json
{
  "projectPath": "./my-project",
  "config": {
    "projectName": "My Awesome Library",
    "version": "1.0.0",
    "includeBadges": true,
    "includeTOC": true
  }
}
```

### generate_api_docs

Generate detailed API documentation.

**Parameters:**
- `projectPath` (string, required) - Path to source directory
- `config` (object, optional):
  - `groupByCategory` (boolean) - Group by category
  - `includeTypes` (boolean) - Include type definitions
  - `includeInterfaces` (boolean) - Include interfaces
  - `sortAlphabetically` (boolean) - Sort alphabetically
  - `includeSourceLinks` (boolean) - Link to source code
  - `repositoryUrl` (string) - Repository URL for links

**Example:**
```json
{
  "projectPath": "./src",
  "config": {
    "groupByCategory": true,
    "includeTypes": true,
    "includeSourceLinks": true,
    "repositoryUrl": "https://github.com/user/repo"
  }
}
```

### generate_changelog

Generate changelog from git history.

**Parameters:**
- `projectPath` (string, required) - Path to git repository
- `config` (object, optional):
  - `commitLimit` (number) - Number of commits to include
  - `fromTag` (string) - Starting version tag
  - `toTag` (string) - Ending version tag
  - `groupByType` (boolean) - Group by commit type
  - `conventionalCommits` (boolean) - Parse conventional commits
  - `includeAuthors` (boolean) - Include commit authors
  - `linkCommits` (boolean) - Link to commits

**Example:**
```json
{
  "projectPath": "./",
  "config": {
    "conventionalCommits": true,
    "groupByType": true,
    "commitLimit": 100,
    "includeAuthors": true
  }
}
```

### generate_full_docs

Generate complete documentation suite.

**Parameters:**
- `projectPath` (string, required) - Project root path
- `sourceFiles` (string[], optional) - Files for JSDoc
- `config` (object, optional):
  - `projectName` (string) - Project name
  - `version` (string) - Version
  - `author` (string) - Author
  - `license` (string) - License type
  - `writeFiles` (boolean) - Write to files (default: true)

**Example:**
```json
{
  "projectPath": "./my-project",
  "sourceFiles": ["./src/index.ts", "./src/utils.ts"],
  "config": {
    "projectName": "My Library",
    "version": "1.0.0",
    "writeFiles": true
  }
}
```

## API Reference

### Functions

#### generateJSDoc

```typescript
async function generateJSDoc(
  filePath: string,
  config?: JSDocConfig
): Promise<DocResult>
```

Generate JSDoc comments for a source file.

**Parameters:**
- `filePath` - Path to the source file
- `config` - Optional JSDoc configuration

**Returns:** Promise resolving to DocResult with generated JSDoc content

**Throws:** DocError if file cannot be read or parsed

#### generateReadme

```typescript
async function generateReadme(
  projectPath: string,
  config?: ReadmeConfig
): Promise<DocResult>
```

Generate README.md from source code and package.json.

**Parameters:**
- `projectPath` - Path to project root directory
- `config` - Optional README configuration

**Returns:** Promise resolving to DocResult with README content

**Throws:** DocError if project path is invalid

#### generateApiDocs

```typescript
async function generateApiDocs(
  projectPath: string,
  config?: ApiDocsConfig
): Promise<DocResult>
```

Generate comprehensive API documentation.

**Parameters:**
- `projectPath` - Path to source directory
- `config` - Optional API docs configuration

**Returns:** Promise resolving to DocResult with API documentation

**Throws:** DocError if source directory is invalid

#### generateChangelog

```typescript
async function generateChangelog(
  projectPath: string,
  config?: ChangelogConfig
): Promise<DocResult>
```

Generate changelog from git commit history.

**Parameters:**
- `projectPath` - Path to git repository
- `config` - Optional changelog configuration

**Returns:** Promise resolving to DocResult with changelog content

**Throws:** DocError if not a git repository or git command fails

## Configuration

### JSDocConfig

```typescript
interface JSDocConfig {
  style?: 'standard' | 'google' | 'typescript';
  addTodoTags?: boolean;
  inferTypes?: boolean;
  includePrivate?: boolean;
}
```

### ReadmeConfig

```typescript
interface ReadmeConfig {
  projectName?: string;
  version?: string;
  author?: string;
  license?: string;
  includeInstallation?: boolean;
  includeUsage?: boolean;
  includeAPI?: boolean;
  includeContributing?: boolean;
  includeBadges?: boolean;
  includeTOC?: boolean;
}
```

### ApiDocsConfig

```typescript
interface ApiDocsConfig {
  groupByCategory?: boolean;
  includeTypes?: boolean;
  includeInterfaces?: boolean;
  includeEnums?: boolean;
  sortAlphabetically?: boolean;
  includeSourceLinks?: boolean;
  repositoryUrl?: string;
}
```

### ChangelogConfig

```typescript
interface ChangelogConfig {
  commitLimit?: number;
  fromTag?: string;
  toTag?: string;
  groupByType?: boolean;
  includeMerges?: boolean;
  conventionalCommits?: boolean;
  includeAuthors?: boolean;
  linkCommits?: boolean;
}
```

## Examples

### Complete Documentation Suite

```typescript
import { generateJSDoc, generateReadme, generateApiDocs, generateChangelog } from '@my-claude-agents/doc-generator';
import * as fs from 'fs';

async function generateAllDocs() {
  // Generate README
  const readme = await generateReadme('./', {
    projectName: 'My Library',
    version: '1.0.0',
    includeBadges: true,
  });
  fs.writeFileSync('README.md', readme.content);

  // Generate API docs
  const apiDocs = await generateApiDocs('./src', {
    groupByCategory: true,
  });
  fs.writeFileSync('docs/API.md', apiDocs.content);

  // Generate changelog
  const changelog = await generateChangelog('./', {
    conventionalCommits: true,
    groupByType: true,
  });
  fs.writeFileSync('CHANGELOG.md', changelog.content);

  // Generate JSDoc for specific files
  const files = ['./src/index.ts', './src/utils.ts'];
  for (const file of files) {
    const jsdoc = await generateJSDoc(file, {
      style: 'typescript',
      addTodoTags: true,
    });
    console.log(`JSDoc for ${file}:\n${jsdoc.content}`);
  }
}

generateAllDocs().catch(console.error);
```

### Custom Changelog with Date Range

```typescript
const changelog = await generateChangelog('./', {
  fromTag: 'v1.0.0',
  toTag: 'v2.0.0',
  conventionalCommits: true,
  groupByType: true,
  includeAuthors: true,
  linkCommits: true,
});

console.log(changelog.content);
```

### TypeScript-Specific JSDoc

```typescript
const jsdoc = await generateJSDoc('./src/types.ts', {
  style: 'typescript',
  inferTypes: true,
  includePrivate: false,
  addTodoTags: true,
});

console.log(jsdoc.content);
console.log('Warnings:', jsdoc.metadata.warnings);
```

## Development

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Development Mode

```bash
npm run dev
```

### Project Structure

```
doc-generator/
├── src/
│   ├── types.ts          # Type definitions
│   ├── generator.ts      # Core generation logic
│   ├── index.ts          # Public API exports
│   └── mcp-server.ts     # MCP server implementation
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## Error Handling

All functions throw `DocError` instances with structured error information:

```typescript
try {
  const result = await generateJSDoc('./nonexistent.ts');
} catch (error) {
  if (error instanceof DocError) {
    console.error('Error code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

j0kz

## Support

For issues and questions, please use the GitHub issue tracker.
