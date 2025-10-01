#!/bin/bash
# Sample Commands for My Claude Agents
# Copy and adapt these commands for your projects

# ==============================================================================
# SMART CODE REVIEWER COMMANDS
# ==============================================================================

# Review a single file
claude code "Review src/app.js with smart-reviewer"

# Review with strict severity
claude code "Review src/app.js with smart-reviewer severity=strict"

# Review and auto-fix
claude code "Review and fix src/app.js with smart-reviewer autoFix=true"

# Batch review
claude code "Review all files in src/api/ with smart-reviewer"

# Review only TypeScript files
claude code "Review all .ts files in the project with smart-reviewer"

# Review modified files (git)
claude code "Review all git-modified files with smart-reviewer"

# Pre-commit review
claude code "Review staged files before commit with smart-reviewer"

# ==============================================================================
# TEST GENERATOR COMMANDS
# ==============================================================================

# Generate tests for a single file
claude code "Generate tests for src/utils.js with test-generator"

# Generate with specific framework
claude code "Generate tests for src/app.ts framework=vitest"

# Generate and write to file
claude code "Generate and write tests for src/auth.js"

# Batch generate tests
claude code "Generate tests for all files in src/services/"

# Generate with high coverage target
claude code "Generate tests for src/api.js coverage=95"

# Generate without edge cases
claude code "Generate tests for src/simple.js includeEdgeCases=false"

# TDD workflow
claude code "Generate tests first for new feature in src/feature.js, then implement the feature"

# ==============================================================================
# ARCHITECTURE ANALYZER COMMANDS
# ==============================================================================

# Full architecture analysis
claude code "Analyze project architecture with architecture-analyzer"

# Find circular dependencies
claude code "Find circular dependencies in the project"

# Get module info
claude code "Get detailed info for src/services/api.js"

# Check layer violations
claude code "Analyze architecture and check for layer violations"

# Generate dependency graph
claude code "Generate Mermaid dependency graph for the project"

# Compare architecture (after refactoring)
claude code "Analyze architecture and compare metrics with previous analysis"

# ==============================================================================
# COMBINED WORKFLOWS
# ==============================================================================

# Full quality check
claude code "Review code with smart-reviewer, generate tests with test-generator, and analyze architecture"

# Pre-commit workflow
claude code "Review modified files, ensure tests exist, check for circular dependencies"

# New feature workflow
claude code "Generate tests for new feature, review implementation, verify architecture"

# Refactoring workflow
claude code "Analyze current architecture, review code quality, suggest improvements"

# ==============================================================================
# SPARC INTEGRATION
# ==============================================================================

# TDD with SPARC
npx claude-flow sparc tdd "New authentication feature"
# This automatically uses smart-reviewer and test-generator

# Full SPARC pipeline
npx claude-flow sparc pipeline "Complete user management system"

# ==============================================================================
# GIT INTEGRATION
# ==============================================================================

# Pre-commit hook (add to .git/hooks/pre-commit)
#!/bin/bash
FILES=$(git diff --cached --name-only --diff-filter=ACM)
for FILE in $FILES; do
  claude code "Review $FILE with smart-reviewer"
done

# Pre-push hook (add to .git/hooks/pre-push)
#!/bin/bash
claude code "Analyze architecture and fail if circular dependencies > 0"

# ==============================================================================
# CI/CD INTEGRATION
# ==============================================================================

# GitHub Actions
# - name: Quality Check
#   run: claude code "Review all source files with severity=strict"

# GitLab CI
# quality_check:
#   script:
#     - claude code "Full quality check on all modified files"

# ==============================================================================
# USEFUL ALIASES
# ==============================================================================

# Add to ~/.bashrc or ~/.zshrc

# Quick review
alias ccr='claude code "Review modified files with smart-reviewer"'

# Quick test gen
alias cct='claude code "Generate tests for modified files"'

# Quick architecture check
alias cca='claude code "Check architecture for issues"'

# Full quality check
alias ccq='claude code "Full quality check: review, tests, architecture"'

# ==============================================================================
# ADVANCED PATTERNS
# ==============================================================================

# Review with custom rules
claude code "Review src/app.js with custom rules from .reviewrc.json"

# Generate tests matching existing style
claude code "Generate tests for src/new.js matching style of existing tests"

# Architecture with layer rules
claude code "Analyze architecture with layer rules: presentation→business→data"

# Conditional review (only if score < 80)
claude code "Review src/app.js and flag if score below 80"

# ==============================================================================
# PROJECT-SPECIFIC EXAMPLES
# ==============================================================================

# For Express.js API
claude code "Review Express routes with smart-reviewer focusing on security"
claude code "Generate tests for Express middleware"
claude code "Analyze Express app architecture"

# For React App
claude code "Review React components for best practices"
claude code "Generate tests for React hooks"
claude code "Check React app architecture for circular dependencies"

# For Node.js Service
claude code "Review Node.js service for async/await patterns"
claude code "Generate tests for service layer"
claude code "Analyze service architecture and coupling"

# ==============================================================================
# REPORTING
# ==============================================================================

# Generate quality report
claude code "Generate comprehensive quality report combining all agents"

# Save report to file
claude code "Generate quality report and save to quality-report.md"

# Compare reports (after improvements)
claude code "Compare current quality report with baseline from last week"

# ==============================================================================
# MAINTENANCE TASKS
# ==============================================================================

# Weekly quality check
claude code "Perform weekly quality check: review recent changes, test coverage, architecture health"

# Find technical debt
claude code "Identify technical debt using all three agents"

# Prioritize refactoring
claude code "Analyze codebase and prioritize refactoring opportunities"

# ==============================================================================
# TEAM COLLABORATION
# ==============================================================================

# Onboarding new developer
claude code "Generate onboarding report: architecture overview, key modules, areas needing improvement"

# Code review assistance
claude code "Review PR #123 files with smart-reviewer and provide feedback"

# Standards enforcement
claude code "Check if all files meet team coding standards"

# ==============================================================================
# DEBUGGING AND TROUBLESHOOTING
# ==============================================================================

# Verify agent installation
node ~/my-claude-agents/scripts/verify-setup.js

# Test single agent
claude code "Test smart-reviewer agent with src/test.js"

# Debug MCP configuration
cat ~/.config/claude-code/mcp_config.json

# Rebuild agents
cd ~/my-claude-agents && npm run build && npm run install-global

# ==============================================================================
# END OF SAMPLE COMMANDS
# ==============================================================================
