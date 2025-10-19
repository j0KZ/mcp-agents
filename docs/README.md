# Documentation Index

Complete documentation for the MCP Tools monorepo. This project contains 8 Model Context Protocol (MCP) tools for AI-powered code analysis and generation.

## 📚 Table of Contents

### Getting Started

Essential guides for new users and setup instructions.

- **[Quick Start Guide](getting-started/QUICK_START.md)** - Get up and running in 5 minutes
- **[Editor Compatibility](getting-started/EDITOR_COMPATIBILITY.md)** - Claude Code, Cursor, Windsurf, and other MCP-compatible editors

### Development

Guides for contributors and maintainers.

- **[Contributing Guide](development/CONTRIBUTING.md)** - How to contribute to this project
- **[Publishing Guide](development/PUBLISH.md)** - Release and npm publishing workflow
- **[CI/CD Templates](development/CI_CD_TEMPLATES.md)** - GitHub Actions and GitLab CI templates for MCP validation
- **[Distribution Strategy](development/DISTRIBUTION.md)** - Package distribution and npm scope management

### Architecture

Technical design and planning documents.

- **[Project Roadmap](architecture/ROADMAP.md)** - Future plans and feature timeline
- **[Refactoring Plan](architecture/REFACTORING_PLAN.md)** - Code quality improvement strategy
- **[Modularity Implementation](architecture/MODULARITY_IMPLEMENTATION.md)** - Modular architecture patterns and Phase 1-3 refactoring

### Reports

#### Audits

Code quality and security audit reports.

- **[Project Audit (2025-10-03)](reports/audits/PROJECT_AUDIT_2025-10-03.md)** - Comprehensive project analysis
- **[Audit Summary](reports/audits/AUDIT_SUMMARY.md)** - Initial audit findings
- **[Audit Summary Phase 3](reports/audits/AUDIT_SUMMARY_PHASE3.md)** - Phase 3 specific findings
- **[Audit Report (2025-10-03)](reports/audits/AUDIT_REPORT_2025-10-03.md)** - Detailed audit results
- **[Manual Audit Report](reports/audits/MANUAL_AUDIT_REPORT.md)** - Manual review findings

#### Improvements

Implementation progress and improvement tracking.

- **[Phase 1 Complete](reports/improvements/IMPROVEMENT_PHASE1_COMPLETE.md)** - Phase 1 refactoring results
- **[Phase 3 & 4 Complete](reports/improvements/PHASE_3_4_COMPLETE.md)** - Phase 3-4 completion summary
- **[Final Summary](reports/improvements/FINAL_SUMMARY.md)** - Overall improvement results
- **[Auto-Fixer Implementation](reports/improvements/AUTO_FIXER_IMPLEMENTATION_REPORT.md)** - Automated code fixing system
- **[Fixes Applied Report](reports/improvements/FIXES_APPLIED_REPORT.md)** - Specific fixes and their impact
- **[Test Coverage Report](reports/improvements/TEST_COVERAGE_REPORT.md)** - Test coverage analysis

#### Releases

Version history and release notes.

- **[Release Notes](reports/releases/RELEASE_NOTES.md)** - Latest release information
- **[Release Notes v1.0.16](reports/releases/RELEASE_NOTES_v1.0.16.md)** - Specific v1.0.16 changes

### Governance

Project policies and security guidelines.

- **[Code of Conduct](governance/CODE_OF_CONDUCT.md)** - Community standards
- **[Security Policy](governance/SECURITY.md)** - Security vulnerability reporting and handling

### Examples

Practical usage examples and workflows.

- **[Workflow Examples](examples/WORKFLOW_EXAMPLES.md)** - Common MCP tool workflows
- **[Sample Commands](examples/sample-commands.sh)** - Shell script examples

### Templates

Reusable templates for documentation and configuration.

- **[Simple README Template](templates/SIMPLE_README_TEMPLATE.md)** - Template for package READMEs

## 📦 The 9 MCP Tools

1. **smart-reviewer** - Code review and quality analysis with auto-fix
2. **test-generator** - Automated test suite generation with smart assertions
3. **architecture-analyzer** - Dependency and architecture analysis
4. **refactor-assistant** - Code refactoring tools
5. **api-designer** - REST/GraphQL API design
6. **db-schema** - Database schema design
7. **doc-generator** - Documentation generation
8. **security-scanner** - Security vulnerability scanning
9. **orchestrator-mcp** - Multi-tool pipeline orchestration

## 🧠 Claude Code Skills (10 Production-Ready)

**Optimized for token efficiency** - 41% reduction in context usage:

1. **git-pr-workflow** - Git commits, PRs, conflict resolution ([279 lines](../claude/skills/git-pr-workflow/SKILL.md))
2. **testing-patterns-vitest** - Vitest testing conventions and patterns ([401 lines](../claude/skills/testing-patterns-vitest/SKILL.md))
3. **documentation-generation** - README, CHANGELOG, badge management ([380 lines](../claude/skills/documentation-generation/SKILL.md))
4. **mcp-troubleshooting** - MCP tool installation and debugging ([405 lines](../claude/skills/mcp-troubleshooting/SKILL.md))
5. **release-publishing-workflow** - npm publishing and version management ([493 lines](../claude/skills/release-publishing-workflow/SKILL.md))
6. **code-quality-pipeline** - Automated code review workflows
7. **modular-refactoring-pattern** - File refactoring patterns (<300 LOC)
8. **monorepo-package-workflow** - New package creation workflow
9. **mcp-workflow-composition** - Multi-tool workflow composition
10. **project-standardization** - Project standards and automation

**Architecture**:
- **Main skills**: 1,958 lines total (quick references, always loaded)
- **Reference files**: 8,915 lines total (detailed guides, on-demand via grep/cat)
- **Token savings**: ~5,468 tokens per skill load (3.9% vs 6.5% context usage)
- **Optimization**: 16 reference files created, 5 skills optimized (41% reduction)

**[View Complete Claude Skills Documentation →](claude_skills/)**

## 🔗 Quick Links

- **[Main README](../README.md)** - Project overview and installation
- **[CLAUDE.md](../CLAUDE.md)** - AI agent instructions and development patterns
- **[CHANGELOG](../CHANGELOG.md)** - Version history
- **[TODO List](TODO.md)** - Current and planned tasks

## 📊 Project Status

- **Current Version**: v1.0.36 (check [version.json](../version.json))
- **Phase 1-3 Refactoring**: ✅ Complete
- **Claude Skills Optimization**: ✅ Complete (41% token reduction)
- **Tests**: 588 passing (100% pass rate)
- **Coverage**: 75% target achieved
- **Security Vulnerabilities**: 0 (validated by Security Scanner MCP)

## 🆘 Need Help?

- Check the [Quick Start Guide](getting-started/QUICK_START.md) first
- Review [Editor Compatibility](getting-started/EDITOR_COMPATIBILITY.md) for setup issues
- See [Contributing Guide](development/CONTRIBUTING.md) for development questions
- Report bugs via GitHub Issues
