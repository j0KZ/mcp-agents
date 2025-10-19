# Claude Skills Documentation

**Comprehensive guide to understanding, creating, and deploying Claude Skills for the @j0kz/mcp-agents project.**

---

## Table of Contents

### [01. Overview](01-overview/)
- [What Are Skills?](01-overview/what-are-skills.md) - Core concepts, benefits, and use cases
- [Skills vs Tools](01-overview/skills-vs-tools.md) - Understanding the key distinctions
- [Architecture](01-overview/architecture.md) - Progressive disclosure and context management

### [02. Getting Started](02-getting-started/)
- [Quickstart Guide](02-getting-started/quickstart.md) - Create your first skill in 5 minutes
- [Installation](02-getting-started/installation.md) - Platform-specific setup instructions
- [First Skill Tutorial](02-getting-started/first-skill.md) - Step-by-step walkthrough

### [03. Skill Structure](03-skill-structure/)
- [Anatomy of a Skill](03-skill-structure/anatomy.md) - File organization and naming
- [YAML Frontmatter](03-skill-structure/yaml-frontmatter.md) - Metadata requirements
- [Markdown Body](03-skill-structure/markdown-body.md) - Instructions format and style
- [Resources](03-skill-structure/resources.md) - Scripts, references, and assets

### [04. Best Practices](04-best-practices/)
- [Progressive Disclosure](04-best-practices/progressive-disclosure.md) - 3-tier loading strategy
- [Context Efficiency](04-best-practices/context-efficiency.md) - <500 line rule and token economics
- [Writing Style](04-best-practices/writing-style.md) - Imperative form and terminology
- [Degrees of Freedom](04-best-practices/degrees-of-freedom.md) - When to be specific vs flexible

### [05. Patterns](05-patterns/)
- [Enterprise Skills](05-patterns/enterprise-skills.md) - Brand guidelines, policies, workflows
- [Creative Skills](05-patterns/creative-skills.md) - Generative art and design systems
- [Automation Skills](05-patterns/automation-skills.md) - Testing and workflow automation
- [Meta Skills](05-patterns/meta-skills.md) - Skills that create skills
- [Technical Skills](05-patterns/technical-skills.md) - Development, APIs, integrations

### [06. Development Workflow](06-development-workflow/)
- [Creation Process](06-development-workflow/creation-process.md) - Complete 6-step workflow
- [Research Phase](06-development-workflow/research-phase.md) - Gathering examples and requirements
- [Implementation Phase](06-development-workflow/implementation-phase.md) - Writing SKILL.md
- [Testing Phase](06-development-workflow/testing-phase.md) - Evaluation and iteration
- [Packaging Phase](06-development-workflow/packaging-phase.md) - Distribution and versioning

### [07. Advanced Topics](07-advanced-topics/)
- [Multi-Skill Composition](07-advanced-topics/multi-skill-composition.md) - Combining skills
- [Security Considerations](07-advanced-topics/security-considerations.md) - Trust and validation
- [Performance Optimization](07-advanced-topics/performance-optimization.md) - Context usage
- [API Integration](07-advanced-topics/api-integration.md) - Programmatic skill usage

### [08. Examples](08-examples/)
- [Minimal Example](08-examples/minimal-example.md) - Simplest valid skill
- [Medium Complexity](08-examples/medium-complexity.md) - Skill with references
- [Production Grade](08-examples/production-grade.md) - Full-featured analysis

### [09. Reference](09-reference/)
- [YAML Schema](09-reference/yaml-schema.md) - Complete frontmatter reference
- [File Conventions](09-reference/file-conventions.md) - Naming and organization
- [API Requirements](09-reference/api-requirements.md) - Beta headers and endpoints
- [Troubleshooting](09-reference/troubleshooting.md) - Common issues and solutions

### [10. MCP Integration](10-mcp-integration/)
- [Skills for MCP Tools](10-mcp-integration/skills-for-mcp-tools.md) - Creating skills for this project
- [Project-Specific Patterns](10-mcp-integration/project-specific-patterns.md) - Monorepo considerations
- [Automation Opportunities](10-mcp-integration/automation-opportunities.md) - MCP tool ideas

---

## 🚀 Skills Optimization (October 2025)

**16 reference files created, 5 skills optimized - 41% token reduction achieved**

### Performance Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Main Skills Total** | 3,325 lines | 1,958 lines | -41% (-1,367 lines) |
| **Context Usage** | 6.5% | 3.9% | -2.6 percentage points |
| **Token Savings** | - | ~5,468 tokens | Per skill load |
| **Reference Files** | 0 | 8,915 lines | On-demand access |

### Optimized Skills

| Skill | Before | After | Reduction | References |
|-------|--------|-------|-----------|------------|
| **git-pr-workflow** | 706 lines | 279 lines | -60% | 4 files (2,728 lines) |
| **testing-patterns-vitest** | 728 lines | 401 lines | -45% | 3 files (1,838 lines) |
| **documentation-generation** | 684 lines | 380 lines | -44% | 3 files (1,592 lines) |
| **mcp-troubleshooting** | 630 lines | 405 lines | -36% | 3 files (1,943 lines) |
| **release-publishing-workflow** | 577 lines | 493 lines | -14% | 3 files (1,414 lines) |

### Architecture Pattern

**Main Skills** (always loaded):
- Quick references and essential commands
- Common workflows (2-3 examples per topic)
- Links to detailed reference files
- Total: 1,958 lines

**Reference Files** (on-demand via grep/cat):
- Comprehensive guides and detailed examples
- Step-by-step tutorials
- Complete command references
- Total: 8,915 lines across 16 files

### Usage Example

```bash
# Quick reference - no file access needed
User: "How do I write a conventional commit?"
→ Main skill has format + 2-3 examples

# Detailed guide - load specific content
User: "Show me all conventional commit types"
→ grep -i "types" .claude/skills/git-pr-workflow/references/conventional-commits-guide.md
→ Returns ~30 lines (vs 422 full file)

# Specific section - targeted access
User: "How do I resolve merge conflicts?"
→ cat .claude/skills/git-pr-workflow/references/conflict-resolution-guide.md | grep -A 20 "Rebase"
→ Returns ~20 lines of relevant content
```

**[Complete Optimization Report →](../../logs/work-2025-10-19-skill-optimization-complete.md)**

---

## Quick Reference

### What Are Skills?

**Skills** are modular capability packages that extend Claude's functionality by bundling:
- **Instructions** - Procedural knowledge in markdown format
- **Metadata** - Name, description, and when to activate
- **Resources** (optional) - Scripts, templates, documentation

Unlike one-off prompts, skills are **reusable**, **composable**, and **context-efficient**.

### Minimal Skill Structure

```markdown
---
name: skill-identifier
description: What it does and when to use it (third person)
---

# Skill Name

[Imperative instructions here]
```

### Key Constraints

| Element | Constraint |
|---------|-----------|
| SKILL.md total length | <500 lines |
| `name` field | ≤64 characters |
| `description` field | ≤1024 characters |
| Metadata tokens | ~100 per skill |
| Instructions tokens | <5,000 when loaded |

### Progressive Disclosure (3-Tier System)

```
Level 1: Metadata (YAML)     → Always loaded (~100 tokens)
Level 2: Instructions         → Loaded when relevant (<5k tokens)
Level 3: Resources            → Filesystem access (0 tokens until used)
```

### Platform Availability

| Platform | Access Method |
|----------|--------------|
| **Claude Code** | `/plugin marketplace add anthropics/skills` |
| **Claude.ai** | Paid subscribers only |
| **API** | Requires beta headers (see [API Requirements](09-reference/api-requirements.md)) |

---

## Why Skills Matter

### For General Users
- Transform Claude into a domain expert for specialized tasks
- Reuse proven workflows across conversations
- Combine multiple skills for complex automation
- Reduce repetitive instruction writing

### For Developers
- Package procedural knowledge in maintainable formats
- Share expertise across teams and projects
- Integrate with existing tools and APIs
- Optimize context window usage

### For Organizations
- Standardize workflows and best practices
- Enforce brand guidelines and policies
- Create self-service automation for common tasks
- Build institutional knowledge bases

---

## Philosophy: Skills as "Onboarding Guides"

Skills are **not** custom agents. They're structured documentation that teaches Claude:

✅ **What to do** - Step-by-step procedures
✅ **When to do it** - Activation conditions
✅ **How to do it well** - Best practices and patterns
✅ **What tools to use** - Scripts, APIs, commands

Think of skills as the onboarding guide a new employee receives—comprehensive, actionable, and designed for repeated reference.

---

## Agent-Centric vs API-Centric Design

### ❌ Don't: API-Centric Approach
```markdown
# API Wrapper Skill
Use POST /api/users to create users
Use GET /api/users/{id} to fetch users
Use PUT /api/users/{id} to update users
```

### ✅ Do: Agent-Centric Approach
```markdown
# User Management Workflow
When managing users, consolidate operations:

1. Validate input data (email format, required fields)
2. Check for existing user to prevent duplicates
3. Create or update in single operation
4. Return human-readable summary with key details
```

**Key Principle:** Design around agent workflows, not API endpoints. Consolidate operations, prioritize high-signal information, use human-readable outputs.

---

## Next Steps

1. **New to Skills?** Start with [What Are Skills?](01-overview/what-are-skills.md)
2. **Ready to Build?** Jump to [Quickstart Guide](02-getting-started/quickstart.md)
3. **Need Inspiration?** Explore [Patterns](05-patterns/) and [Examples](08-examples/)
4. **Building for @j0kz/mcp-agents?** See [MCP Integration](10-mcp-integration/)

---

## Additional Resources

- **Official Repository:** [anthropics/skills](https://github.com/anthropics/skills)
- **Engineering Blog:** [Equipping Agents for the Real World](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- **Cookbooks:** [claude-cookbooks/skills](https://github.com/anthropics/claude-cookbooks/tree/main/skills)
- **Official Docs:** [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)

---

**Last Updated:** 2025-10-17
**Research Log:** [work-2025-10-17-claude-skills-research.md](../../logs/work-2025-10-17-claude-skills-research.md)
