/**
 * @j0kz/shared
 * Shared utilities and types for all MCP tools
 * Enables modularity and integration between MCPs
 */

// Core types and interfaces
export * from './types/index.js';

// Shared utilities
export * from './utils/index.js';

// Performance optimization
export * from './performance/index.js';

// Inter-MCP communication
export * from './integration/index.js';

// MCP Client (MCP-to-MCP communication)
export * from './mcp-client/index.js';

// File system utilities
export * from './fs/index.js';

// Caching system
export * from './cache/index.js';

// Constants
export * from './constants/index.js';

// Security utilities
export * from './security/path-validator.js';

// Validation utilities
export * from './validation.js';

export const VERSION = '1.0.16';
export const PACKAGE_NAME = '@j0kz/shared';
