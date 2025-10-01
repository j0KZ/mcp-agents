# Refactoring Assistant MCP Server

A powerful MCP (Model Context Protocol) server that provides intelligent code refactoring capabilities including function extraction, async/await conversion, conditional simplification, dead code removal, design pattern application, and comprehensive code analysis.

## Features

- **Extract Function**: Automatically extract code blocks into separate functions with parameter detection
- **Async/Await Conversion**: Convert callback-based code to modern async/await syntax
- **Simplify Conditionals**: Refactor complex nested conditionals using guard clauses and ternary operators
- **Remove Dead Code**: Eliminate unused imports, variables, and unreachable code
- **Design Patterns**: Apply 10+ design patterns (Singleton, Factory, Observer, Strategy, etc.)
- **Variable Renaming**: Safely rename variables with scope awareness
- **Code Analysis**: Get intelligent refactoring suggestions based on best practices
- **Metrics Calculation**: Analyze code quality with complexity, LOC, and maintainability metrics

## Installation

```bash
npm install @my-claude-agents/refactor-assistant
```

## MCP Configuration

Add to your MCP settings file (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "refactor-assistant": {
      "command": "npx",
      "args": ["-y", "@my-claude-agents/refactor-assistant"]
    }
  }
}
```

## Available Tools

### 1. extract_function

Extract a code block into a separate function with automatic parameter and return value detection.

**Parameters:**
- `code` (string): Source code containing the block
- `functionName` (string): Name for the extracted function
- `startLine` (number): Start line (1-indexed)
- `endLine` (number): End line (1-indexed, inclusive)
- `async` (boolean, optional): Make function async
- `arrow` (boolean, optional): Use arrow function syntax

**Example:**

```typescript
// Before
function processUser() {
  const user = getUser();
  if (!user.verified) {
    sendEmail(user.email);
    updateStatus(user.id, 'pending');
  }
}

// Extract lines 3-5 to function 'verifyUser'
// After
function processUser() {
  const user = getUser();
  verifyUser(user);
}

function verifyUser(user) {
  if (!user.verified) {
    sendEmail(user.email);
    updateStatus(user.id, 'pending');
  }
}
```

### 2. convert_to_async

Convert callback-based code to async/await with proper error handling.

**Parameters:**
- `code` (string): Source code with callbacks
- `useTryCatch` (boolean, optional): Wrap in try/catch blocks (default: true)

**Example:**

```typescript
// Before
function loadData(callback) {
  fs.readFile('data.json', (err, data) => {
    if (err) return callback(err);
    callback(null, JSON.parse(data));
  });
}

// After
async function loadData() {
  try {
    const data = await fs.readFile('data.json');
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
}
```

### 3. simplify_conditionals

Simplify nested conditionals using guard clauses and combined conditions.

**Parameters:**
- `code` (string): Source code with conditionals
- `useGuardClauses` (boolean, optional): Apply guard clauses (default: true)
- `useTernary` (boolean, optional): Use ternary operators (default: true)

**Example:**

```typescript
// Before
function processOrder(order) {
  if (order.isValid) {
    if (order.isPaid) {
      if (order.items.length > 0) {
        return shipOrder(order);
      }
    }
  }
  return false;
}

// After
function processOrder(order) {
  if (!order.isValid) return false;
  if (!order.isPaid) return false;
  if (order.items.length === 0) return false;

  return shipOrder(order);
}
```

### 4. remove_dead_code

Remove unused code including imports, variables, and unreachable statements.

**Parameters:**
- `code` (string): Source code to clean
- `removeUnusedImports` (boolean, optional): Remove unused imports (default: true)
- `removeUnreachable` (boolean, optional): Remove unreachable code (default: true)

**Example:**

```typescript
// Before
import { unusedFunction, usedFunction } from './utils';

function example() {
  const result = usedFunction();
  return result;
  console.log('This is unreachable');
  const deadVariable = 42;
}

// After
import { usedFunction } from './utils';

function example() {
  const result = usedFunction();
  return result;
}
```

### 5. apply_pattern

Apply design patterns to existing code.

**Supported Patterns:**
- `singleton` - Ensure a class has only one instance
- `factory` - Create objects without specifying exact class
- `observer` - Define one-to-many dependency between objects
- `strategy` - Define family of algorithms
- `decorator` - Add behavior to objects dynamically
- `adapter` - Convert interface of class to another
- `facade` - Provide unified interface to subsystems
- `proxy` - Provide surrogate for another object
- `command` - Encapsulate request as object
- `chain-of-responsibility` - Pass request along chain of handlers

**Parameters:**
- `code` (string): Source code to refactor
- `pattern` (string): Design pattern to apply
- `patternOptions` (object, optional): Pattern-specific options

**Example (Singleton):**

```typescript
// Before
class Database {
  constructor() {
    this.connection = createConnection();
  }
}

// After
class Database {
  private static instance: Database;

  private constructor() {
    this.connection = createConnection();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
```

### 6. rename_variable

Rename variables consistently throughout the code with word boundary detection.

**Parameters:**
- `code` (string): Source code containing variable
- `oldName` (string): Current variable name
- `newName` (string): New variable name
- `includeComments` (boolean, optional): Rename in comments too

**Example:**

```typescript
// Before
const temp = getUserData();
processTemp(temp);
// temp holds user data

// After (renaming 'temp' to 'userData')
const userData = getUserData();
processUserData(userData);
// userData holds user data
```

### 7. suggest_refactorings

Analyze code and provide intelligent refactoring suggestions.

**Parameters:**
- `code` (string): Source code to analyze
- `filePath` (string, optional): File path for context

**Returns suggestions for:**
- Long functions that should be extracted
- Deep nesting that should be simplified
- Callback patterns that could use async/await
- Duplicate code blocks
- Complex conditionals

**Example Output:**

```json
{
  "suggestions": [
    {
      "type": "extract-function",
      "severity": "warning",
      "message": "Function 'processData' is 75 lines long",
      "location": { "line": 10 },
      "rationale": "Long functions are harder to understand and maintain."
    },
    {
      "type": "convert-to-async",
      "severity": "info",
      "message": "Callback detected - consider converting to async/await",
      "location": { "line": 25 },
      "snippet": "fs.readFile('file.txt', (err, data) => {",
      "rationale": "Async/await provides better error handling and readability."
    }
  ]
}
```

### 8. calculate_metrics

Calculate code quality metrics.

**Parameters:**
- `code` (string): Source code to analyze

**Returns:**
- `complexity` - Cyclomatic complexity
- `linesOfCode` - Lines of code (excluding comments/blanks)
- `functionCount` - Number of functions
- `maxNestingDepth` - Maximum nesting depth
- `maintainabilityIndex` - Maintainability score (0-100)

**Example Output:**

```json
{
  "metrics": {
    "complexity": 12,
    "linesOfCode": 150,
    "functionCount": 8,
    "maxNestingDepth": 3,
    "maintainabilityIndex": 72
  }
}
```

## Usage Examples

### With Claude Desktop

Once configured, you can use the refactoring tools in your Claude conversations:

```
Extract the validation logic from lines 10-25 in my user registration function into a separate 'validateUser' function.

Suggest refactorings for this code:
[paste code]

Apply the singleton pattern to my Database class.

Convert this callback-based code to async/await.
```

### Programmatic Usage

```typescript
import {
  extractFunction,
  convertToAsync,
  suggestRefactorings,
  calculateMetrics
} from '@my-claude-agents/refactor-assistant';

// Extract a function
const result = extractFunction(sourceCode, {
  functionName: 'calculateTotal',
  startLine: 10,
  endLine: 15,
  async: false
});

if (result.success) {
  console.log('Refactored code:', result.code);
  console.log('Changes:', result.changes);
}

// Get suggestions
const suggestions = suggestRefactorings(sourceCode);
suggestions.forEach(s => {
  console.log(`${s.severity}: ${s.message} at line ${s.location.line}`);
});

// Calculate metrics
const metrics = calculateMetrics(sourceCode);
console.log('Complexity:', metrics.complexity);
console.log('Maintainability:', metrics.maintainabilityIndex);
```

## Best Practices

1. **Review Changes**: Always review refactored code before committing
2. **Test After Refactoring**: Run tests to ensure behavior is preserved
3. **Incremental Refactoring**: Make small, focused changes
4. **Use Suggestions**: Let the analyzer guide your refactoring priorities
5. **Check Metrics**: Monitor complexity and maintainability scores

## Code Quality Guidelines

The refactoring assistant follows these principles:

- **Single Responsibility**: Each function should do one thing
- **DRY (Don't Repeat Yourself)**: Eliminate code duplication
- **KISS (Keep It Simple)**: Prefer simple solutions
- **Guard Clauses**: Use early returns to reduce nesting
- **Async/Await**: Modern async patterns over callbacks
- **Design Patterns**: Apply proven solutions to common problems

## Limitations

- **Basic Parsing**: Uses regex-based parsing, not a full AST
- **Language Support**: Primarily designed for JavaScript/TypeScript
- **Context Awareness**: Limited understanding of broader codebase context
- **Testing**: Does not automatically update tests after refactoring

## Development

```bash
# Clone repository
git clone <repo-url>

# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Clean build artifacts
npm run clean
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please visit the GitHub repository.

## Changelog

### 1.0.0 (2025-01-XX)

- Initial release
- 8 refactoring tools
- 10+ design patterns
- Intelligent code analysis
- Comprehensive metrics calculation
