# MCP Reference Documentation

> **Source:** Adapted from [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) (Apache 2.0)

This directory contains comprehensive reference documentation for building high-quality MCP (Model Context Protocol) servers.

## Documents

| Document | Description |
|----------|-------------|
| [MCP Best Practices](./mcp_best_practices.md) | Core guidelines for all MCP servers: naming, response formats, pagination, security |
| [Node/TypeScript Guide](./node_mcp_server.md) | TypeScript-specific implementation with Zod schemas, project structure, examples |
| [Python Guide](./python_mcp_server.md) | Python-specific implementation with Pydantic, FastMCP, examples |
| [Evaluation Guide](./evaluation.md) | How to create evaluations to test MCP server quality |

## Quick Start

### Building an MCP Server

1. **Read the Best Practices** - Understand naming, response formats, and security requirements
2. **Choose your language** - TypeScript or Python
3. **Follow the implementation guide** - Complete examples and quality checklists
4. **Create evaluations** - Test your server with realistic questions

### Key Principles

- **Build for Workflows, Not Just API Endpoints** - Consolidate related operations
- **Optimize for Limited Context** - Return high-signal information
- **Design Actionable Error Messages** - Guide agents toward correct usage
- **Use Evaluation-Driven Development** - Let agent feedback drive improvements

## Usage in This Monorepo

These references complement our existing MCP tools by providing:

1. **Consistent patterns** across all `@j0kz` packages
2. **Quality checklists** for new tool development
3. **Best practices** for response formatting
4. **Security guidelines** for production deployments

## Related Resources

- [Universal Skills](../universal-skills/INDEX.md) - Project-agnostic developer skills
- [MCP Official Docs](https://modelcontextprotocol.io) - Official MCP specification
- [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) - Original source
