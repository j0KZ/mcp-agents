# Work Logs

This directory contains session logs that document significant work.
These files are **NOT committed to git** but are preserved locally for recovery.

## Purpose

- Document research and experimental work
- Provide recovery mechanism if files are accidentally deleted
- Track development decisions and progress
- Maintain history of implementation details

## Log Format

**Filename:** `work-{YYYY-MM-DD}-{description}.md`

**Required sections:**
- **Timestamp**: When work started
- **Purpose**: What we're building and why
- **Files created/modified**: Full list with paths
- **Key decisions**: Architecture choices, patterns used
- **Code snippets**: Core implementations (key logic, not full files)
- **Status**: In progress / Completed / Blocked

## When Logs Are Created

Logs are created for:
- ✅ Research and experimental code
- ✅ Proof-of-concept implementations
- ✅ Features spanning multiple files
- ✅ Work not immediately committed to git
- ✅ User-requested documentation

Logs are NOT created for:
- ❌ Simple bug fixes (1-2 line changes)
- ❌ Routine maintenance
- ❌ Documentation-only updates
- ❌ Running existing scripts

## Recovery Process

If files are accidentally deleted:
1. Check this `logs/` directory for recent work logs
2. Read the log to understand what was built
3. Use code snippets and descriptions to recreate
4. Logs provide: file list, purpose, key implementations, decisions

## Log Management

- **Retention**: Keep logs indefinitely (they're small, text-based)
- **Deletion**: Never delete without explicit user confirmation
- **Privacy**: Logs are local-only (excluded from git)
- **Ownership**: User controls logs (can delete/archive at will)
