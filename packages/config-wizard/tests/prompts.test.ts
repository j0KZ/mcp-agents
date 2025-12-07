/**
 * Tests for prompt functions
 */

import { describe, it, expect } from 'vitest';
import { editorPrompt } from '../src/prompts/editor-select.js';
import { mcpPrompt } from '../src/prompts/mcp-select.js';
import { preferencesPrompt } from '../src/prompts/preferences.js';
import type { ProjectInfo } from '../src/detectors/project.js';

describe('editorPrompt', () => {
  it('should return prompt configuration with default editor', () => {
    const prompt = editorPrompt('claude-code');

    expect(prompt.type).toBe('list');
    expect(prompt.name).toBe('editor');
    expect(prompt.message).toBe('Select your editor:');
    expect(prompt.default).toBe('claude-code');
  });

  it('should have correct editor choices', () => {
    const prompt = editorPrompt(null);

    expect(prompt.choices).toHaveLength(5);
    expect(prompt.choices[0]).toEqual({ name: 'Claude Code (Anthropic)', value: 'claude-code' });
    expect(prompt.choices[1]).toEqual({ name: 'Cursor (Anysphere)', value: 'cursor' });
    expect(prompt.choices[2]).toEqual({ name: 'Windsurf (Codeium)', value: 'windsurf' });
    expect(prompt.choices[3]).toEqual({ name: 'VS Code + Continue', value: 'vscode' });
    expect(prompt.choices[4]).toEqual({ name: 'Roo Code', value: 'roo' });
  });

  it('should default to claude-code when no editor detected', () => {
    const prompt = editorPrompt(null);
    expect(prompt.default).toBe('claude-code');
  });

  it('should use detected editor as default', () => {
    const prompt = editorPrompt('cursor');
    expect(prompt.default).toBe('cursor');
  });

  it('should use windsurf as default when detected', () => {
    const prompt = editorPrompt('windsurf');
    expect(prompt.default).toBe('windsurf');
  });

  it('should use vscode as default when detected', () => {
    const prompt = editorPrompt('vscode');
    expect(prompt.default).toBe('vscode');
  });

  it('should use roo as default when detected', () => {
    const prompt = editorPrompt('roo');
    expect(prompt.default).toBe('roo');
  });
});

describe('mcpPrompt', () => {
  // Using the actual ProjectInfo interface
  const mockProjectInfo: ProjectInfo = {
    language: 'typescript',
    packageManager: 'npm',
    hasTests: true,
  };

  it('should return prompt configuration', () => {
    const prompt = mcpPrompt(mockProjectInfo);

    expect(prompt.type).toBe('checkbox');
    expect(prompt.name).toBe('mcps');
    expect(prompt.message).toContain('MCP tools');
  });

  it('should have all MCP choices', () => {
    const prompt = mcpPrompt(mockProjectInfo);

    expect(prompt.choices).toHaveLength(8);

    const values = prompt.choices.map((c: { value: string }) => c.value);
    expect(values).toContain('smart-reviewer');
    expect(values).toContain('security-scanner');
    expect(values).toContain('test-generator');
    expect(values).toContain('architecture-analyzer');
    expect(values).toContain('refactor-assistant');
    expect(values).toContain('api-designer');
    expect(values).toContain('db-schema');
    expect(values).toContain('doc-generator');
  });

  it('should have validate function', () => {
    const prompt = mcpPrompt(mockProjectInfo);
    expect(typeof prompt.validate).toBe('function');
  });

  it('should validate that at least one MCP is selected', () => {
    const prompt = mcpPrompt(mockProjectInfo);

    expect(prompt.validate([])).toBe('You must select at least one MCP tool.');
    expect(prompt.validate(['smart-reviewer'])).toBe(true);
    expect(prompt.validate(['smart-reviewer', 'test-generator'])).toBe(true);
  });

  it('should recommend smart-reviewer by default', () => {
    const prompt = mcpPrompt(mockProjectInfo);
    const smartReviewer = prompt.choices.find(
      (c: { value: string }) => c.value === 'smart-reviewer'
    );
    expect(smartReviewer.checked).toBe(true);
  });

  it('should recommend security-scanner by default', () => {
    const prompt = mcpPrompt(mockProjectInfo);
    const securityScanner = prompt.choices.find(
      (c: { value: string }) => c.value === 'security-scanner'
    );
    expect(securityScanner.checked).toBe(true);
  });

  it('should recommend api-designer and db-schema for Express projects', () => {
    const expressProject: ProjectInfo = {
      language: 'typescript',
      framework: 'express',
      packageManager: 'npm',
      hasTests: false,
    };
    const prompt = mcpPrompt(expressProject);
    const apiDesigner = prompt.choices.find((c: { value: string }) => c.value === 'api-designer');
    const dbSchema = prompt.choices.find((c: { value: string }) => c.value === 'db-schema');
    expect(apiDesigner.checked).toBe(true);
    expect(dbSchema.checked).toBe(true);
  });

  it('should recommend api-designer and db-schema for NestJS projects', () => {
    const nestProject: ProjectInfo = {
      language: 'typescript',
      framework: 'nest',
      packageManager: 'npm',
      hasTests: false,
    };
    const prompt = mcpPrompt(nestProject);
    const apiDesigner = prompt.choices.find((c: { value: string }) => c.value === 'api-designer');
    const dbSchema = prompt.choices.find((c: { value: string }) => c.value === 'db-schema');
    expect(apiDesigner.checked).toBe(true);
    expect(dbSchema.checked).toBe(true);
  });

  it('should recommend architecture-analyzer for all projects', () => {
    const prompt = mcpPrompt(mockProjectInfo);
    const archAnalyzer = prompt.choices.find(
      (c: { value: string }) => c.value === 'architecture-analyzer'
    );
    expect(archAnalyzer.checked).toBe(true);
  });

  it('should recommend test-generator for React projects', () => {
    const reactProject: ProjectInfo = {
      language: 'typescript',
      framework: 'react',
      packageManager: 'npm',
      hasTests: false,
    };
    const prompt = mcpPrompt(reactProject);
    const testGenerator = prompt.choices.find(
      (c: { value: string }) => c.value === 'test-generator'
    );
    expect(testGenerator.checked).toBe(true);
  });

  it('should recommend test-generator for projects with tests', () => {
    const projectWithTests: ProjectInfo = {
      language: 'javascript',
      packageManager: 'npm',
      hasTests: true,
    };
    const prompt = mcpPrompt(projectWithTests);
    const testGenerator = prompt.choices.find(
      (c: { value: string }) => c.value === 'test-generator'
    );
    expect(testGenerator.checked).toBe(true);
  });

  it('should not check refactor-assistant by default', () => {
    const prompt = mcpPrompt(mockProjectInfo);
    const refactorAssistant = prompt.choices.find(
      (c: { value: string }) => c.value === 'refactor-assistant'
    );
    expect(refactorAssistant.checked).toBe(false);
  });

  it('should not check doc-generator by default', () => {
    const prompt = mcpPrompt(mockProjectInfo);
    const docGenerator = prompt.choices.find((c: { value: string }) => c.value === 'doc-generator');
    expect(docGenerator.checked).toBe(false);
  });
});

describe('preferencesPrompt', () => {
  it('should return array of prompts', () => {
    const prompts = preferencesPrompt({ testFramework: 'vitest' });
    expect(Array.isArray(prompts)).toBe(true);
  });

  it('should include reviewSeverity prompt', () => {
    const prompts = preferencesPrompt({ testFramework: 'vitest' });
    const reviewPrompt = prompts.find((p: { name: string }) => p.name === 'reviewSeverity');

    expect(reviewPrompt).toBeDefined();
    expect(reviewPrompt.type).toBe('list');
    expect(reviewPrompt.choices).toHaveLength(3);
    expect(reviewPrompt.default).toBe('moderate');
  });

  it('should have correct severity choices', () => {
    const prompts = preferencesPrompt({ testFramework: 'vitest' });
    const reviewPrompt = prompts.find((p: { name: string }) => p.name === 'reviewSeverity');

    expect(reviewPrompt.choices[0]).toEqual({ name: 'Lenient (minimal noise)', value: 'lenient' });
    expect(reviewPrompt.choices[1]).toEqual({ name: 'Moderate (balanced)', value: 'moderate' });
    expect(reviewPrompt.choices[2]).toEqual({ name: 'Strict (catch everything)', value: 'strict' });
  });

  it('should show reviewSeverity only when smart-reviewer is selected', () => {
    const prompts = preferencesPrompt({ testFramework: 'vitest' });
    const reviewPrompt = prompts.find((p: { name: string }) => p.name === 'reviewSeverity');

    expect(reviewPrompt.when({ mcps: ['smart-reviewer'] })).toBe(true);
    expect(reviewPrompt.when({ mcps: ['test-generator'] })).toBe(false);
    expect(reviewPrompt.when({ mcps: [] })).toBe(false);
  });

  it('should include testFramework prompt when not detected', () => {
    const prompts = preferencesPrompt({ testFramework: null });
    const frameworkPrompt = prompts.find((p: { name: string }) => p.name === 'testFramework');

    expect(frameworkPrompt).toBeDefined();
    expect(frameworkPrompt.type).toBe('list');
    expect(frameworkPrompt.choices).toHaveLength(5);
  });

  it('should not include testFramework prompt when already detected', () => {
    const prompts = preferencesPrompt({ testFramework: 'vitest' });
    const frameworkPrompt = prompts.find((p: { name: string }) => p.name === 'testFramework');

    expect(frameworkPrompt).toBeUndefined();
  });

  it('should have correct test framework choices', () => {
    const prompts = preferencesPrompt({ testFramework: null });
    const frameworkPrompt = prompts.find((p: { name: string }) => p.name === 'testFramework');

    expect(frameworkPrompt.choices[0]).toEqual({ name: 'Jest', value: 'jest' });
    expect(frameworkPrompt.choices[1]).toEqual({ name: 'Vitest', value: 'vitest' });
    expect(frameworkPrompt.choices[2]).toEqual({ name: 'Mocha', value: 'mocha' });
    expect(frameworkPrompt.choices[3]).toEqual({ name: 'Ava', value: 'ava' });
    expect(frameworkPrompt.choices[4]).toEqual({ name: 'Skip (no tests)', value: null });
  });

  it('should show testFramework only when test-generator is selected', () => {
    const prompts = preferencesPrompt({ testFramework: null });
    const frameworkPrompt = prompts.find((p: { name: string }) => p.name === 'testFramework');

    expect(frameworkPrompt.when({ mcps: ['test-generator'] })).toBe(true);
    expect(frameworkPrompt.when({ mcps: ['smart-reviewer'] })).toBe(false);
  });

  it('should include installGlobally prompt', () => {
    const prompts = preferencesPrompt({ testFramework: 'vitest' });
    const installPrompt = prompts.find((p: { name: string }) => p.name === 'installGlobally');

    expect(installPrompt).toBeDefined();
    expect(installPrompt.type).toBe('confirm');
    expect(installPrompt.default).toBe(true);
  });

  it('should have correct number of prompts with detected framework', () => {
    const prompts = preferencesPrompt({ testFramework: 'jest' });
    // Should have reviewSeverity and installGlobally
    expect(prompts).toHaveLength(2);
  });

  it('should have correct number of prompts without detected framework', () => {
    const prompts = preferencesPrompt({ testFramework: null });
    // Should have reviewSeverity, testFramework, and installGlobally
    expect(prompts).toHaveLength(3);
  });
});
