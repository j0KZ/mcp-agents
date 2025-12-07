# 🌍 Universal Developer Skills for Claude

**10 project-agnostic skills that work in ANY codebase, ANY language**

## ⚡ Quick Installation

Install these skills in any project:

```bash
# Option 1: Via npx (recommended)
npx @j0kz/claude-skills

# Option 2: Via curl
curl -sL https://raw.githubusercontent.com/j0KZ/mcp-agents/main/scripts/install-claude-skills.js | node

# Option 3: Manual download
git clone --depth 1 --filter=blob:none --sparse https://github.com/j0KZ/mcp-agents.git
cd mcp-agents && git sparse-checkout set .claude/universal-skills
```

## 📚 Skills Overview

| Skill                                               | Purpose              | Time     | Works Without MCP |
| --------------------------------------------------- | -------------------- | -------- | ----------------- |
| [quick-pr-review](quick-pr-review/SKILL.md)         | Pre-PR checklist     | 30 sec   | ✅ Yes            |
| [debug-detective](debug-detective/SKILL.md)         | Systematic debugging | 5 min    | ✅ Yes            |
| [performance-hunter](performance-hunter/SKILL.md)   | Find bottlenecks     | 10 min   | ✅ Yes            |
| [legacy-modernizer](legacy-modernizer/SKILL.md)     | Modernize old code   | Varies   | ✅ Yes            |
| [zero-to-hero](zero-to-hero/SKILL.md)               | Learn any codebase   | 30 min   | ✅ Yes            |
| [test-coverage-boost](test-coverage-boost/SKILL.md) | 0% → 80% coverage    | 1-5 days | ✅ Yes            |
| [tech-debt-tracker](tech-debt-tracker/SKILL.md)     | Quantify debt        | 1 hour   | ✅ Yes            |
| [dependency-doctor](dependency-doctor/SKILL.md)     | Fix packages         | 30 min   | ✅ Yes            |
| [security-first](security-first/SKILL.md)           | Security audit       | 1 hour   | ✅ Yes            |
| [api-integration](api-integration/SKILL.md)         | Connect APIs         | 2 hours  | ✅ Yes            |

## 🎯 How to Use Skills

### With Claude AI:

```
"Apply the debug-detective skill to find this bug"
"Use quick-pr-review before I create a PR"
"Follow zero-to-hero to understand this codebase"
```

### Manual Usage:

Each skill includes step-by-step instructions you can follow manually without any AI assistance.

## 🚀 Skill Selection Guide

### By Urgency:

- **🔴 Critical (Now)**: security-first, debug-detective
- **🟡 Important (Today)**: quick-pr-review, performance-hunter
- **🟢 Beneficial (This Week)**: test-coverage-boost, tech-debt-tracker

### By Project Phase:

- **Starting**: zero-to-hero, security-first
- **Developing**: quick-pr-review, debug-detective
- **Maintaining**: tech-debt-tracker, dependency-doctor
- **Scaling**: performance-hunter, api-integration
- **Refactoring**: legacy-modernizer, test-coverage-boost

### By Experience Level:

- **Junior**: zero-to-hero → debug-detective → test-coverage-boost
- **Mid**: quick-pr-review → performance-hunter → api-integration
- **Senior**: legacy-modernizer → tech-debt-tracker → security-first

## 💡 Key Features

Every skill includes:

- ✅ **Quick Start** (get value in 30 seconds)
- ✅ **WITH MCP** approach (automated with tools)
- ✅ **WITHOUT MCP** approach (manual commands)
- ✅ **Language examples** (JS, Python, Java, Go, Ruby)
- ✅ **Pro tips** and best practices
- ✅ **Success metrics** to track improvement

## 📊 Impact Metrics

Using these skills regularly leads to:

- 📉 **50% faster debugging** (debug-detective)
- 📈 **80% test coverage** (test-coverage-boost)
- ⚡ **40% performance gains** (performance-hunter)
- 🛡️ **Zero security vulnerabilities** (security-first)
- 🔄 **30% less technical debt** (tech-debt-tracker)

## 🔗 References

- **Full Index**: [INDEX.md](INDEX.md)
- **GitHub**: https://github.com/j0KZ/mcp-agents
- **Wiki**: https://github.com/j0KZ/mcp-agents/wiki
- **Issues**: https://github.com/j0KZ/mcp-agents/issues

## 📝 Notes

- These skills are **language-agnostic** and work in any programming language
- They are **framework-independent** and apply to any project type
- Each skill is **optimized for quick application** with clear steps
- All skills work **with or without MCP tools** installed

---

_Learn once, use everywhere - these skills transfer to any project, any team, any company._
