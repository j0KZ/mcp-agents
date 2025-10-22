# Automation Opportunities: Skill Generation MCP Tool

**Vision and design for an MCP tool that generates Claude Skills based on project analysis and usage patterns.**

---

## Vision: Automated Skill Creation

### The Problem

Creating skills manually requires:

1. Understanding skill structure and best practices
2. Writing effective YAML frontmatter
3. Crafting imperative instructions
4. Organizing resources (scripts, references, assets)
5. Testing and iterating
6. Maintaining consistency across skills

**Time investment:** 1-4 hours per skill

**Barrier:** Teams want skills but lack time/expertise to create them

### The Solution: `@j0kz/skill-generator` MCP Tool

**Automated skill generation** from:

- Existing code patterns
- Project conventions
- Tool usage history
- Team workflows
- Documentation

**Result:** Generate production-ready skills in minutes, not hours.

---

## Tool Design: `@j0kz/skill-generator`

### Core Tools

#### 1. `generate_skill_from_code`

**Purpose:** Analyze code patterns and generate skill that teaches Claude to follow those patterns.

**Input:**

```json
{
  "sourceFiles": ["src/utils/*.ts"],
  "skillName": "utility-functions-pattern",
  "focus": "coding-style"
}
```

**Process:**

1. Parse source files
2. Extract common patterns:
   - Function structure (pure functions, error handling)
   - Naming conventions (camelCase, descriptive names)
   - Type usage (explicit return types, generics)
   - Documentation style (JSDoc format)
3. Identify "exemplar" code (best examples)
4. Generate SKILL.md teaching these patterns

**Output:**

````markdown
---
name: utility-functions-pattern
description: Guides creation of utility functions following project conventions including pure functions, explicit typing, and JSDoc documentation. Use when creating new utility functions or refactoring existing ones.
---

# Utility Functions Pattern

Create utility functions following project conventions.

## Function Structure

All utility functions should be:

- **Pure**: No side effects, same input → same output
- **Typed**: Explicit parameter and return types
- **Documented**: JSDoc with examples
- **Tested**: Unit tests with edge cases

## Pattern Template

````typescript
/**
 * [Brief description of what function does]
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * functionName(exampleInput)
 * // => expected output
 * ```
 */
export function functionName<T>(paramName: T): ReturnType {
  // Validate input
  if (!paramName) {
    throw new Error('paramName is required');
  }

  // Core logic
  const result = /* ... */;

  return result;
}
````
````

## Examples from Codebase

[Auto-extracted from best examples in sourceFiles]

## Testing Pattern

[Auto-generated from existing test files]
...

````

#### 2. `generate_skill_from_workflow`

**Purpose:** Observe Claude's repeated workflows and codify them into reusable skills.

**Input:**
```json
{
  "workflowDescription": "Creating new MCP tool in monorepo",
  "referenceTasks": [
    "Added @j0kz/smart-reviewer",
    "Added @j0kz/test-generator"
  ]
}
````

**Process:**

1. Analyze referenced tasks (git commits, file changes)
2. Extract common steps:
   - Create package directory
   - Copy template files
   - Update package.json
   - Create tool schema
   - Implement handlers
   - Add tests
   - Update root config
3. Identify decision points
4. Generate procedural skill

**Output:**

````markdown
---
name: create-mcp-tool
description: Guides creation of new MCP tool in @j0kz/mcp-agents monorepo following established patterns. Use when adding new MCP tool package to the project.
---

# Create MCP Tool

Add new MCP tool to monorepo following project conventions.

## Prerequisites

- [ ] Tool purpose clearly defined
- [ ] Tool name follows @j0kz/package-name pattern
- [ ] No duplicate functionality exists

## Step 1: Create Package Structure

```bash
# Create directory
mkdir -p packages/[tool-name]
cd packages/[tool-name]

# Initialize package.json
npm init -y

# Update package.json name
sed -i 's/"name": ".*"/"name": "@j0kz\/[tool-name]"/' package.json
```
````

## Step 2: Copy Template Files

[Auto-generated from analyzing existing packages]

...

## Validation Checklist

[Auto-generated from project conventions]

````

#### 3. `generate_skill_from_docs`

**Purpose:** Convert existing documentation into Claude-consumable skills.

**Input:**
```json
{
  "documentationPath": "docs/api-guidelines.md",
  "skillName": "api-design-patterns",
  "extractExamples": true
}
````

**Process:**

1. Parse documentation (markdown, PDFs, wikis)
2. Extract:
   - Guidelines and rules
   - Code examples
   - Best practices
   - Anti-patterns
3. Convert to imperative instructions
4. Organize into progressive disclosure structure

**Output:** Skill with docs as references, examples as assets.

#### 4. `enhance_skill`

**Purpose:** Improve existing skills based on usage feedback.

**Input:**

```json
{
  "skillName": "git-commit-helper",
  "feedback": "Often generates subjects over 50 chars",
  "usagePatterns": ["commit-history.json"]
}
```

**Process:**

1. Load existing skill
2. Analyze feedback and usage
3. Identify improvement opportunities:
   - Add missing validation
   - Clarify ambiguous instructions
   - Add examples for common cases
4. Suggest or apply enhancements

**Output:** Updated SKILL.md with improvements.

#### 5. `validate_skill`

**Purpose:** Check skill quality before deployment.

**Input:**

```json
{
  "skillPath": "skills/my-skill"
}
```

**Process:**

1. Validate structure (YAML, markdown formatting)
2. Check constraints:
   - Name ≤64 chars
   - Description ≤1024 chars
   - SKILL.md <500 lines
3. Analyze quality:
   - Description specificity (what + when)
   - Instruction clarity (imperative form)
   - Example quality
4. Suggest improvements

**Output:**

```json
{
  "valid": true,
  "warnings": [
    "Description doesn't specify when to use skill",
    "SKILL.md is 456 lines (consider splitting references)"
  ],
  "suggestions": [
    "Add 'Use when...' clause to description",
    "Move detailed API docs to references/API.md"
  ],
  "metrics": {
    "nameLength": 24,
    "descriptionLength": 512,
    "skillLineCount": 456,
    "estimatedTokens": 3200
  }
}
```

---

## Implementation Architecture

### Package Structure

```
packages/skill-generator/
├── src/
│   ├── index.ts                 # MCP server entry
│   ├── tools/
│   │   ├── generate-from-code.ts
│   │   ├── generate-from-workflow.ts
│   │   ├── generate-from-docs.ts
│   │   ├── enhance-skill.ts
│   │   └── validate-skill.ts
│   ├── analyzers/
│   │   ├── code-pattern-analyzer.ts
│   │   ├── workflow-analyzer.ts
│   │   └── doc-parser.ts
│   ├── generators/
│   │   ├── yaml-generator.ts
│   │   ├── instruction-generator.ts
│   │   └── example-generator.ts
│   ├── validators/
│   │   ├── structure-validator.ts
│   │   ├── quality-analyzer.ts
│   │   └── token-estimator.ts
│   └── templates/
│       ├── skill-template.md
│       ├── script-templates/
│       └── reference-templates/
├── tests/
├── package.json
└── README.md
```

### Core Utilities

**Leverage `@j0kz/shared`:**

```typescript
import { FileSystemManager, AnalysisCache, PerformanceMonitor } from '@j0kz/shared';

// Parse source files
const files = await FileSystemManager.readDirectory('src/');

// Cache pattern analysis
const patterns = await AnalysisCache.get('code-patterns', () => analyzeCodePatterns(files));

// Monitor performance
const metrics = PerformanceMonitor.track('skill-generation');
```

### Integration with Existing Tools

**Combine with other MCP tools:**

```typescript
// Generate skill for test patterns
async function generateTestingSkill() {
  // 1. Use test-generator to analyze test patterns
  const testPatterns = await testGenerator.analyzePatterns({
    sourceFiles: ['**/*.test.ts'],
  });

  // 2. Use smart-reviewer to identify quality test examples
  const qualityTests = await smartReviewer.batchReview({
    filePaths: testPatterns.exemplarTests,
    config: { severity: 'strict' },
  });

  // 3. Generate skill from best examples
  const skill = await generateSkill({
    patterns: testPatterns,
    exemplars: qualityTests.highQualityFiles,
    type: 'testing-patterns',
  });

  return skill;
}
```

---

## Use Cases

### 1. Onboarding New Team Members

**Scenario:** New developer joins team, needs to learn coding patterns.

**Solution:**

```bash
# Generate skill from project's best code
mcp-skill-generator generate-from-code \
  --source "src/core/*.ts" \
  --name "core-module-patterns" \
  --focus "architecture,naming,testing"

# New developer loads skill
# Claude now guides them to follow team conventions
```

### 2. Standardizing Workflows

**Scenario:** Team has ad-hoc deployment process, wants consistency.

**Solution:**

```bash
# Analyze successful deployments
mcp-skill-generator generate-from-workflow \
  --workflow "Deploying to production" \
  --reference-tasks "deploy-2024-10-15,deploy-2024-10-16" \
  --name "production-deployment"

# Skill codifies the proven process
# All deployments now follow same steps
```

### 3. Migrating Documentation to Skills

**Scenario:** Have 50-page API guidelines doc, want Claude to apply them.

**Solution:**

```bash
# Convert docs to skill
mcp-skill-generator generate-from-docs \
  --docs "docs/api-guidelines.md" \
  --name "api-design-standards" \
  --extract-examples

# Skill packages guidelines in progressive disclosure format
# Claude applies standards automatically
```

### 4. Continuous Improvement

**Scenario:** Skill works but could be better based on usage.

**Solution:**

```bash
# Enhance based on feedback
mcp-skill-generator enhance-skill \
  --skill "git-commit-helper" \
  --feedback "Often too verbose" \
  --usage-data "commit-logs.json"

# Skill updated with improved guidance
# Quality improves over time
```

---

## Technical Considerations

### Code Pattern Analysis

**Approaches:**

1. **AST Parsing:**

   ```typescript
   import * as ts from 'typescript';

   function analyzeTypeScriptPatterns(file: string) {
     const sourceFile = ts.createSourceFile(
       file,
       readFileSync(file, 'utf8'),
       ts.ScriptTarget.Latest
     );

     // Extract patterns
     const patterns = {
       namingConventions: extractNaming(sourceFile),
       functionStructure: extractFunctions(sourceFile),
       typeUsage: extractTypes(sourceFile),
       imports: extractImports(sourceFile),
     };

     return patterns;
   }
   ```

2. **Statistical Analysis:**

   ```typescript
   // Find most common patterns
   function findCommonPatterns(files: string[]) {
     const allPatterns = files.flatMap(analyzeFile);

     const frequencies = countOccurrences(allPatterns);

     // Return top patterns (used in >70% of files)
     return filterByFrequency(frequencies, 0.7);
   }
   ```

3. **Exemplar Selection:**

   ```typescript
   // Find best examples (highest quality, most typical)
   async function selectExemplars(files: string[]) {
     // Use smart-reviewer to score quality
     const scores = await smartReviewer.batchReview({ filePaths: files });

     // Find files with no critical issues
     const highQuality = scores.filter(s => s.critical === 0);

     // Among high quality, find most representative
     const exemplars = findMostTypical(highQuality);

     return exemplars;
   }
   ```

### Workflow Analysis

**Data sources:**

1. **Git history:**

   ```bash
   git log --all --pretty=format:"%H|%an|%ad|%s" --name-only
   ```

2. **File system changes:**

   ```typescript
   // Compare task A and task B file changes
   const taskAFiles = getFilesInCommit(taskA);
   const taskBFiles = getFilesInCommit(taskB);

   const commonSteps = findCommonChanges(taskAFiles, taskBFiles);
   ```

3. **Command history (if available):**

   ```bash
   # Bash history
   ~/.bash_history

   # VSCode command history
   ~/.vscode/argv.json
   ```

### Quality Metrics

**Skill quality scoring:**

```typescript
interface SkillQuality {
  structureScore: number; // YAML valid, markdown formatted
  descriptionScore: number; // Specific, includes "when to use"
  instructionScore: number; // Imperative, clear, actionable
  exampleScore: number; // Relevant, well-formatted
  tokenEfficiency: number; // <5k tokens for instructions
  overall: number; // Weighted average
}

function scoreSkill(skill: Skill): SkillQuality {
  return {
    structureScore: validateStructure(skill),
    descriptionScore: scoreDescription(skill.description),
    instructionScore: scoreInstructions(skill.body),
    exampleScore: scoreExamples(skill.examples),
    tokenEfficiency: estimateTokens(skill) / 5000,
    overall: calculateWeightedScore(/* ... */),
  };
}
```

---

## Development Roadmap

### Phase 1: Foundation (v0.1.0)

- [ ] Basic skill template generation
- [ ] YAML frontmatter validation
- [ ] Structure validation tool
- [ ] Simple code pattern extraction

### Phase 2: Intelligence (v0.2.0)

- [ ] AST-based pattern analysis
- [ ] Workflow analysis from git history
- [ ] Documentation parsing (markdown, PDF)
- [ ] Exemplar selection

### Phase 3: Enhancement (v0.3.0)

- [ ] Skill quality scoring
- [ ] Usage-based improvement suggestions
- [ ] Auto-enhancement based on feedback
- [ ] Integration with smart-reviewer for exemplar selection

### Phase 4: Automation (v0.4.0)

- [ ] Auto-generate skills on PR merge
- [ ] Continuous skill improvement pipeline
- [ ] Team collaboration features
- [ ] Skill marketplace integration

---

## Integration with @j0kz/mcp-agents

### Fits Monorepo Pattern

```
packages/
├── skill-generator/          # New package
│   ├── src/
│   │   ├── index.ts         # MCP server
│   │   └── tools/           # Skill generation tools
│   ├── tests/
│   └── package.json
├── shared/                   # Reuse existing utilities
└── smart-reviewer/           # Integration for quality analysis
```

### Reuses Existing Infrastructure

- `FileSystemManager` from `@j0kz/shared`
- `AnalysisCache` for caching patterns
- `PerformanceMonitor` for tracking
- `smart-reviewer` for code quality scoring
- `test-generator` for test pattern analysis

### Follows Project Conventions

- TypeScript with strict mode
- Vitest for testing
- Zod for schema validation
- FastMCP for server implementation
- Shared version.json management

---

## Next Steps

1. **Validate concept:** Create manual skill for one use case
2. **Prototype tool:** Build basic `generate_skill_from_code`
3. **Iterate:** Test with real project patterns
4. **Expand:** Add workflow and docs generation
5. **Automate:** Integrate into CI/CD pipeline

---

**Related Documentation:**

- [Skills for MCP Tools](skills-for-mcp-tools.md)
- [Development Workflow](../06-development-workflow/creation-process.md)
- [Architecture](../01-overview/architecture.md)
