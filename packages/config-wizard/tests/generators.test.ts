/**
 * Tests for config generators
 */

import { describe, it, expect } from 'vitest';
import { generateClaudeCodeConfig } from '../src/generators/claude-code.js';
import { generateConfig } from '../src/generators/index.js';
import type { WizardSelections } from '../src/wizard.js';

describe('Config Generators', () => {
  const mockSelections: WizardSelections = {
    editor: 'claude-code',
    mcps: ['smart-reviewer', 'security-scanner', 'test-generator'],
    preferences: {
      reviewSeverity: 'moderate',
      testFramework: 'vitest',
      installGlobally: true,
    },
  };

  describe('Claude Code Generator', () => {
    it('should generate valid config structure', () => {
      const config = generateClaudeCodeConfig(mockSelections);

      expect(config).toHaveProperty('mcpServers');
      expect(config.mcpServers).toBeDefined();
    });

    it('should include selected MCPs', () => {
      const config = generateClaudeCodeConfig(mockSelections);

      expect(config.mcpServers).toHaveProperty('smart-reviewer');
      expect(config.mcpServers).toHaveProperty('security-scanner');
      expect(config.mcpServers).toHaveProperty('test-generator');
    });

    it('should use npx command for each MCP', () => {
      const config = generateClaudeCodeConfig(mockSelections);

      const reviewer = config.mcpServers['smart-reviewer'];
      expect(reviewer.command).toBe('npx');
      expect(reviewer.args).toBeDefined();
      expect(reviewer.args[0]).toContain('@j0kz/smart-reviewer-mcp');
    });

    it('should pin versions to ^1.0.0', () => {
      const config = generateClaudeCodeConfig(mockSelections);

      const reviewer = config.mcpServers['smart-reviewer'];
      expect(reviewer.args[0]).toContain('@^1.0.0');
    });

    it('should not include unselected MCPs', () => {
      const config = generateClaudeCodeConfig(mockSelections);

      expect(config.mcpServers).not.toHaveProperty('api-designer');
      expect(config.mcpServers).not.toHaveProperty('db-schema');
    });
  });

  describe('Multi-Editor Generator', () => {
    it('should generate config for Claude Code', async () => {
      const config = await generateConfig(mockSelections);
      expect(config).toHaveProperty('mcpServers');
    });

    it('should generate config for Cursor', async () => {
      const cursorSelections = { ...mockSelections, editor: 'cursor' };
      const config = await generateConfig(cursorSelections);
      expect(config).toHaveProperty('mcpServers');
    });

    it('should generate config for Windsurf', async () => {
      const windsurfSelections = { ...mockSelections, editor: 'windsurf' };
      const config = await generateConfig(windsurfSelections);
      expect(config).toHaveProperty('mcpServers');
    });

    it('should generate config for VS Code', async () => {
      const vscodeSelections = { ...mockSelections, editor: 'vscode' };
      const config = await generateConfig(vscodeSelections);
      expect(config).toHaveProperty('mcp');
    });

    it('should throw for unknown editor', async () => {
      const invalidSelections = { ...mockSelections, editor: 'unknown' as any };
      await expect(generateConfig(invalidSelections)).rejects.toThrow();
    });
  });
});
