# Experimental Features Overview

This document provides a high-level overview of experimental features in the my-claude-agents monorepo.

## What are Experimental Features?

Experimental features are **fully implemented, advanced functionality** that is not yet integrated into production. They represent research and development work that could significantly enhance the MCP ecosystem but require additional work before being production-ready.

## Why Separate from Main Code?

1. **Stability**: Main code is stable and works - experimental code needs validation
2. **Complexity**: Experimental features are highly complex (some files have 278 complexity!)
3. **Dependencies**: They require utilities that aren't yet exported
4. **Testing**: Need extensive real-world testing
5. **Performance**: Need optimization for production use

## Current Experimental Features

### 🎯 Orchestrator MCP - AI-Powered Orchestration

**Location:** `packages/orchestrator-mcp/experimental/`

**What it adds:** Instead of manually choosing workflows, describe what you want and let AI figure out the best tool combination.

**Files:**
- `intelligent-orchestrator.ts` (1,507 LOC) - AI-powered task analysis and tool selection
- `specialization-system.ts` (1,338 LOC) - Tool expertise and routing
- `conflict-resolver.ts` (1,050 LOC) - Resolves conflicts between tool outputs
- `consensus-engine.ts` (980 LOC) - Multi-tool consensus building

**Estimated Value:** High - Could make orchestration 10x more intuitive

**Integration Effort:** 2-3 weeks

**Read more:** [packages/orchestrator-mcp/experimental/README.md](packages/orchestrator-mcp/experimental/README.md)

---

### 🧪 Test Generator - Context-Aware Test Generation

**Location:** `packages/test-generator/experimental/`

**What it adds:** Instead of generic tests, generates tests that understand what your code does.

**Files:**
- `intelligent-generator.ts` (674 LOC) - Pattern recognition and smart test generation
- `intelligent-generator-v2.ts` - Enhanced version (TBD)

**Key Features:**
- Recognizes function purposes (validation, CRUD, async, etc.)
- Generates realistic test data (emails, URLs, dates)
- Provides confidence scores
- Explains test generation decisions

**Estimated Value:** High - Better test quality with less manual work

**Integration Effort:** 1-2 weeks

**Read more:** [packages/test-generator/experimental/README.md](packages/test-generator/experimental/README.md)

---

### 🧠 Shared - Advanced AI Utilities

**Location:** `packages/shared/experimental/`

**What it adds:** AI-powered code understanding, learning, and intelligence systems.

**Directories:**
- `communication/` - MessageBus for inter-MCP communication
- `metrics/` - PerformanceTracker for tool monitoring
- `intelligence/` (5 files, ~4,700 LOC) - Code understanding & reasoning
- `learning/` (4 files, ~3,000 LOC) - Self-improvement systems
- `transcendence/` (5 files, ~6,000 LOC) - Advanced AI capabilities

**Key Systems:**
- **SemanticAnalyzer**: Understands what code means, not just what it says
- **DomainKnowledgeBase**: Domain-specific rules (fintech, healthcare, etc.)
- **ExplanationEngine**: Explains AI decisions in human terms
- **LearningEngine**: Learns from past orchestrations to improve
- **SuperPatternRecognizer**: Finds patterns humans might miss

**Estimated Value:** Very High - Foundation for all AI features

**Integration Effort:** 6-12 months (phased rollout)

**Read more:** [packages/shared/experimental/README.md](packages/shared/experimental/README.md)

---

## Roadmap

### Short Term (Next 3 months)
- [ ] Refactor high-complexity files (reduce from 278 to <50)
- [ ] Extract constants and remove magic numbers
- [ ] Add comprehensive tests
- [ ] Performance profiling and optimization

### Medium Term (3-6 months)
- [ ] Integrate MessageBus and PerformanceTracker (low risk)
- [ ] Beta test IntelligentTestGenerator
- [ ] Export core intelligence utilities
- [ ] Create MVP of intelligent orchestration

### Long Term (6-12 months)
- [ ] Full intelligence system integration
- [ ] Learning and self-improvement features
- [ ] Natural language orchestration
- [ ] Advanced AI capabilities

---

## How to Explore

Each experimental directory has a detailed README with:
- Feature descriptions
- Architecture diagrams
- Code examples
- Integration requirements
- Performance considerations
- Security concerns

**Start here:**
1. [Orchestrator Experimental Features](packages/orchestrator-mcp/experimental/README.md)
2. [Test Generator Experimental Features](packages/test-generator/experimental/README.md)
3. [Shared AI Utilities](packages/shared/experimental/README.md)

---

## Contributing to Experimental Features

Interested in helping integrate these features? Here's how:

1. **Read the READMEs**: Understand what each feature does
2. **Run the code**: Test files work with current infrastructure
3. **Profile performance**: Identify bottlenecks
4. **Add tests**: Experimental code needs comprehensive testing
5. **Refactor complexity**: Reduce complexity scores
6. **Document**: Add user-facing documentation

**Contact:** Open a GitHub issue with the label `experimental-features`

---

## FAQ

**Q: Why not just delete this code?**
A: These are valuable R&D features that required significant effort. They're not broken - just not ready for production.

**Q: Can I use experimental features now?**
A: Technically yes (the code works), but they're not supported and may change significantly.

**Q: How much code is experimental?**
A: ~20,000 LOC across all packages (~15% of total codebase)

**Q: Will these ever be integrated?**
A: Yes! They're on the roadmap, but need work before being production-ready.

**Q: Are they in git?**
A: The README files are committed, but the actual code is gitignored (see `.gitignore`).

**Q: How do I access the code?**
A: It's in your local workspace in `packages/*/experimental/` directories.

---

**Last Updated:** 2025-10-07
**Status:** Documentation Complete
**Next Steps:** Begin refactoring phase for integration
