# Smart Reviewer MCP

AI-powered code review with automatic fixes, complexity analysis, and maintainability scoring.

## 📦 Installation

```bash
npm install -g @j0kz/smart-reviewer-mcp
```

Or use with npx:
```bash
npx @j0kz/smart-reviewer-mcp
```

## 🎯 Features

✅ **Code Quality Analysis**
- Variable naming conventions
- Code complexity metrics
- Maintainability scoring
- Duplicate code detection

✅ **Anti-Pattern Detection**
- `var` usage (should use `const`/`let`)
- `==` instead of `===`
- `console.log` in production
- Empty catch blocks
- Magic numbers
- Nested ternaries

✅ **Automatic Fixes**
- Apply fixes automatically
- Batch fix multiple issues
- Safe transformation validation

✅ **Metrics & Scoring**
- Cyclomatic complexity
- Lines of code (LOC)
- Comment density
- Overall quality score (0-100)

## 🚀 Usage

### Basic Usage

Ask your AI editor:
```
Review src/index.ts
```

### Advanced Usage

```
Review all files in src/ and suggest improvements
Apply auto-fixes to high-severity issues
Calculate complexity for src/utils.ts
```

## 🔧 Available Tools

### 1. `review_file`

Review a single file for code quality issues.

**Parameters**:
- `filePath` (string, required): Path to file
- `config` (object, optional):
  - `severity`: `"strict"` | `"moderate"` | `"lenient"` (default: `"moderate"`)
  - `autoFix`: boolean (default: `false`)
  - `includeMetrics`: boolean (default: `true`)

**Example**:
```json
{
  "filePath": "./src/index.ts",
  "config": {
    "severity": "strict",
    "includeMetrics": true
  }
}
```

**Response**:
```json
{
  "file": "./src/index.ts",
  "issues": [
    {
      "line": 42,
      "severity": "error",
      "message": "Empty catch block. Handle errors properly.",
      "rule": "no-empty-catch",
      "fix": {
        "description": "Add error handling",
        "oldCode": "} catch (e) {}",
        "newCode": "} catch (e) { console.error(e); }"
      }
    }
  ],
  "metrics": {
    "complexity": 15,
    "maintainability": 72,
    "linesOfCode": 234,
    "commentDensity": 12,
    "duplicateBlocks": 3
  },
  "suggestions": [
    "High complexity (15). Consider breaking down into smaller functions.",
    "Add more documentation for complex logic."
  ],
  "overallScore": 78,
  "performance": {
    "duration": 45,
    "memoryUsed": 12.5
  }
}
```

### 2. `batch_review`

Review multiple files at once.

**Parameters**:
- `filePaths` (string[], required): Array of file paths
- `config` (object, optional): Same as `review_file`

**Example**:
```json
{
  "filePaths": [
    "./src/index.ts",
    "./src/utils.ts",
    "./src/api.ts"
  ],
  "config": {
    "severity": "moderate"
  }
}
```

### 3. `apply_fixes`

Apply automatic fixes to a file.

**Parameters**:
- `filePath` (string, required): Path to file

**Example**:
```json
{
  "filePath": "./src/index.ts"
}
```

## 📊 Severity Levels

### Strict Mode
- Enforces all rules strictly
- Low tolerance for code smells
- Best for production code
- Target score: 90+

### Moderate Mode (Default)
- Balanced approach
- Reasonable thresholds
- Good for most projects
- Target score: 70+

### Lenient Mode
- More forgiving
- Focuses on critical issues
- Good for legacy code
- Target score: 50+

## 🎯 Code Quality Metrics

### Cyclomatic Complexity

Measures code path complexity:
- **1-10**: Simple, easy to test
- **11-20**: Moderate, needs attention
- **21-50**: Complex, refactor recommended
- **50+**: Very complex, must refactor

### Maintainability Index

Score from 0-100:
- **85-100**: Excellent maintainability
- **65-84**: Good maintainability
- **50-64**: Needs improvement
- **0-49**: Difficult to maintain

### Comment Density

Percentage of comment lines:
- **20%+**: Well documented
- **10-20%**: Adequate
- **5-10%**: Sparse
- **<5%**: Undocumented

## 🔍 Detected Issues

### Error Severity

Issues that must be fixed:
- Empty catch blocks
- Use of deprecated APIs
- Potential runtime errors

### Warning Severity

Issues that should be addressed:
- `var` usage
- `==` instead of `===`
- High complexity functions
- Too many parameters

### Info Severity

Minor improvements:
- Long lines (>120 chars)
- TODO comments
- Magic numbers
- Multiple blank lines

## 🛠️ Auto-Fix Capabilities

### Automatically Fixable

✅ `var` → `const`/`let`
✅ `==` → `===`
✅ Remove `console.log`
✅ Remove multiple blank lines
✅ Fix simple formatting issues

### Manually Fixable

⚠️ High complexity (requires refactoring)
⚠️ Empty catch blocks (needs error handling)
⚠️ Magic numbers (needs constants)

## 📈 Integration with Shared Package

Smart Reviewer uses `@mcp-tools/shared` for:

- **File Caching**: 90%+ faster repeated reads
- **Analysis Caching**: Instant results for unchanged files
- **Batch Processing**: Analyze multiple files concurrently
- **Performance Monitoring**: Track analysis speed

### Cache Benefits

```
First analysis:  150ms
Cached analysis: 5ms
Improvement:     97%
```

## 🎨 Usage Examples

### Example 1: Basic Review

**Input**:
```javascript
var x = 1;
if (x == 1) {
  console.log('test');
}
```

**AI Prompt**: "Review this code"

**Output**:
```
Found 3 issues:
❌ Line 1: Use 'const' instead of 'var' [no-var]
❌ Line 2: Use '===' instead of '==' [eqeqeq]
⚠️  Line 3: Remove console.log [no-console]

Complexity: 2
Maintainability: 85
Overall Score: 70/100
```

### Example 2: Project-Wide Review

**AI Prompt**: "Review all TypeScript files in src/"

**Output**:
```
Analyzed 25 files in 2.3s

High Priority Issues: 12
Medium Priority: 34
Low Priority: 89

Top Issues:
1. src/api.ts:45 - Empty catch block (error)
2. src/utils.ts:102 - Function too complex (warning)
3. src/index.ts:12 - Use === instead of == (warning)

Average Metrics:
- Complexity: 18
- Maintainability: 65
- Overall Score: 72/100

Recommendations:
✓ Fix 12 error-level issues immediately
✓ Refactor 5 high-complexity functions
✓ Add documentation to 8 files
```

### Example 3: Auto-Fix

**AI Prompt**: "Review and fix src/index.ts"

**Output**:
```
Applied 15 automatic fixes:
✓ Replaced 5 'var' with 'const'
✓ Changed 3 '==' to '==='
✓ Removed 7 console.log statements

Manual fixes needed:
⚠️ Line 42: Empty catch block (requires error handling)
⚠️ Line 89: High complexity (requires refactoring)
```

## 🔧 Configuration Options

### Severity Thresholds

Customize thresholds in config:

```json
{
  "config": {
    "severity": "strict",
    "thresholds": {
      "complexity": 10,
      "maintainability": 80,
      "lineLength": 100
    }
  }
}
```

### Excluded Rules

Disable specific rules:

```json
{
  "config": {
    "excludedRules": ["no-console", "no-todo"]
  }
}
```

### Custom Patterns

Add custom pattern checks:

```json
{
  "config": {
    "customRules": {
      "no-any": {
        "pattern": ": any",
        "message": "Avoid using 'any' type",
        "severity": "warning"
      }
    }
  }
}
```

## 🚀 Performance Tips

1. **Use File-Level Review**: Faster than project-wide
2. **Enable Caching**: 90%+ speed improvement
3. **Batch Operations**: Process multiple files efficiently
4. **Exclude node_modules**: Add to ignore patterns

```json
{
  "config": {
    "excludePatterns": ["node_modules/**", "dist/**", "*.test.ts"]
  }
}
```

## 🔗 Integration Patterns

### With Architecture Analyzer

```
1. Analyze architecture → Find problematic modules
2. Review code quality → Get detailed issues
3. Apply fixes → Improve maintainability
```

### With Test Generator

```
1. Review code → Identify missing coverage
2. Generate tests → Create test suite
3. Re-review → Verify improvements
```

### With Refactor Assistant

```
1. Review code → Find high complexity
2. Extract functions → Reduce complexity
3. Re-review → Confirm improvements
```

## 📚 Best Practices

1. **Run regularly**: Review code before commits
2. **Fix errors first**: Address critical issues immediately
3. **Monitor trends**: Track metrics over time
4. **Use auto-fix**: Apply safe fixes automatically
5. **Set targets**: Aim for 80+ quality score

## 🆘 Troubleshooting

### Issue: False Positives

**Problem**: Detecting issues in generated code

**Solution**: Add ignore comments
```javascript
// smart-reviewer-ignore-next-line
const generated = eval(userInput);
```

### Issue: Slow Performance

**Problem**: Review takes too long

**Solution**:
- Review individual files instead of entire project
- Enable caching in shared package
- Exclude large generated files

### Issue: Incorrect Metrics

**Problem**: Complexity seems wrong

**Solution**:
- Complexity is calculated per function, not per file
- Check for nested conditionals and loops
- Consider refactoring if >20

## 📖 See Also

- [Architecture Analyzer](Architecture-Analyzer) - Detect structural issues
- [Refactor Assistant](Refactor-Assistant) - Apply refactorings
- [Test Generator](Test-Generator) - Generate test coverage
- [Integration Patterns](Integration-Patterns) - Chain MCPs

---

**[← Back to Home](Home)** | **[Next: Test Generator →](Test-Generator)**
