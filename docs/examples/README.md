# MCP Tools Examples Library 📚

**Your Complete Guide to What Each MCP Tool Can Actually Do**

> Stop wondering, start seeing. Real examples, real code, real results.

---

## 🎯 Quick Navigation

### By Tool

1. [Smart Reviewer Examples](./tools/smart-reviewer.md) - Code quality analysis & auto-fixes
2. [Test Generator Examples](./tools/test-generator.md) - Automatic test creation
3. [Architecture Analyzer Examples](./tools/architecture-analyzer.md) - Dependency & structure analysis
4. [Security Scanner Examples](./tools/security-scanner.md) - Vulnerability detection
5. [Refactor Assistant Examples](./tools/refactor-assistant.md) - Code transformation
6. [API Designer Examples](./tools/api-designer.md) - REST/GraphQL design
7. [DB Schema Examples](./tools/db-schema.md) - Database design & migrations
8. [Doc Generator Examples](./tools/doc-generator.md) - Documentation automation
9. [Orchestrator Examples](./tools/orchestrator.md) - Multi-tool workflows
10. [Auto-Pilot Examples](./tools/auto-pilot.md) - Zero-config automation

### By Use Case

- [🚀 Starting a New Project](./cookbook/new-project.md)
- [🔍 Code Review Before PR](./cookbook/pre-pr-review.md)
- [🛡️ Security Audit](./cookbook/security-audit.md)
- [📈 Improving Code Quality](./cookbook/quality-improvement.md)
- [🧪 Adding Test Coverage](./cookbook/test-coverage.md)
- [🏗️ Refactoring Legacy Code](./cookbook/legacy-refactor.md)
- [📊 Architecture Analysis](./cookbook/architecture-review.md)
- [🤖 CI/CD Integration](./cookbook/cicd-integration.md)

---

## 🎬 What You'll Find in Each Example

Every example includes:

### 1. **The Prompt** - What you type in Claude/Cursor

```
"Review my authentication module for security issues"
```

### 2. **What Happens** - Behind the scenes action

- Tool analyzes your code
- Specific patterns detected
- Decisions made by AI

### 3. **The Output** - What you get back

- Detailed findings
- Suggested fixes
- Generated code

### 4. **Before/After** - See the transformation

```javascript
// BEFORE: Complex, buggy code
// AFTER: Clean, tested, secure code
```

### 5. **Try It Yourself** - Copy-paste ready

- Exact commands to run
- Sample files to test with
- Expected results

---

## 🚀 Quick Start Examples

### Example 1: "My code is messy, help!"

**You type:**

```
"Review and auto-fix my index.js file"
```

**Smart Reviewer responds with:**

- 12 code smells detected
- 8 auto-fixed immediately
- 4 require manual review
- Complexity reduced from 45 to 12

[See full example →](./tools/smart-reviewer.md#auto-fix-messy-code)

### Example 2: "I need tests but I'm lazy"

**You type:**

```
"Generate comprehensive tests for my UserService class"
```

**Test Generator creates:**

- 15 test cases
- 5 edge cases
- 3 error scenarios
- Mock implementations
- 95% coverage achieved

[See full example →](./tools/test-generator.md#lazy-developer-special)

### Example 3: "Is my app secure?"

**You type:**

```
"Scan my entire project for vulnerabilities"
```

**Security Scanner finds:**

- 2 SQL injection risks
- 1 hardcoded API key
- 3 missing input validations
- 5 dependency vulnerabilities
- Fixes provided for each

[See full example →](./tools/security-scanner.md#full-project-scan)

---

## 📖 The Cookbook - Complete Workflows

### 🎯 Pre-Commit Quality Check

**Goal:** Never push bad code again

```bash
# What you type in Claude:
"Run a pre-commit quality check on my staged files"

# What happens:
1. Smart Reviewer → Check code quality
2. Test Generator → Ensure test coverage
3. Security Scanner → Detect vulnerabilities
4. Doc Generator → Update documentation
5. All clear? → Commit proceeds
```

[Full recipe →](./cookbook/pre-pr-review.md)

### 🏗️ Legacy Code Modernization

**Goal:** Transform that 5-year-old spaghetti code

```bash
# What you type:
"Help me modernize this legacy module step by step"

# What happens:
1. Architecture Analyzer → Map dependencies
2. Test Generator → Create safety net
3. Refactor Assistant → Apply patterns
4. Smart Reviewer → Validate changes
5. Doc Generator → Document new structure
```

[Full recipe →](./cookbook/legacy-refactor.md)

---

## 💡 Pro Tips

### Combine Tools for Power

```
"Review my code, generate tests, and check security - all at once"
```

The Orchestrator handles everything in parallel!

### Use Natural Language

```
"This function is too complex, make it simpler"
"I'm worried about SQL injection, check my queries"
"Generate tests but focus on edge cases"
```

### Iterate Quickly

```
You: "Review my code"
AI: [provides feedback]
You: "Now auto-fix the critical issues"
AI: [applies fixes]
You: "Generate tests for the changes"
AI: [creates tests]
```

---

## 🎮 Interactive Examples

Want to try without installing? Check our playground:

1. **[Online Demo](https://mcp-tools-demo.example.com)** - Paste code, see results
2. **[Video Tutorials](./videos/README.md)** - Watch tools in action
3. **[Sample Projects](./sample-projects/)** - Full repos to experiment with

---

## 📊 Real Results from Real Developers

> "Smart Reviewer found 47 issues I never knew existed. Fixed them all in 10 minutes." - @developer1

> "Test Generator created better tests than I write manually. Saved me 3 hours." - @developer2

> "Security Scanner prevented a potential data breach. Worth its weight in gold." - @developer3

---

## 🚦 Getting Started

1. **Install the tools:**

   ```bash
   npx @j0kz/mcp-agents@latest
   ```

2. **Pick an example** from this library

3. **Copy the prompt** and try it in Claude/Cursor

4. **See the magic happen** ✨

---

## 📚 Complete Examples Index

### Smart Reviewer

- [Auto-fix messy code](./tools/smart-reviewer.md#auto-fix-messy-code)
- [Reduce complexity](./tools/smart-reviewer.md#reduce-complexity)
- [Find code smells](./tools/smart-reviewer.md#find-code-smells)
- [Apply Pareto fixes](./tools/smart-reviewer.md#pareto-fixes)
- [Pre-commit review](./tools/smart-reviewer.md#pre-commit-review)

### Test Generator

- [Generate from scratch](./tools/test-generator.md#generate-from-scratch)
- [Add edge cases](./tools/test-generator.md#edge-cases)
- [Mock dependencies](./tools/test-generator.md#mock-dependencies)
- [Achieve 95% coverage](./tools/test-generator.md#high-coverage)
- [Test async functions](./tools/test-generator.md#async-testing)

### Architecture Analyzer

- [Find circular dependencies](./tools/architecture-analyzer.md#circular-deps)
- [Generate dependency graphs](./tools/architecture-analyzer.md#dep-graphs)
- [Check layer violations](./tools/architecture-analyzer.md#layer-violations)
- [Analyze coupling](./tools/architecture-analyzer.md#coupling-analysis)
- [Architecture suggestions](./tools/architecture-analyzer.md#suggestions)

[Continue for all tools...]

---

## 🤝 Contributing Examples

Found a cool use case? Share it!

1. Fork this repo
2. Add your example to the relevant tool file
3. Include before/after code
4. Submit a PR

---

## 📞 Need Help?

- 💬 [Discord Community](https://discord.gg/mcp-tools)
- 📧 [Email Support](mailto:support@j0kz.dev)
- 🐛 [Report Issues](https://github.com/j0KZ/my-claude-agents/issues)

---

**Ready to see what MCP tools can really do? Dive into the examples!** 🚀
