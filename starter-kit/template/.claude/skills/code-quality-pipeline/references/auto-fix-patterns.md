# Auto-Fix Patterns Guide

## Pareto Principle (80/20 Rule)

**Key Insight:** 20% of fixes resolve 80% of issues in most codebases.

smart-reviewer implements this by categorizing fixes into:
- **Safe fixes** (80% of issues, auto-applicable)
- **Manual fixes** (20% of issues, require review)

## Generate vs Apply Workflow

### Step 1: Preview Fixes
```javascript
// Always preview first
Tool: generate_auto_fixes
Input: {
  "filePath": "src/module.ts",
  "safeOnly": false  // Show all possible fixes
}
```

### Step 2: Review Output
```json
{
  "safeFixes": [
    {
      "type": "formatting",
      "description": "Fix indentation",
      "count": 15
    },
    {
      "type": "imports",
      "description": "Organize imports",
      "count": 8
    }
  ],
  "manualFixes": [
    {
      "type": "logic",
      "description": "Simplify complex condition",
      "line": 142,
      "risk": "medium"
    }
  ]
}
```

### Step 3: Apply Safe Fixes
```javascript
Tool: apply_auto_fixes
Input: {
  "filePath": "src/module.ts",
  "safeOnly": true  // Only apply safe fixes
}
```

## Safe Auto-Fixes (Auto-Apply)

### Formatting & Style
- Indentation correction
- Trailing whitespace removal
- Semicolon consistency
- Quote style (single/double)
- Line ending normalization

### Import Management
- Remove unused imports
- Organize import order
- Combine duplicate imports
- Fix import paths
- Add missing file extensions

### Simple Type Fixes
- Add explicit return types
- Fix obvious type mismatches
- Add missing type annotations
- Remove unnecessary type assertions
- Fix generic constraints

### Dead Code Removal
- Unused variables
- Unreachable code after return
- Empty catch blocks
- Commented-out code blocks
- Console.log statements (production)

### Naming Consistency
- camelCase for variables
- PascalCase for classes
- UPPER_CASE for constants
- Consistent file naming
- Fix typos in identifiers

## Manual Fixes (Review Required)

### Logic Changes
**Risk: High**
- Condition simplification
- Loop optimization
- Algorithm improvements
- Error handling changes
- Async/await conversions

**Example:**
```javascript
// Before
if (x !== null && x !== undefined) {
  // Manual fix suggested: use optional chaining
}

// After (manual review needed)
if (x != null) {
  // Simpler but changes behavior slightly
}
```

### Refactoring Suggestions
**Risk: Medium**
- Extract methods
- Combine similar functions
- Replace callbacks with promises
- Convert class to functional
- Split large functions

### Architectural Improvements
**Risk: High**
- Dependency injection
- Pattern implementation
- Module restructuring
- API changes
- Breaking changes

### Complex Type Inference
**Risk: Medium**
- Generics optimization
- Union type simplification
- Intersection improvements
- Conditional types
- Template literal types

## Backup & Restore

### Automatic Backup
Before applying fixes, smart-reviewer:
1. Creates `.backup` directory
2. Copies original file with timestamp
3. Applies fixes to original
4. Keeps last 5 backups

### Restore Process
```bash
# If fixes cause issues
cp .backup/module.ts.2025-11-07-143022.bak src/module.ts

# Or use git
git checkout -- src/module.ts
```

## Fix Categories by Impact

### High Impact (Fix First)
**~40% issue reduction**
- Remove unused code
- Fix imports
- Correct formatting
- Remove console.logs
- Fix simple types

### Medium Impact (Fix Second)
**~30% issue reduction**
- Improve naming
- Simplify conditions
- Add basic types
- Fix documentation
- Organize structure

### Low Impact (Fix Last)
**~10% issue reduction**
- Style preferences
- Micro-optimizations
- Comment updates
- Whitespace
- Import order

## Verification After Auto-Fix

### Required Checks
```bash
# 1. Review changes
git diff src/module.ts

# 2. Run type checking
npm run typecheck

# 3. Run tests
npm test

# 4. Run linter
npm run lint

# 5. Check functionality
npm run dev  # Manual testing
```

### Expected Outcomes
```
Before auto-fix:
- Issues: 45
- Complexity: 67
- Warnings: 23

After safe auto-fix:
- Issues: 12 (-73%)
- Complexity: 67 (unchanged)
- Warnings: 3 (-87%)
```

## Common Patterns

### Pattern 1: Incremental Fixing
```bash
1. generate_auto_fixes → Review all
2. apply_auto_fixes(safeOnly=true) → Apply safe
3. git commit → Save progress
4. Manual fixes → One category at a time
5. Re-review → Verify improvements
```

### Pattern 2: Category-Specific
```javascript
// Fix only specific categories
{
  "safeOnly": true,
  "categories": ["imports", "formatting", "deadCode"]
}
```

### Pattern 3: Risk-Based Approach
1. **No risk:** Auto-apply immediately
2. **Low risk:** Apply with quick review
3. **Medium risk:** Careful review + testing
4. **High risk:** Manual implementation only

## Troubleshooting

### "Auto-fix broke my code"
**Solution:**
1. Check if `safeOnly: true` was used
2. Restore from automatic backup
3. Report issue if safe fix caused break
4. Use preview mode first next time

### "Not enough being fixed"
**Solution:**
1. Check if only using safe fixes
2. Review manual fixes for easy wins
3. Consider moderate risk fixes
4. Combine with other tools

### "Fixes conflict with prettier/eslint"
**Solution:**
1. Run prettier/eslint first
2. Then apply auto-fixes
3. Configure compatible rules
4. Use project's style guide