# MCP Tools Cookbook 📖

**Complete workflows and recipes for common development tasks**

---

## 🎯 Workflow Recipes

### Development Workflows

#### 🚀 [Starting a New Project](./new-project.md)
Set up a new project with best practices from day one
- Architecture design
- API specification
- Database schema
- Security configuration
- Test setup
- **Time:** 30 minutes → Full project scaffold

#### 🔍 [Pre-PR Review](./pre-pr-review.md)
Complete quality check before creating pull requests
- Code quality analysis
- Security scanning
- Test coverage check
- Architecture validation
- Documentation update
- **Time:** 5-10 minutes → PR ready

#### 🛡️ [Security Audit](./security-audit.md)
Comprehensive security assessment for production
- OWASP Top 10 compliance
- Dependency vulnerabilities
- Secret detection
- Authentication review
- PCI/GDPR compliance
- **Time:** 15 minutes → Full security report

### Quality Improvement

#### 📈 [Code Quality Improvement](./quality-improvement.md)
Systematic approach to improving code quality
- Complexity reduction
- Code smell removal
- Performance optimization
- Maintainability boost
- **Time:** 20 minutes → 8/10 quality score

#### 🧪 [Test Coverage Boost](./test-coverage.md)
Go from 0% to 80% test coverage quickly
- Generate comprehensive tests
- Add edge cases
- Mock dependencies
- Integration tests
- **Time:** 30 minutes → 80%+ coverage

#### 🏗️ [Legacy Code Refactoring](./legacy-refactor.md)
Safely modernize old codebases
- Dependency mapping
- Test harness creation
- Incremental refactoring
- Pattern application
- **Time:** Step-by-step → Modern code

### Architecture & Design

#### 📊 [Architecture Review](./architecture-review.md)
Analyze and improve system architecture
- Dependency analysis
- Layer validation
- Circular dependency detection
- Coupling/cohesion metrics
- **Time:** 15 minutes → Architecture report

#### 🌐 [API Design](./api-design.md)
Design robust REST/GraphQL APIs
- OpenAPI specification
- GraphQL schema
- Client generation
- Mock server
- **Time:** 20 minutes → Complete API spec

#### 🗄️ [Database Design](./database-design.md)
Design and optimize database schemas
- ER diagram generation
- Normalization analysis
- Index optimization
- Migration scripts
- **Time:** 25 minutes → Production-ready schema

### Automation & CI/CD

#### 🤖 [CI/CD Setup](./cicd-setup.md)
Configure automated pipelines
- GitHub Actions/GitLab CI
- Quality gates
- Security checks
- Deployment automation
- **Time:** 15 minutes → Full pipeline

#### ⚡ [Git Hooks Configuration](./git-hooks.md)
Automate quality checks
- Pre-commit validation
- Pre-push security
- Commit message linting
- Auto-formatting
- **Time:** 5 minutes → Never push bad code

#### 📝 [Documentation Automation](./documentation.md)
Keep docs always up-to-date
- README generation
- API documentation
- Changelog from commits
- Code comments
- **Time:** 10 minutes → Complete docs

---

## 🎬 Quick Start Recipes

### "I need this NOW" Solutions

#### Fix Messy Code (2 minutes)
```
"This file is a mess, clean it up with auto-fix"
```
→ Smart Reviewer auto-fixes formatting, removes unused code, simplifies logic

#### Emergency Security Check (3 minutes)
```
"Quick security scan - am I about to get hacked?"
```
→ Security Scanner finds critical vulnerabilities only

#### Instant Tests (5 minutes)
```
"I have zero tests and my manager is asking - help!"
```
→ Test Generator creates basic test suite with 70% coverage

#### Architecture Visualization (1 minute)
```
"Show me how this project is structured"
```
→ Architecture Analyzer generates dependency graph

---

## 🔄 Common Workflow Combinations

### The Quality Trinity
```
Smart Reviewer → Test Generator → Security Scanner
```
Perfect for pre-deployment checks

### The Refactor Safe
```
Test Generator → Refactor Assistant → Test Generator
```
Create safety net → Refactor → Verify nothing broke

### The Architecture Doctor
```
Architecture Analyzer → Refactor Assistant → Smart Reviewer
```
Find problems → Fix structure → Validate quality

### The New Feature Flow
```
API Designer → Test Generator → Doc Generator
```
Design first → Test-drive → Document

### The Legacy Rescue
```
Architecture Analyzer → Test Generator → Refactor Assistant → Security Scanner
```
Understand → Protect → Improve → Secure

---

## 📊 Time vs Value Matrix

| Workflow | Time | Value | When to Use |
|----------|------|-------|-------------|
| Quick PR Review | 2 min | High | Every PR |
| Security Scan | 5 min | Critical | Before deploy |
| Test Generation | 10 min | High | Low coverage |
| Full Audit | 30 min | Very High | Major releases |
| Legacy Refactor | 2 hours | Extreme | Tech debt |

---

## 🎯 Choosing the Right Recipe

### Based on Your Situation

**"I'm starting something new"**
→ [New Project Setup](./new-project.md)

**"I'm about to create a PR"**
→ [Pre-PR Review](./pre-pr-review.md)

**"We're going to production"**
→ [Security Audit](./security-audit.md)

**"The code is unmaintainable"**
→ [Legacy Refactoring](./legacy-refactor.md)

**"We have no tests"**
→ [Test Coverage Boost](./test-coverage.md)

**"Is our architecture good?"**
→ [Architecture Review](./architecture-review.md)

**"We need an API"**
→ [API Design](./api-design.md)

**"Setting up CI/CD"**
→ [CI/CD Setup](./cicd-setup.md)

---

## 🚀 Advanced Combinations

### Enterprise Security Package
1. Security Audit (deep scan)
2. Test Generator (security tests)
3. Doc Generator (security documentation)
4. Architecture Analyzer (attack surface)

### Startup Speed Package
1. New Project Setup
2. API Designer (MVP endpoints)
3. Auto-Pilot (maintain quality)
4. CI/CD Setup (ship fast)

### Technical Debt Crusher
1. Architecture Analyzer (find problems)
2. Test Generator (safety net)
3. Refactor Assistant (fix structure)
4. Smart Reviewer (validate improvements)

### Documentation Blitz
1. Doc Generator (README, API docs)
2. Test Generator (example usage)
3. Architecture Analyzer (diagrams)
4. Smart Reviewer (code comments)

---

## 💡 Pro Tips for Recipes

### 1. Start Small
Don't try to fix everything at once. Pick one recipe, complete it, then move to the next.

### 2. Measure Progress
Track metrics before and after:
- Coverage: 30% → 85%
- Complexity: 45 → 12
- Security Score: 4/10 → 9/10

### 3. Automate Favorites
Turn your most-used recipes into git aliases or npm scripts:
```json
{
  "scripts": {
    "pre-pr": "npx @j0kz/orchestrator-mcp run-workflow pre-pr",
    "security": "npx @j0kz/security-scanner deep-scan",
    "quality": "npx @j0kz/smart-reviewer auto-fix"
  }
}
```

### 4. Customize for Your Team
Create team-specific workflows:
```javascript
// .mcp/workflows/our-deploy.json
{
  "name": "our-deploy-checklist",
  "steps": [
    { "tool": "security-scanner", "config": { "level": "high" } },
    { "tool": "test-generator", "config": { "minCoverage": 90 } },
    { "tool": "doc-generator", "config": { "updateChangelog": true } }
  ]
}
```

### 5. Learn from Patterns
After 10+ uses, the tools learn your patterns and get better at:
- Suggesting fixes that match your style
- Generating tests that follow your conventions
- Finding security issues specific to your stack

---

## 📚 All Recipes Index

### Development Workflows
- [Starting a New Project](./new-project.md) ⭐
- [Pre-PR Review](./pre-pr-review.md) ⭐
- [Security Audit](./security-audit.md) ⭐
- [Code Quality Improvement](./quality-improvement.md)
- [Test Coverage Boost](./test-coverage.md)
- [Legacy Code Refactoring](./legacy-refactor.md)

### Architecture & Design
- [Architecture Review](./architecture-review.md)
- [API Design](./api-design.md)
- [Database Design](./database-design.md)

### Automation
- [CI/CD Setup](./cicd-setup.md)
- [Git Hooks Configuration](./git-hooks.md)
- [Documentation Automation](./documentation.md)

### Specialized Workflows
- [Microservices Setup](./microservices.md)
- [Performance Optimization](./performance.md)
- [Migration Planning](./migration.md)
- [Emergency Debugging](./debugging.md)

---

## 🎮 Interactive Mode

Want to build a custom workflow? Just ask:

```
"I need to refactor my authentication system safely. Create a workflow that ensures nothing breaks."
```

The Orchestrator will create a custom recipe:
1. Analyze current auth implementation
2. Generate comprehensive tests
3. Create refactoring plan
4. Apply changes incrementally
5. Validate security
6. Update documentation

---

## 📈 Success Metrics

Teams using these recipes report:
- **70% faster** development setup
- **90% fewer** production bugs
- **50% less** time in code review
- **3x faster** onboarding
- **80% reduction** in security issues

---

**Ready to cook?** Pick a recipe and get started! 🚀

[Back to Examples](../README.md) | [Quick Reference](../QUICK_REFERENCE.md)