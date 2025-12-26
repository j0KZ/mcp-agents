---
name: mcp-builder
description: Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services. Use when building MCP servers to integrate APIs, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).
---

# MCP Server Development Guide

This skill provides comprehensive guidance for building MCP servers that enable LLMs to effectively interact with external services through well-designed tools.

## When to Use This Skill

- Building a new MCP server to integrate an external API
- Designing tools for an existing MCP server
- Reviewing MCP server implementation quality
- Creating evaluations to test MCP server effectiveness
- Learning MCP best practices

## What This Skill Does

1. **Guides Implementation**: Step-by-step process for building MCP servers
2. **Provides Best Practices**: Naming conventions, response formats, pagination
3. **Offers Language-Specific Guidance**: Python (FastMCP) and TypeScript (MCP SDK)
4. **Includes Quality Checklists**: Verify implementation completeness
5. **Supports Evaluation Creation**: Test MCP servers with realistic questions

## High-Level Workflow

### Phase 1: Deep Research and Planning

#### 1.1 Understand Agent-Centric Design Principles

**Build for Workflows, Not Just API Endpoints:**
- Don't simply wrap existing API endpoints - build thoughtful, high-impact workflow tools
- Consolidate related operations (e.g., `schedule_event` that both checks availability and creates event)
- Focus on tools that enable complete tasks, not just individual API calls

**Optimize for Limited Context:**
- Agents have constrained context windows - make every token count
- Return high-signal information, not exhaustive data dumps
- Provide "concise" vs "detailed" response format options
- Default to human-readable identifiers over technical codes (names over IDs)

**Design Actionable Error Messages:**
- Error messages should guide agents toward correct usage patterns
- Suggest specific next steps: "Try using filter='active_only' to reduce results"
- Make errors educational, not just diagnostic

#### 1.2 Study Documentation

Load the reference files in `docs/mcp-reference/`:
- **mcp_best_practices.md** - Core guidelines for all MCP servers
- **node_mcp_server.md** - TypeScript/Node implementation guide
- **python_mcp_server.md** - Python/FastMCP implementation guide
- **evaluation.md** - Creating evaluations for testing

#### 1.3 Create Implementation Plan

Based on research, create a detailed plan:

**Tool Selection:**
- List the most valuable endpoints/operations to implement
- Prioritize tools that enable common and important use cases
- Consider which tools work together for complex workflows

**Input/Output Design:**
- Define input validation models (Pydantic for Python, Zod for TypeScript)
- Design consistent response formats (JSON and Markdown)
- Plan for large-scale usage with pagination and character limits

### Phase 2: Implementation

#### 2.1 Set Up Project Structure

**For Python:**
```
service_mcp/
├── server.py           # Main entry point
├── models.py           # Pydantic models
├── tools/              # Tool implementations
└── utils.py            # Shared utilities
```

**For TypeScript:**
```
service-mcp-server/
├── src/
│   ├── index.ts        # Main entry point
│   ├── types.ts        # Type definitions
│   ├── schemas/        # Zod schemas
│   └── tools/          # Tool implementations
├── package.json
└── tsconfig.json
```

#### 2.2 Implement Core Infrastructure First

Create shared utilities before implementing tools:
- API request helper functions
- Error handling utilities
- Response formatting functions (JSON and Markdown)
- Pagination helpers
- Authentication/token management

#### 2.3 Implement Tools Systematically

For each tool:

1. **Define Input Schema** with proper constraints and descriptions
2. **Write Comprehensive Descriptions** with examples
3. **Implement Tool Logic** using shared utilities
4. **Add Tool Annotations** (readOnlyHint, destructiveHint, etc.)

### Phase 3: Review and Refine

#### 3.1 Code Quality Review

- **DRY Principle**: No duplicated code between tools
- **Composability**: Shared logic extracted into functions
- **Consistency**: Similar operations return similar formats
- **Error Handling**: All external calls have error handling
- **Type Safety**: Full type coverage

#### 3.2 Quality Checklist

**Strategic Design:**
- [ ] Tools enable complete workflows, not just API wrappers
- [ ] Response formats optimize for agent context efficiency
- [ ] Error messages guide agents toward correct usage

**Implementation Quality:**
- [ ] All tools have comprehensive descriptions
- [ ] Input schemas have proper constraints
- [ ] Annotations correctly set
- [ ] Pagination implemented where applicable
- [ ] Character limits respected with truncation

### Phase 4: Create Evaluations

Create 10 realistic questions to test the MCP server:
- Questions must be read-only and independent
- Each should require multiple tool calls
- Answers must be single, verifiable values
- Answers must be stable (won't change over time)

See `docs/mcp-reference/evaluation.md` for complete guidelines.

## Reference Files

Load these resources as needed during development:

| Document | Purpose |
|----------|---------|
| `docs/mcp-reference/mcp_best_practices.md` | Core MCP guidelines |
| `docs/mcp-reference/node_mcp_server.md` | TypeScript implementation |
| `docs/mcp-reference/python_mcp_server.md` | Python implementation |
| `docs/mcp-reference/evaluation.md` | Testing MCP servers |

## Tips

- Start with the most valuable 3-5 tools, not all possible endpoints
- Test tools with actual LLM agents during development
- Iterate based on agent feedback and evaluation results
- Focus on reducing context consumption in responses
- Document error scenarios with suggested remedies
