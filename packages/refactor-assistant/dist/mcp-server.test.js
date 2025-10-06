// @ts-nocheck - Test file with dynamic imports and runtime type checks
import { describe, it, expect } from 'vitest';
/**
 * MCP Server Integration Tests
 *
 * Tests the MCP protocol handlers and tool invocation flows
 */
describe('MCP Server Integration', () => {
    describe('Tool Definitions', () => {
        it('should export 8 refactoring tools', async () => {
            // Import tools array directly for testing
            const { TOOLS } = await import('./mcp-server.js');
            expect(TOOLS).toBeDefined();
            expect(TOOLS).toHaveLength(8);
        });
        it('should define extract_function tool with correct schema', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'extract_function');
            expect(tool).toBeDefined();
            if (!tool)
                throw new Error('Tool not found');
            expect(tool.description).toContain('Extract a code block');
            expect(tool.inputSchema.required).toEqual(['code', 'functionName', 'startLine', 'endLine']);
            expect(tool.inputSchema.properties).toHaveProperty('code');
            expect(tool.inputSchema.properties).toHaveProperty('functionName');
            expect(tool.inputSchema.properties).toHaveProperty('async');
            expect(tool.inputSchema.properties).toHaveProperty('arrow');
        });
        it('should define convert_to_async tool with correct schema', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'convert_to_async');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('callback-based code to async/await');
            expect(tool?.inputSchema.required).toEqual(['code']);
            expect(tool?.inputSchema.properties).toHaveProperty('useTryCatch');
        });
        it('should define simplify_conditionals tool with correct schema', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'simplify_conditionals');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('Simplify nested conditionals');
            expect(tool?.inputSchema.properties).toHaveProperty('useGuardClauses');
            expect(tool?.inputSchema.properties).toHaveProperty('useTernary');
        });
        it('should define remove_dead_code tool with correct schema', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'remove_dead_code');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('Remove dead code');
            expect(tool?.inputSchema.properties).toHaveProperty('removeUnusedImports');
            expect(tool?.inputSchema.properties).toHaveProperty('removeUnreachable');
        });
        it('should define apply_pattern tool with all 10 design patterns', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'apply_pattern');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('design pattern');
            const patternEnum = (tool?.inputSchema.properties.pattern).enum;
            expect(patternEnum).toHaveLength(10);
            expect(patternEnum).toContain('singleton');
            expect(patternEnum).toContain('factory');
            expect(patternEnum).toContain('observer');
            expect(patternEnum).toContain('strategy');
            expect(patternEnum).toContain('decorator');
            expect(patternEnum).toContain('adapter');
            expect(patternEnum).toContain('facade');
            expect(patternEnum).toContain('proxy');
            expect(patternEnum).toContain('command');
            expect(patternEnum).toContain('chain-of-responsibility');
        });
        it('should define rename_variable tool with correct schema', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'rename_variable');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('Rename a variable');
            expect(tool?.inputSchema.required).toEqual(['code', 'oldName', 'newName']);
            expect(tool?.inputSchema.properties).toHaveProperty('includeComments');
        });
        it('should define suggest_refactorings tool with correct schema', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'suggest_refactorings');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('refactoring suggestions');
            expect(tool?.inputSchema.required).toEqual(['code']);
            expect(tool?.inputSchema.properties).toHaveProperty('filePath');
        });
        it('should define calculate_metrics tool with correct schema', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'calculate_metrics');
            expect(tool).toBeDefined();
            expect(tool?.description).toContain('code quality metrics');
            expect(tool?.inputSchema.required).toEqual(['code']);
        });
    });
    describe('Tool Name Coverage', () => {
        it('should have unique tool names', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const names = TOOLS.map(t => t.name);
            const uniqueNames = new Set(names);
            expect(uniqueNames.size).toBe(names.length);
        });
        it('should use snake_case for all tool names', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            TOOLS.forEach(tool => {
                expect(tool.name).toMatch(/^[a-z_]+$/);
            });
        });
    });
    describe('Input Schema Validation', () => {
        it('should have object type for all input schemas', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            TOOLS.forEach(tool => {
                expect(tool.inputSchema.type).toBe('object');
                expect(tool.inputSchema.properties).toBeDefined();
            });
        });
        it('should have required fields defined for tools that need them', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const toolsWithRequired = TOOLS.filter(t => t.inputSchema.required);
            expect(toolsWithRequired.length).toBeGreaterThan(0);
        });
        it('should have code parameter in all tool schemas', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            TOOLS.forEach(tool => {
                expect(tool.inputSchema.properties).toHaveProperty('code');
            });
        });
    });
    describe('Tool Descriptions', () => {
        it('should have non-empty descriptions for all tools', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            TOOLS.forEach(tool => {
                expect(tool.description).toBeDefined();
                expect(tool.description.length).toBeGreaterThan(10);
            });
        });
        it('should have property descriptions in schemas', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            TOOLS.forEach(tool => {
                const props = tool.inputSchema.properties;
                Object.values(props).forEach((prop) => {
                    if (prop.description) {
                        expect(prop.description.length).toBeGreaterThan(0);
                    }
                });
            });
        });
    });
    describe('MCP Protocol Compliance', () => {
        it('should follow MCP tool schema structure', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            TOOLS.forEach(tool => {
                // Check required MCP tool fields
                expect(tool).toHaveProperty('name');
                expect(tool).toHaveProperty('description');
                expect(tool).toHaveProperty('inputSchema');
                // Check inputSchema structure
                expect(tool.inputSchema).toHaveProperty('type');
                expect(tool.inputSchema).toHaveProperty('properties');
            });
        });
        it('should use correct property types in schemas', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            TOOLS.forEach(tool => {
                const props = tool.inputSchema.properties;
                Object.entries(props).forEach(([key, value]) => {
                    expect(value).toHaveProperty('type');
                    // Common types should be valid
                    if (value.type) {
                        expect(['string', 'number', 'boolean', 'object', 'array']).toContain(value.type);
                    }
                });
            });
        });
    });
    describe('Boolean Default Values', () => {
        it('should have correct defaults for extract_function', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'extract_function');
            expect((tool?.inputSchema.properties.async).default).toBe(false);
            expect((tool?.inputSchema.properties.arrow).default).toBe(false);
        });
        it('should have correct defaults for convert_to_async', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'convert_to_async');
            expect((tool?.inputSchema.properties.useTryCatch).default).toBe(true);
        });
        it('should have correct defaults for simplify_conditionals', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'simplify_conditionals');
            expect((tool?.inputSchema.properties.useGuardClauses).default).toBe(true);
            expect((tool?.inputSchema.properties.useTernary).default).toBe(true);
        });
        it('should have correct defaults for remove_dead_code', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'remove_dead_code');
            expect((tool?.inputSchema.properties.removeUnusedImports).default).toBe(true);
            expect((tool?.inputSchema.properties.removeUnreachable).default).toBe(true);
        });
        it('should have correct defaults for rename_variable', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'rename_variable');
            expect((tool?.inputSchema.properties.includeComments).default).toBe(false);
        });
    });
    describe('Design Pattern Enum Validation', () => {
        it('should include all structural patterns', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'apply_pattern');
            const patternEnum = (tool?.inputSchema.properties.pattern).enum;
            // Structural patterns
            expect(patternEnum).toContain('adapter');
            expect(patternEnum).toContain('decorator');
            expect(patternEnum).toContain('facade');
            expect(patternEnum).toContain('proxy');
        });
        it('should include all behavioral patterns', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'apply_pattern');
            const patternEnum = (tool?.inputSchema.properties.pattern).enum;
            // Behavioral patterns
            expect(patternEnum).toContain('observer');
            expect(patternEnum).toContain('strategy');
            expect(patternEnum).toContain('command');
            expect(patternEnum).toContain('chain-of-responsibility');
        });
        it('should include all creational patterns', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'apply_pattern');
            const patternEnum = (tool?.inputSchema.properties.pattern).enum;
            // Creational patterns
            expect(patternEnum).toContain('singleton');
            expect(patternEnum).toContain('factory');
        });
    });
    describe('Optional Parameters', () => {
        it('should mark optional parameters correctly in extract_function', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'extract_function');
            const required = tool?.inputSchema.required || [];
            expect(required).not.toContain('async');
            expect(required).not.toContain('arrow');
        });
        it('should mark optional parameters correctly in apply_pattern', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'apply_pattern');
            const required = tool?.inputSchema.required || [];
            expect(required).not.toContain('patternOptions');
            expect(required).toContain('code');
            expect(required).toContain('pattern');
        });
        it('should mark optional parameters correctly in suggest_refactorings', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'suggest_refactorings');
            const required = tool?.inputSchema.required || [];
            expect(required).not.toContain('filePath');
            expect(required).toContain('code');
        });
    });
    describe('Parameter Types', () => {
        it('should use number type for line numbers', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'extract_function');
            expect((tool?.inputSchema.properties.startLine).type).toBe('number');
            expect((tool?.inputSchema.properties.endLine).type).toBe('number');
        });
        it('should use boolean type for flags', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const extractTool = TOOLS.find(t => t.name === 'extract_function');
            expect((extractTool?.inputSchema.properties.async).type).toBe('boolean');
            expect((extractTool?.inputSchema.properties.arrow).type).toBe('boolean');
        });
        it('should use string type for code and names', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const renameTool = TOOLS.find(t => t.name === 'rename_variable');
            expect((renameTool?.inputSchema.properties.code).type).toBe('string');
            expect((renameTool?.inputSchema.properties.oldName).type).toBe('string');
            expect((renameTool?.inputSchema.properties.newName).type).toBe('string');
        });
        it('should use object type for patternOptions', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'apply_pattern');
            expect((tool?.inputSchema.properties.patternOptions).type).toBe('object');
        });
    });
    describe('Parameter Descriptions', () => {
        it('should describe line number format', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'extract_function');
            const startDesc = (tool?.inputSchema.properties.startLine).description;
            const endDesc = (tool?.inputSchema.properties.endLine).description;
            expect(startDesc).toContain('1-indexed');
            expect(endDesc).toContain('1-indexed');
            expect(endDesc).toContain('inclusive');
        });
        it('should describe rename_variable validation', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const tool = TOOLS.find(t => t.name === 'rename_variable');
            const newNameDesc = (tool?.inputSchema.properties.newName).description;
            expect(newNameDesc).toContain('valid identifier');
        });
    });
    describe('Tool Count and Coverage', () => {
        it('should have exactly 8 tools matching refactorer exports', async () => {
            const { TOOLS } = await import('./mcp-server.js');
            const refactorer = await import('./refactorer.js');
            // Count exported functions from refactorer
            const expectedTools = [
                'extractFunction',
                'convertToAsync',
                'simplifyConditionals',
                'removeDeadCode',
                'applyDesignPattern',
                'renameVariable',
                'suggestRefactorings',
                'calculateMetrics',
            ];
            expectedTools.forEach(funcName => {
                expect(refactorer).toHaveProperty(funcName);
            });
            expect(TOOLS).toHaveLength(expectedTools.length);
        });
    });
});
//# sourceMappingURL=mcp-server.test.js.map