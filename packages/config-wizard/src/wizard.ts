/**
 * Main wizard orchestration
 */

import inquirer from 'inquirer';
import { detectEditor } from './detectors/editor.js';
import { detectProject, type ProjectInfo } from './detectors/project.js';
import { detectTestFramework } from './detectors/test-framework.js';
import { editorPrompt, mcpPrompt, preferencesPrompt } from './prompts/index.js';
import { generateConfig } from './generators/index.js';
import { installMCPs } from './installer.js';
import { validateConfig } from './validator.js';
import { logger } from './utils/logger.js';
import { spinner } from './utils/spinner.js';
import { writeConfigFile } from './utils/file-system.js';

export interface WizardArgs {
  editor?: string;
  mcps?: string;
  dryRun?: boolean;
  force?: boolean;
  output?: string;
  verbose?: boolean;
  help?: boolean;
  version?: boolean;
}

export interface WizardDeps {
  spinner?: (text: string) => any;
  detectEditor?: () => Promise<string | null>;
  detectProject?: () => Promise<ProjectInfo>;
  detectTestFramework?: () => Promise<string | null>;
  generateConfig?: (selections: WizardSelections) => Promise<any>;
  validateConfig?: (selections: WizardSelections, detected: any) => Promise<string[]>;
  installMCPs?: (mcps: string[], verbose?: boolean) => Promise<void>;
  writeConfigFile?: (
    config: any,
    editor: string,
    path?: string,
    force?: boolean
  ) => Promise<string>;
  inquirerPrompt?: (questions: any) => Promise<any>;
  editorPrompt?: (defaultEditor: string | null) => any;
  mcpPrompt?: (project: any) => any;
  preferencesPrompt?: (detected: any) => any[];
}

export interface WizardSelections {
  editor: string;
  mcps: string[];
  preferences: {
    reviewSeverity: 'lenient' | 'moderate' | 'strict';
    testFramework?: string;
    installGlobally: boolean;
  };
}

export async function runWizard(args: WizardArgs, deps: WizardDeps = {}): Promise<void> {
  // Use injected dependencies or defaults
  const {
    spinner: createSpinner = spinner,
    detectEditor: detectEditorFn = detectEditor,
    detectProject: detectProjectFn = detectProject,
    detectTestFramework: detectTestFrameworkFn = detectTestFramework,
    generateConfig: generateConfigFn = generateConfig,
    validateConfig: validateConfigFn = validateConfig,
    installMCPs: installMCPsFn = installMCPs,
    writeConfigFile: writeConfigFileFn = writeConfigFile,
    inquirerPrompt = inquirer.prompt,
  } = deps;

  // Welcome message
  logger.header('🎯 MCP Agents Configuration Wizard');
  logger.divider();

  // Step 1: Detect environment
  const detected: {
    editor: string | null;
    project: ProjectInfo;
    testFramework: string | null;
  } = {
    editor: null,
    project: {
      language: 'unknown',
      framework: undefined,
      packageManager: 'npm',
      hasTests: false,
    },
    testFramework: null,
  };

  const spin = createSpinner('Analyzing environment...');

  // Try to detect, but continue if detection fails
  try {
    detected.editor = await detectEditorFn();
  } catch {
    logger.warn('Editor detection failed, will prompt for selection');
  }

  try {
    detected.project = await detectProjectFn();
  } catch {
    logger.warn('Project detection failed, will use defaults');
  }

  try {
    detected.testFramework = await detectTestFrameworkFn();
  } catch {
    logger.warn('Test framework detection failed, will prompt for selection');
  }

  spin.succeed('Environment analyzed');

  // Show detections
  if (detected.editor) {
    logger.info(`✓ Detected editor: ${detected.editor}`);
  }
  if (detected.project.language) {
    const framework = detected.project.framework ? ` + ${detected.project.framework}` : '';
    logger.info(`✓ Detected project: ${detected.project.language}${framework}`);
  }
  if (detected.testFramework) {
    logger.info(`✓ Detected test framework: ${detected.testFramework}`);
  }

  logger.divider();

  // Step 2: Interactive prompts (or use args)
  const selections = await gatherSelections(args, detected, deps);

  // Step 3: Validate selections
  logger.info('\nValidating configuration...');
  const issues = await validateConfigFn(selections, detected);

  if (issues.length > 0) {
    logger.warn('\n⚠️  Configuration issues found:');
    issues.forEach(issue => logger.warn(`  - ${issue}`));

    const { proceed } = await inquirerPrompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Continue anyway?',
        default: false,
      },
    ]);

    if (!proceed) {
      logger.info('Configuration cancelled');
      process.exit(0);
    }
  } else {
    logger.success('✓ Configuration valid');
  }

  // Step 4: Generate config
  logger.info('\nGenerating configuration...');
  const config = await generateConfigFn(selections);

  if (args.dryRun) {
    logger.info('\n📄 Generated configuration (dry run):');
    console.log(JSON.stringify(config, null, 2));
    logger.info('\n💡 Run without --dry-run to install');
    return;
  }

  // Step 5: Install MCPs
  if (selections.preferences.installGlobally) {
    await installMCPsFn(selections.mcps, args.verbose);
  }

  // Step 6: Write config
  logger.info('\nWriting configuration file...');
  const configPath = await writeConfigFileFn(config, selections.editor, args.output, args.force);
  logger.success(`✓ Configuration written to: ${configPath}`);

  // Success summary
  logger.divider();
  logger.success('✨ Setup complete!');
  logger.info(`\n📁 Config file: ${configPath}`);
  logger.info(`✅ Installed: ${selections.mcps.length} MCP packages`);
  logger.info(`🎯 Editor: ${selections.editor}`);

  logger.info('\n💡 Next steps:');
  logger.info('  1. Restart your editor');
  logger.info('  2. Try asking: "Review my code" or "Scan for vulnerabilities"');
}

export async function gatherSelections(
  args: WizardArgs,
  detected: any,
  deps: WizardDeps = {}
): Promise<WizardSelections> {
  const {
    inquirerPrompt = inquirer.prompt,
    editorPrompt: editorPromptFn = editorPrompt,
    mcpPrompt: mcpPromptFn = mcpPrompt,
    preferencesPrompt: preferencesPromptFn = preferencesPrompt,
  } = deps;

  // Non-interactive mode
  if (args.editor && args.mcps) {
    return {
      editor: args.editor,
      mcps: args.mcps.split(',').map(m => m.trim()),
      preferences: {
        reviewSeverity: 'moderate',
        testFramework: detected.testFramework,
        installGlobally: true,
      },
    };
  }

  // Interactive mode
  const answers = await inquirerPrompt([
    editorPromptFn(detected.editor),
    mcpPromptFn(detected.project),
    ...preferencesPromptFn(detected),
  ]);

  return {
    editor: answers.editor,
    mcps: answers.mcps,
    preferences: {
      reviewSeverity: answers.reviewSeverity || 'moderate',
      testFramework: answers.testFramework || detected.testFramework,
      installGlobally: answers.installGlobally !== false,
    },
  };
}
