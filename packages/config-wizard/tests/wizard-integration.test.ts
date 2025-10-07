import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runWizard, gatherSelections, type WizardArgs, type WizardDeps } from '../src/wizard.js';

describe('Wizard Integration Tests', () => {
  let mockDeps: WizardDeps;
  let consoleLogSpy: any;

  beforeEach(() => {
    // Mock all dependencies to avoid external calls
    mockDeps = {
      spinner: vi.fn(() => ({
        succeed: vi.fn(),
        fail: vi.fn(),
      })),
      detectEditor: vi.fn(async () => 'vscode'),
      detectProject: vi.fn(async () => ({
        language: 'typescript',
        framework: 'node',
        packageManager: 'npm',
        hasTests: true,
      })),
      detectTestFramework: vi.fn(async () => 'vitest'),
      generateConfig: vi.fn(async (selections) => ({
        mcpServers: selections.mcps.reduce((acc: any, mcp: string) => {
          acc[mcp] = { command: 'npx', args: [`@j0kz/${mcp}`] };
          return acc;
        }, {}),
      })),
      validateConfig: vi.fn(async () => []),
      installMCPs: vi.fn(async () => undefined),
      writeConfigFile: vi.fn(async (config, editor, path) =>
        path || `.${editor}/config.json`
      ),
      inquirerPrompt: vi.fn(async (questions) => {
        // Simulate user selections
        return {
          editor: 'vscode',
          mcps: ['smart-reviewer', 'security-scanner'],
          reviewSeverity: 'moderate',
          testFramework: 'vitest',
          installGlobally: true,
        };
      }),
      editorPrompt: vi.fn((defaultEditor) => ({
        type: 'list',
        name: 'editor',
        message: 'Select editor',
        choices: ['vscode', 'cursor'],
        default: defaultEditor,
      })),
      mcpPrompt: vi.fn(() => ({
        type: 'checkbox',
        name: 'mcps',
        message: 'Select MCP packages',
        choices: ['smart-reviewer', 'security-scanner'],
      })),
      preferencesPrompt: vi.fn(() => [
        {
          type: 'list',
          name: 'reviewSeverity',
          message: 'Review severity',
          choices: ['lenient', 'moderate', 'strict'],
          default: 'moderate',
        },
        {
          type: 'confirm',
          name: 'installGlobally',
          message: 'Install globally?',
          default: true,
        },
      ]),
    };

    // Spy on console.log to prevent output during tests
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('runWizard', () => {
    it('should complete full wizard flow with interactive mode', async () => {
      const args: WizardArgs = { verbose: false };

      await runWizard(args, mockDeps);

      // Verify detection functions were called
      expect(mockDeps.detectEditor).toHaveBeenCalled();
      expect(mockDeps.detectProject).toHaveBeenCalled();
      expect(mockDeps.detectTestFramework).toHaveBeenCalled();

      // Verify config generation and installation
      expect(mockDeps.generateConfig).toHaveBeenCalled();
      expect(mockDeps.installMCPs).toHaveBeenCalled();
      expect(mockDeps.writeConfigFile).toHaveBeenCalled();
    });

    it('should complete wizard flow with non-interactive mode', async () => {
      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer,security-scanner',
        verbose: false,
      };

      await runWizard(args, mockDeps);

      // Should skip prompts but still call essential functions
      expect(mockDeps.generateConfig).toHaveBeenCalled();
      expect(mockDeps.installMCPs).toHaveBeenCalled();
      expect(mockDeps.writeConfigFile).toHaveBeenCalled();
    });

    it('should handle dry-run mode without installing', async () => {
      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
        dryRun: true,
      };

      await runWizard(args, mockDeps);

      // Should generate config but not install or write
      expect(mockDeps.generateConfig).toHaveBeenCalled();
      expect(mockDeps.installMCPs).not.toHaveBeenCalled();
      expect(mockDeps.writeConfigFile).not.toHaveBeenCalled();
    });

    it('should handle detection failures gracefully', async () => {
      const failingDeps = {
        ...mockDeps,
        detectEditor: vi.fn(async () => {
          throw new Error('Editor detection failed');
        }),
        detectProject: vi.fn(async () => {
          throw new Error('Project detection failed');
        }),
        detectTestFramework: vi.fn(async () => {
          throw new Error('Test framework detection failed');
        }),
      };

      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
      };

      // Should not throw, should continue with defaults
      await expect(runWizard(args, failingDeps)).resolves.not.toThrow();
      expect(failingDeps.generateConfig).toHaveBeenCalled();
    });

    it('should validate config and handle issues', async () => {
      const depsWithIssues = {
        ...mockDeps,
        validateConfig: vi.fn(async () => [
          'Issue 1: Missing dependency',
          'Issue 2: Invalid path',
        ]),
        inquirerPrompt: vi.fn(async (questions) => {
          if (Array.isArray(questions)) {
            // Handle multiple questions
            const answers: any = {};
            for (const q of questions) {
              if (q.name === 'proceed') answers.proceed = true;
              if (q.name === 'editor') answers.editor = 'vscode';
              if (q.name === 'mcps') answers.mcps = ['smart-reviewer'];
            }
            return answers;
          } else {
            // Handle single question
            if (questions.name === 'proceed') return { proceed: true };
            return { editor: 'vscode', mcps: ['smart-reviewer'] };
          }
        }),
      };

      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
      };

      await runWizard(args, depsWithIssues);

      // Should ask user to proceed and continue
      expect(depsWithIssues.validateConfig).toHaveBeenCalled();
      expect(depsWithIssues.inquirerPrompt).toHaveBeenCalled();
    });

    it('should pass verbose flag to installMCPs', async () => {
      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
        verbose: true,
      };

      await runWizard(args, mockDeps);

      expect(mockDeps.installMCPs).toHaveBeenCalledWith(
        expect.any(Array),
        true
      );
    });

    it('should pass force flag to writeConfigFile', async () => {
      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
        force: true,
      };

      await runWizard(args, mockDeps);

      expect(mockDeps.writeConfigFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        undefined,
        true
      );
    });

    it('should use custom output path when provided', async () => {
      const customPath = '/custom/path/config.json';
      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
        output: customPath,
      };

      await runWizard(args, mockDeps);

      expect(mockDeps.writeConfigFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        customPath,
        undefined
      );
    });

    it('should skip global installation when preference is false', async () => {
      const depsNoInstall = {
        ...mockDeps,
        inquirerPrompt: vi.fn(async () => ({
          editor: 'vscode',
          mcps: ['smart-reviewer'],
          installGlobally: false,
        })),
      };

      const args: WizardArgs = {};

      await runWizard(args, depsNoInstall);

      expect(depsNoInstall.installMCPs).not.toHaveBeenCalled();
    });
  });

  describe('gatherSelections', () => {
    it('should use CLI args in non-interactive mode', async () => {
      const args: WizardArgs = {
        editor: 'cursor',
        mcps: 'smart-reviewer,test-generator,security-scanner',
      };

      const detected = {
        editor: 'vscode',
        project: { language: 'typescript' },
        testFramework: 'jest',
      };

      const selections = await gatherSelections(args, detected, mockDeps);

      expect(selections.editor).toBe('cursor');
      expect(selections.mcps).toEqual([
        'smart-reviewer',
        'test-generator',
        'security-scanner',
      ]);
      expect(selections.preferences.reviewSeverity).toBe('moderate');
      expect(selections.preferences.testFramework).toBe('jest');
      expect(selections.preferences.installGlobally).toBe(true);
    });

    it('should trim whitespace from MCP list', async () => {
      const args: WizardArgs = {
        editor: 'vscode',
        mcps: ' smart-reviewer , test-generator , security-scanner ',
      };

      const detected = {
        editor: null,
        project: {},
        testFramework: null,
      };

      const selections = await gatherSelections(args, detected, mockDeps);

      expect(selections.mcps).toEqual([
        'smart-reviewer',
        'test-generator',
        'security-scanner',
      ]);
    });

    it('should use detected test framework when available', async () => {
      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
      };

      const detected = {
        editor: 'vscode',
        project: {},
        testFramework: 'vitest',
      };

      const selections = await gatherSelections(args, detected, mockDeps);

      expect(selections.preferences.testFramework).toBe('vitest');
    });

    it('should use interactive mode when args incomplete', async () => {
      const args: WizardArgs = {
        editor: 'vscode',
        // Missing mcps
      };

      const detected = {
        editor: 'vscode',
        project: {},
        testFramework: null,
      };

      const selections = await gatherSelections(args, detected, mockDeps);

      // Should use prompt results
      expect(mockDeps.inquirerPrompt).toHaveBeenCalled();
      expect(selections.editor).toBe('vscode');
      expect(selections.mcps).toEqual(['smart-reviewer', 'security-scanner']);
    });

    it('should call all prompt functions in interactive mode', async () => {
      const args: WizardArgs = {};

      const detected = {
        editor: 'vscode',
        project: { language: 'typescript' },
        testFramework: 'jest',
      };

      await gatherSelections(args, detected, mockDeps);

      expect(mockDeps.editorPrompt).toHaveBeenCalledWith('vscode');
      expect(mockDeps.mcpPrompt).toHaveBeenCalledWith({
        language: 'typescript',
      });
      expect(mockDeps.preferencesPrompt).toHaveBeenCalledWith(detected);
    });

    it('should handle null detected values', async () => {
      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
      };

      const detected = {
        editor: null,
        project: {},
        testFramework: null,
      };

      const selections = await gatherSelections(args, detected, mockDeps);

      expect(selections.preferences.testFramework).toBeNull();
    });

    it('should preserve user severity choice from prompts', async () => {
      const depsStrictReview = {
        ...mockDeps,
        inquirerPrompt: vi.fn(async () => ({
          editor: 'vscode',
          mcps: ['smart-reviewer'],
          reviewSeverity: 'strict',
          installGlobally: true,
        })),
      };

      const args: WizardArgs = {};
      const detected = {
        editor: null,
        project: {},
        testFramework: null,
      };

      const selections = await gatherSelections(args, detected, depsStrictReview);

      expect(selections.preferences.reviewSeverity).toBe('strict');
    });

    it('should default to moderate severity when not specified', async () => {
      const depsNoSeverity = {
        ...mockDeps,
        inquirerPrompt: vi.fn(async () => ({
          editor: 'vscode',
          mcps: ['smart-reviewer'],
          // reviewSeverity not provided
          installGlobally: true,
        })),
      };

      const args: WizardArgs = {};
      const detected = {
        editor: null,
        project: {},
        testFramework: null,
      };

      const selections = await gatherSelections(args, detected, depsNoSeverity);

      expect(selections.preferences.reviewSeverity).toBe('moderate');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle typical TypeScript + VSCode setup', async () => {
      const args: WizardArgs = {};

      const typescriptDeps = {
        ...mockDeps,
        detectEditor: vi.fn(async () => 'vscode'),
        detectProject: vi.fn(async () => ({
          language: 'typescript',
          framework: 'node',
          packageManager: 'npm',
          hasTests: true,
        })),
        detectTestFramework: vi.fn(async () => 'vitest'),
      };

      await runWizard(args, typescriptDeps);

      expect(typescriptDeps.generateConfig).toHaveBeenCalled();
      expect(typescriptDeps.installMCPs).toHaveBeenCalled();
    });

    it('should handle Cursor editor with Bun project', async () => {
      const args: WizardArgs = {
        editor: 'cursor',
        mcps: 'smart-reviewer,architecture-analyzer',
      };

      const cursorDeps = {
        ...mockDeps,
        detectProject: vi.fn(async () => ({
          language: 'typescript',
          packageManager: 'bun',
          hasTests: false,
        })),
      };

      await runWizard(args, cursorDeps);

      const config = (cursorDeps.generateConfig as any).mock.calls[0][0];
      expect(config.editor).toBe('cursor');
      expect(config.mcps).toContain('smart-reviewer');
      expect(config.mcps).toContain('architecture-analyzer');
    });

    it('should handle user cancelling after validation issues', async () => {
      const cancelDeps = {
        ...mockDeps,
        validateConfig: vi.fn(async () => ['Critical error']),
        inquirerPrompt: vi.fn(async (questions: any) => {
          if (Array.isArray(questions)) {
            const proceedQ = questions.find(q => q.name === 'proceed');
            if (proceedQ) return { proceed: false };
          } else if (questions.name === 'proceed') {
            return { proceed: false };
          }
          return {
            editor: 'vscode',
            mcps: ['smart-reviewer'],
          };
        }),
      };

      const args: WizardArgs = {
        editor: 'vscode',
        mcps: 'smart-reviewer',
      };

      // Should exit gracefully
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
        throw new Error('process.exit called');
      }) as any);

      await expect(runWizard(args, cancelDeps)).rejects.toThrow('process.exit called');

      exitSpy.mockRestore();
    });
  });
});
