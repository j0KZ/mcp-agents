---
name: legacy-modernizer
version: 1.0.0
type: refactoring
tags: [legacy, modernization, refactoring, migration, technical-debt]
compatibility: any-project
dependencies: optional
language: any
description: Modernize legacy code safely in ANY project without breaking existing functionality
---

# Legacy Modernizer - Safe Legacy Code Evolution

## 🎯 When to Use This Skill

Use when dealing with:

- Code written 5+ years ago
- No tests or documentation
- "Don't touch - it works" code
- Deprecated dependencies
- Security vulnerabilities in old code
- Performance issues in legacy systems

## ⚡ The Golden Rule of Legacy Code

**NEVER refactor without tests!** First make it testable, then make it better.

## 📋 The Safe Modernization Process

### Phase 1: UNDERSTAND (Don't Touch Yet!)

#### WITH MCP Tools:

```
"Analyze the architecture and dependencies of [legacy module]"
"Document how this legacy code works"
```

#### WITHOUT MCP:

**1. Map the Territory:**

```bash
# Find all files related to the feature
grep -r "LegacyClass" --include="*.js" --include="*.py" --include="*.java"

# Trace execution flow
echo "=== LEGACY CODE MAP ===" > legacy_analysis.md
echo "Entry points:" >> legacy_analysis.md
grep -r "main\|init\|start" --include="*.js" >> legacy_analysis.md

# Find dependencies
echo "Dependencies:" >> legacy_analysis.md
grep -r "require\|import\|include" legacy_module/ >> legacy_analysis.md
```

**2. Document Current Behavior:**

```javascript
// Add temporary logging to understand flow
function legacyFunction(data) {
  console.log('[LEGACY TRACE] Input:', JSON.stringify(data));
  // ... existing code ...
  console.log('[LEGACY TRACE] Output:', result);
  return result;
}
```

### Phase 2: PROTECT (Add Safety Net)

#### WITH MCP (Test Generator):

```
"Generate characterization tests for this legacy code"
```

#### WITHOUT MCP:

**Characterization Tests (Capture Current Behavior):**

```javascript
// Not testing if it's "right", just what it currently does
describe('Legacy System - Current Behavior', () => {
  it('should handle normal input as currently implemented', () => {
    const result = legacyFunction({ id: 1, name: 'test' });

    // Capture EXACT current output
    expect(result).toEqual({
      status: 'OK',
      data: 'TEST', // Even if this seems wrong!
      timestamp: expect.any(Number),
    });
  });

  it('should handle null input as currently implemented', () => {
    // Even if it crashes, document it!
    expect(() => legacyFunction(null)).toThrow('Cannot read property');
  });
});
```

**Golden Master Testing:**

```bash
# Capture current outputs
for input in test_inputs/*; do
  ./legacy_app < "$input" > "golden_masters/$(basename $input).output"
done

# After changes, verify outputs match
for input in test_inputs/*; do
  ./modernized_app < "$input" > temp.output
  diff "golden_masters/$(basename $input).output" temp.output
done
```

### Phase 3: ISOLATE (Strangler Fig Pattern)

**Wrap Legacy Code:**

```javascript
// Step 1: Create wrapper (Facade)
class ModernInterface {
  constructor() {
    this.legacy = new LegacySystem();
  }

  async processData(input) {
    // Modern interface
    const legacyFormat = this.convertToLegacyFormat(input);
    const result = this.legacy.oldProcessMethod(legacyFormat);
    return this.convertToModernFormat(result);
  }

  convertToLegacyFormat(modern) {
    // Transform modern input to legacy format
  }

  convertToModernFormat(legacy) {
    // Transform legacy output to modern format
  }
}
```

### Phase 4: MODERNIZE (Incremental Updates)

#### Safe Modernization Patterns:

**1. Branch by Abstraction:**

```javascript
class DataProcessor {
  constructor(useModern = false) {
    this.useModern = useModern;
  }

  process(data) {
    if (this.useModern) {
      return this.modernProcess(data);
    }
    return this.legacyProcess(data);
  }

  legacyProcess(data) {
    // Original implementation
  }

  modernProcess(data) {
    // New implementation
  }
}
```

**2. Parallel Run (Verify Compatibility):**

```javascript
async function processWithVerification(data) {
  const [legacyResult, modernResult] = await Promise.all([
    legacyProcess(data),
    modernProcess(data),
  ]);

  // Compare results
  if (JSON.stringify(legacyResult) !== JSON.stringify(modernResult)) {
    console.error('Results mismatch!', { legacyResult, modernResult });
    // Use legacy result for safety
    return legacyResult;
  }

  // Both match, safe to use modern
  return modernResult;
}
```

## 🔧 Common Modernization Tasks

### 1. Callback Hell → Promises/Async

**Before (Legacy):**

```javascript
getData(function (err, data) {
  if (err) return handleError(err);
  processData(data, function (err, result) {
    if (err) return handleError(err);
    saveResult(result, function (err) {
      if (err) return handleError(err);
      done();
    });
  });
});
```

**After (Modern):**

```javascript
async function modernFlow() {
  try {
    const data = await getData();
    const result = await processData(data);
    await saveResult(result);
    done();
  } catch (err) {
    handleError(err);
  }
}
```

### 2. Global Variables → Module Pattern

**Before (Legacy):**

```javascript
var globalConfig = {};
var globalState = {};

function doSomething() {
  globalState.counter++;
  return globalConfig.prefix + globalState.counter;
}
```

**After (Modern):**

```javascript
class AppModule {
  constructor(config) {
    this.config = config;
    this.state = { counter: 0 };
  }

  doSomething() {
    this.state.counter++;
    return this.config.prefix + this.state.counter;
  }
}

export default AppModule;
```

### 3. SQL Injection → Parameterized Queries

**Before (Legacy - DANGEROUS):**

```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);
```

**After (Modern - SAFE):**

```javascript
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### 4. Old Dependencies → Modern Alternatives

```javascript
// Mapping old to new
const DEPENDENCY_MAP = {
  request: 'axios', // HTTP client
  async: 'native-promises', // Flow control
  underscore: 'lodash', // Utilities
  bower: 'npm', // Package management
  grunt: 'webpack', // Build tool
  jquery: 'vanilla-js', // DOM manipulation
};

// Safe migration approach:
// 1. Install new alongside old
// 2. Migrate one file at a time
// 3. Run tests after each migration
// 4. Remove old when complete
```

## 📊 Modernization Checklist

### Security Fixes (Priority 1):

- [ ] SQL injection vulnerabilities
- [ ] XSS vulnerabilities
- [ ] Hardcoded secrets removed
- [ ] Outdated crypto replaced
- [ ] Input validation added
- [ ] HTTPS enforcement

### Code Quality (Priority 2):

- [ ] Global variables eliminated
- [ ] Callbacks → Promises/Async
- [ ] Var → Let/Const
- [ ] == → ===
- [ ] Error handling improved
- [ ] Dead code removed

### Performance (Priority 3):

- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] Lazy loading added
- [ ] Bundle size reduced
- [ ] Memory leaks fixed

### Developer Experience (Priority 4):

- [ ] Tests added (>60% coverage)
- [ ] Documentation written
- [ ] Linting configured
- [ ] Types added (TypeScript/JSDoc)
- [ ] CI/CD pipeline setup

## 🚨 Red Flags in Legacy Code

Watch for these danger signs:

```javascript
// 🚨 Date handling
new Date('2024-01-01'); // Timezone issues!

// 🚨 Type coercion
if (value == true)
  // Use === instead

  // 🚨 Eval usage
  eval(userInput); // Security nightmare!

// 🚨 Synchronous I/O
const data = fs.readFileSync(); // Blocks everything!

// 🚨 Magic numbers
if (status === 2)
  // What does 2 mean?

  // 🚨 No error handling
  JSON.parse(data); // Will crash on bad input
```

## 💡 Migration Strategies by Language

### JavaScript → Modern JS:

```bash
# Use automated tools first
npx lebab --transform arrow,let,template legacy.js -o modern.js
npx eslint --fix legacy.js

# TypeScript migration
npx tsc --init
mv legacy.js legacy.ts
npx tsc --allowJs --checkJs
```

### Python 2 → Python 3:

```bash
# Automated conversion
2to3 -w legacy.py

# Common fixes
print "Hello"     → print("Hello")
xrange()         → range()
unicode()        → str()
```

### jQuery → Vanilla JS:

```javascript
// jQuery
$('#element').hide();
$('.class').on('click', handler);

// Vanilla
document.getElementById('element').style.display = 'none';
document.querySelectorAll('.class').forEach(el => {
  el.addEventListener('click', handler);
});
```

## 📈 Success Metrics

Track modernization progress:

```markdown
## Legacy Modernization Scorecard

### Week 1 | Week 4 | Week 8

----------|---------|--------
Coverage: 0% | 45% | 78%
Security Issues: 12 | 6 | 1
Tech Debt (hours): 200 | 120 | 40
Build Time: 5min | 3min | 1min
Bundle Size: 2.4MB | 1.2MB | 600KB
Load Time: 4s | 2.5s | 1.2s
```

## 🔄 Rollback Strategy

Always have an escape plan:

```javascript
// Feature flags for safe rollout
if (featureFlags.useModernSystem) {
  return modernImplementation();
} else {
  return legacyImplementation();
}

// Database migrations with rollback
// up.sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;

// down.sql
ALTER TABLE users DROP COLUMN email_verified;
```

Remember: Legacy code is not bad code - it's proven code that needs careful evolution! 🏛️→🏢
