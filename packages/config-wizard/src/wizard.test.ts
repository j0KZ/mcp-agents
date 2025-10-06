/**
 * Tests for Configuration Wizard
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  runWizard,
  gatherSelections,
  type WizardArgs,
  type WizardDeps,
} from './wizard.js';

// Mock all dependencies
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({
      editor: 'vscode',
      mcps: ['smart-reviewer', 'test-generator'],
      reviewSeverity: 'moderate',
      testFramework: 'jest',
      installGlobally: false,
      proceed: true,
    }),
  },
}));

vi.mock('./detectors/editor.js', () => ({
  detectEditor: vi.fn().mockResolvedValue('vscode'),
}));

vi.mock('./detectors/project.js', () => ({
  detectProject: vi.fn().mockResolvedValue({
    language: 'typescript',
    framework: 'react',
    hasTests: true,
  }),
}));

vi.mock('./detectors/test-framework.js', () => ({
  detectTestFramework: vi.fn().mockResolvedValue('jest'),
}));

vi.mock('./prompts/index.js', () => ({
  editorPrompt: vi.fn().mockReturnValue({
    type: 'list',
    name: 'editor',
    message: 'Select your editor',
    choices: ['vscode', 'cursor', 'windsurf'],
    default: 'vscode',
  }),
  mcpPrompt: vi.fn().mockReturnValue({
    type: 'checkbox',
    name: 'mcps',
    message: 'Select MCP tools',
    choices: ['smart-reviewer', 'test-generator'],
  }),
  preferencesPrompt: vi.fn().mockReturnValue([
    {
      type: 'list',
      name: 'reviewSeverity',
      message: 'Review severity',
      choices: ['lenient', 'moderate', 'strict'],
      default: 'moderate',
    },
    {
      type: 'list',
      name: 'testFramework',
      message: 'Test framework',
      choices: ['jest', 'vitest', 'mocha'],
      default: 'jest',
    },
    {
      type: 'confirm',
      name: 'installGlobally',
      message: 'Install globally?',
      default: false,
    },
  ]),
}));

vi.mock('./generators/index.js', () => ({
  generateConfig: vi.fn().mockResolvedValue({
    mcpServers: {
      'smart-reviewer': {
        command: 'npx',
        args: ['@j0kz/smart-reviewer-mcp'],
      },
    },
  }),
}));

vi.mock('./installer.js', () => ({
  installMCPs: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('./validator.js', () => ({
  validateConfig: vi.fn().mockResolvedValue([]),
}));

vi.mock('./utils/logger.js', () => ({
  logger: {
    header: vi.fn(),
    divider: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('./utils/spinner.js', () => ({
  spinner: vi.fn().mockImplementation(() => ({
    succeed: vi.fn(),
    fail: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(),
  })),
}));

vi.mock('./utils/file-system.js', () => ({
  writeConfigFile: vi.fn().mockResolvedValue('/path/to/config.json'),
  backupConfigFile: vi.fn().mockResolvedValue(true),
}));

// Mock file system operations
vi.mock('fs', () => ({
  default: {
    writeFileSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn(),
  },
}));

// Mock process.exit
vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('Process exit called');
});

describe('Configuration Wizard', () => {
  let mockDeps: WizardDeps;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock dependencies
    mockDeps = {
      spinner: vi.fn(() => ({
        succeed: vi.fn(),
        fail: vi.fn(),
        stop: vi.fn(),
        start: vi.fn(),
      })),
      detectEditor: vi.fn().mockResolvedValue('vscode'),
      detectProject: vi.fn().mockResolvedValue({
        language: 'typescript',
        framework: 'react',
        packageManager: 'npm',
        hasTests: true,
      }),
      detectTestFramework: vi.fn().mockResolvedValue('jest'),
      generateConfig: vi.fn().mockResolvedValue({
        mcpServers: {
          'smart-reviewer': {
            command: 'npx',
            args: ['@j0kz/smart-reviewer-mcp'],
          },
        },
      }),
      validateConfig: vi.fn().mockResolvedValue([]),
      installMCPs: vi.fn().mockResolvedValue(undefined),
      writeConfigFile: vi.fn().mockResolvedValue('/path/to/config.json'),
      inquirerPrompt: vi.fn().mockResolvedValue({
        editor: 'vscode',
        mcps: ['smart-reviewer', 'test-generator'],
        reviewSeverity: 'moderate',
        testFramework: 'jest',
        installGlobally: false,
        proceed: true,
      }),
      editorPrompt: vi.fn(defaultEditor => ({
        type: 'list',
        name: 'editor',
        message: 'Select your editor',
        default: defaultEditor,
        choices: ['vscode', 'cursor', 'windsurf'],
      })),
      mcpPrompt: vi.fn(() => ({
        type: 'checkbox',
        name: 'mcps',
        message: 'Select MCP tools',
        choices: ['smart-reviewer', 'test-generator'],
      })),
      preferencesPrompt: vi.fn(() => [
        {
          type: 'list',
          name: 'reviewSeverity',
          message: 'Review severity',
          choices: ['lenient', 'moderate', 'strict'],
        },
        {
          type: 'list',
          name: 'testFramework',
          message: 'Test framework',
          choices: ['jest', 'vitest'],
        },
        {
          type: 'confirm',
          name: 'installGlobally',
          message: 'Install globally?',
          default: false,
        },
      ]),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('runWizard', () => {
    it('should complete full wizard flow with detections', async () => {
      const args: WizardArgs = {};

      await runWizard(args, mockDeps);

      // Verify detection functions were called
      expect(mockDeps.detectEditor).toHaveBeenCalled();
      expect(mockDeps.detectProject).toHaveBeenCalled();
      expect(mockDeps.detectTestFramework).toHaveBeenCalled();

      // Verify config was generated
      expect(mockDeps.generateConfig).toHaveBeenCalled();

      // Verify installation was NOT triggered (installGlobally is false in mock)
      expect(mockDeps.installMCPs).not.toHaveBeenCalled();
    });

    it('should handle dry-run mode', async () => {
      const args: WizardArgs = { dryRun: true };

      await runWizard(args, mockDeps);

      // Should NOT install in dry-run
      expect(mockDeps.installMCPs).not.toHaveBeenCalled();

      // Should NOT write config in dry-run
      expect(mockDeps.writeConfigFile).not.toHaveBeenCalled();

      // Should generate config
      expect(mockDeps.generateConfig).toHaveBeenCalled();
    });

    it('should use provided arguments to skip prompts', async () => {
      const args: WizardArgs = {
        editor: 'cursor',
        mcps: 'smart-reviewer,test-generator',
      };

      await runWizard(args, mockDeps);

      // Should not prompt when args are provided
      expect(mockDeps.inquirerPrompt).not.toHaveBeenCalled();
    });

    it('should handle validation issues and user cancellation', async () => {
      const testDeps = {
        ...mockDeps,
        validateConfig: vi.fn().mockResolvedValueOnce(['Editor not supported']),
        inquirerPrompt: vi
          .fn()
          .mockResolvedValueOnce({
            editor: 'vscode',
            mcps: ['smart-reviewer'],
            reviewSeverity: 'moderate',
            testFramework: 'jest',
            installGlobally: false,
          })
          .mockResolvedValueOnce({ proceed: false }), // This is for the validation prompt
      };

      const args: WizardArgs = {};

      // The function should throw when process.exit is called
      await expect(runWizard(args, testDeps)).rejects.toThrow(/process\.?exit/i);
    });

    it('should continue with validation issues if user confirms', async () => {
      const testDeps = {
        ...mockDeps,
        validateConfig: vi.fn().mockResolvedValueOnce(['Minor issue']),
        inquirerPrompt: vi
          .fn()
          .mockResolvedValueOnce({
            editor: 'vscode',
            mcps: ['smart-reviewer'],
            reviewSeverity: 'moderate',
            testFramework: 'jest',
            installGlobally: false,
          })
          .mockResolvedValueOnce({ proceed: true }), // This is for the validation prompt
      };

      const args: WizardArgs = {};

      await runWizard(args, testDeps);

      // Should continue to config generation
      expect(testDeps.generateConfig).toHaveBeenCalled();
    });

    it('should write config file to specified output path', async () => {
      const args: WizardArgs = {
        output: '/custom/path/config.json',
      };

      await runWizard(args, mockDeps);

      expect(mockDeps.writeConfigFile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        '/custom/path/config.json',
        undefined
      );
    });

    it('should handle installation errors gracefully', async () => {
      const testDeps = {
        ...mockDeps,
        installMCPs: vi.fn().mockRejectedValueOnce(new Error('Install failed')),
        inquirerPrompt: vi.fn().mockResolvedValueOnce({
          editor: 'vscode',
          mcps: ['smart-reviewer'],
          reviewSeverity: 'moderate',
          testFramework: 'jest',
          installGlobally: true, // This will trigger installation
        }),
      };

      const args: WizardArgs = {};

      await expect(runWizard(args, testDeps)).rejects.toThrow('Install failed');
    });
  });

  describe('gatherSelections', () => {
    it('should use detected values when no args provided', async () => {
      const args: WizardArgs = {};
      const detected = {
        editor: 'vscode',
        project: { language: 'typescript', framework: 'react', hasTests: true },
        testFramework: 'jest',
      };

      const testDeps = {
        ...mockDeps,
        inquirerPrompt: vi.fn().mockResolvedValueOnce({
          editor: 'vscode',
          mcps: ['smart-reviewer'],
          reviewSeverity: 'moderate',
          testFramework: 'jest',
          installGlobally: false,
        }),
      };

      const selections = await gatherSelections(args, detected, testDeps);

      expect(selections.editor).toBe('vscode');
      expect(selections.preferences.testFramework).toBe('jest');
    });

    it('should parse comma-separated MCP list from args', async () => {
      const args: WizardArgs = {
        editor: 'vscode', // Need to provide both editor AND mcps to skip interactive mode
        mcps: 'smart-reviewer,test-generator,security-scanner',
      };
      const detected = {
        editor: null,
        project: { language: null, framework: null, hasTests: false },
        testFramework: null,
      };

      const selections = await gatherSelections(args, detected, mockDeps);

      expect(selections.mcps).toEqual(['smart-reviewer', 'test-generator', 'security-scanner']);
    });

    it('should prompt for missing values', async () => {
      const args: WizardArgs = {};
      const detected = {
        editor: null, // No editor detected
        project: { language: null, framework: null, hasTests: false },
        testFramework: null,
      };

      await gatherSelections(args, detected, mockDeps);

      // Should prompt using inquirerPrompt since values are missing
      expect(mockDeps.inquirerPrompt).toHaveBeenCalled();

      // Should have created prompts for missing values
      expect(mockDeps.editorPrompt).toHaveBeenCalledWith(null);
      expect(mockDeps.mcpPrompt).toHaveBeenCalled();
      expect(mockDeps.preferencesPrompt).toHaveBeenCalled();
    });

    it('should override detected values with args', async () => {
      const args: WizardArgs = {
        editor: 'cursor', // Override detected
        mcps: 'smart-reviewer', // Need to provide both to skip interactive mode
      };
      const detected = {
        editor: 'vscode', // This should be overridden
        project: { language: 'typescript', framework: null, hasTests: false },
        testFramework: null,
      };

      const selections = await gatherSelections(args, detected, mockDeps);

      expect(selections.editor).toBe('cursor'); // Args take precedence
    });
  });

  describe('Error Handling', () => {
    it('should handle detection errors gracefully', async () => {
      const testDeps = {
        ...mockDeps,
        detectEditor: vi.fn().mockRejectedValueOnce(new Error('Detection failed')),
      };

      const args: WizardArgs = {};

      // Should continue despite detection error
      await runWizard(args, testDeps);

      // Should still call generateConfig after prompts
      expect(testDeps.generateConfig).toHaveBeenCalled();
    });

    it('should handle config generation errors', async () => {
      const testDeps = {
        ...mockDeps,
        generateConfig: vi.fn().mockRejectedValueOnce(new Error('Config generation failed')),
      };

      const args: WizardArgs = {};

      await expect(runWizard(args, testDeps)).rejects.toThrow('Config generation failed');
    });

    it('should handle file write errors', async () => {
      const testDeps = {
        ...mockDeps,
        writeConfigFile: vi.fn().mockRejectedValueOnce(new Error('Permission denied')),
      };

      const args: WizardArgs = {};

      await expect(runWizard(args, testDeps)).rejects.toThrow('Permission denied');
    });
  });

  describe('Special Cases', () => {
    it('should handle force mode to skip confirmations', async () => {
      const args: WizardArgs = { force: true };

      await runWizard(args, mockDeps);

      // Force mode should still generate config
      expect(mockDeps.generateConfig).toHaveBeenCalled();
    });

    it('should handle verbose mode with extra logging', async () => {
      const args: WizardArgs = { verbose: true };

      await runWizard(args, mockDeps);

      // Should show extra logs
      const { logger } = await import('./utils/logger.js');
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Detected'));
    });

    it('should handle global installation preference', async () => {
      const testDeps = {
        ...mockDeps,
        inquirerPrompt: vi.fn().mockResolvedValueOnce({
          editor: 'vscode',
          mcps: ['smart-reviewer', 'test-generator'],
          reviewSeverity: 'strict',
          testFramework: 'vitest',
          installGlobally: true, // Global install
        }),
      };

      const args: WizardArgs = {};

      await runWizard(args, testDeps);

      // Check that installMCPs was called
      expect(testDeps.installMCPs).toHaveBeenCalled();
    });

    it('should handle different editor configurations', async () => {
      const testEditors = ['vscode', 'cursor', 'windsurf', 'claude-code'];

      for (const editor of testEditors) {
        const testDeps = {
          ...mockDeps,
          generateConfig: vi.fn().mockResolvedValueOnce({}),
        };

        const args: WizardArgs = {
          editor,
          mcps: 'smart-reviewer', // Need both to skip interactive mode
          dryRun: true,
        };

        await runWizard(args, testDeps);

        expect(testDeps.generateConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            editor,
          })
        );
      }
    });
  });
});
