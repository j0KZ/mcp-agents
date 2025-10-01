# Smart Code Reviewer Agent

Intelligent code review agent with learning capabilities that detects anti-patterns, code smells, and provides actionable suggestions with automatic fixes.

## Features

- 🔍 **Anti-pattern Detection**: Identifies common coding mistakes and bad practices
- 📊 **Code Metrics**: Calculates complexity, maintainability, and code quality scores
- 🔧 **Auto-fix**: Automatically applies fixes for common issues
- 📈 **Quality Scoring**: Provides 0-100 quality score for reviewed code
- 💡 **Smart Suggestions**: Context-aware improvement recommendations

## Tools Available

### `review_file`
Review a single code file and get detailed analysis.

**Parameters:**
- `filePath` (string, required): Path to the file to review
- `config` (object, optional): Review configuration
  - `severity`: 'strict' | 'moderate' | 'lenient'
  - `autoFix`: boolean
  - `includeMetrics`: boolean

**Example:**
```bash
claude code "Review src/app.js with smart-reviewer"
```

**Response includes:**
- Issues found (line number, severity, message, suggested fix)
- Code metrics (complexity, maintainability, LOC, comment density)
- Improvement suggestions
- Overall quality score

### `batch_review`
Review multiple files at once.

**Parameters:**
- `filePaths` (array, required): Array of file paths
- `config` (object, optional): Review configuration

**Example:**
```bash
claude code "Review all files in src/ with smart-reviewer"
```

### `apply_fixes`
Automatically apply fixes to a file.

**Parameters:**
- `filePath` (string, required): Path to the file to fix

**Example:**
```bash
claude code "Apply smart-reviewer fixes to src/utils.js"
```

## Issues Detected

| Rule | Severity | Description |
|------|----------|-------------|
| `no-var` | warning | Use const/let instead of var |
| `no-console` | info | Remove console.log before production |
| `eqeqeq` | warning | Use === instead of == |
| `max-params` | warning | Function has too many parameters |
| `no-magic-numbers` | info | Avoid magic numbers, use constants |
| `no-empty-catch` | error | Empty catch blocks |
| `no-nested-ternary` | warning | Nested ternary operators |
| `max-line-length` | info | Lines longer than 120 characters |

## Code Metrics

- **Complexity**: Cyclomatic complexity score
- **Maintainability**: Maintainability index (0-100)
- **Lines of Code**: Non-empty lines count
- **Comment Density**: Percentage of comments
- **Duplicate Blocks**: Number of duplicate code sections

## Example Output

```json
{
  "file": "src/app.js",
  "issues": [
    {
      "line": 15,
      "severity": "warning",
      "message": "Avoid 'var'. Use 'const' or 'let' instead.",
      "rule": "no-var",
      "fix": {
        "description": "Replace 'var' with 'const'",
        "oldCode": "var x = 10;",
        "newCode": "const x = 10;"
      }
    }
  ],
  "metrics": {
    "complexity": 8,
    "maintainability": 75,
    "linesOfCode": 120,
    "commentDensity": 12,
    "duplicateBlocks": 2
  },
  "suggestions": [
    "Fix 2 critical errors immediately.",
    "Address 5 warnings to improve code quality."
  ],
  "overallScore": 78
}
```

## Integration with Claude Code

The agent integrates seamlessly with Claude Code workflows:

```bash
# Pre-commit review
claude code "Review my changes before commit with smart-reviewer"

# Review specific file
claude code "Review src/api/auth.js and suggest improvements"

# Batch review
claude code "Review all TypeScript files in the project"

# Auto-fix and review
claude code "Fix and review src/legacy-code.js"
```

## Configuration

Create `~/.config/claude-code/agents.config.json`:

```json
{
  "smart-reviewer": {
    "severity": "strict",
    "autoFix": true,
    "customRules": "./my-rules.json",
    "excludePatterns": ["*.test.js", "*.spec.js"]
  }
}
```

## Custom Rules

You can extend the reviewer with custom rules (future feature):

```json
{
  "rules": {
    "no-lodash": {
      "severity": "warning",
      "message": "Prefer native JavaScript over Lodash",
      "pattern": "import.*from.*'lodash'"
    }
  }
}
```

## Best Practices

1. **Run before commits**: Integrate into git hooks
2. **Review in batches**: More efficient than file-by-file
3. **Use auto-fix judiciously**: Review automated changes
4. **Track metrics over time**: Monitor code quality trends
5. **Customize severity**: Adjust to your team's standards

## Roadmap

- [ ] Machine learning-based pattern recognition
- [ ] Team-specific rule learning
- [ ] Integration with popular linters (ESLint, TSLint)
- [ ] Historical quality tracking
- [ ] Custom rule engine
- [ ] IDE plugin support
