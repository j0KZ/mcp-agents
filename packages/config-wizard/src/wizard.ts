/**
 * Main wizard orchestration
 */

import inquirer from 'inquirer';
import { detectEditor } from './detectors/editor.js';
import { detectProject } from './detectors/project.js';
import { detectTestFramework } from './detectors/test-framework.js';
import { editorPrompt, mcpPrompt, preferencesPrompt } from './prompts/index.js';
import { generateConfig } from './generators/index.js';
import { installMCPs } from './installer.js';
import { validateConfig } from './validator.js';
import { logger } from './utils/logger.js';
import { spinner } from './utils/spinner.js';

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

export interface WizardSelections {
  editor: string;
  mcps: string[];
  preferences: {
    reviewSeverity: 'lenient' | 'moderate' | 'strict';
    testFramework?: string;
    installGlobally: boolean;
  };
}

export async function runWizard(args: WizardArgs): Promise<void> {
  // Welcome message
  logger.header('🎯 MCP Agents Configuration Wizard');
  logger.divider();

  // Step 1: Detect environment
  const spin = spinner('Analyzing environment...');
  const detected = {
    editor: await detectEditor(),
    project: await detectProject(),
    testFramework: await detectTestFramework(),
  };
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
  const selections = await gatherSelections(args, detected);

  // Step 3: Validate selections
  logger.info('\nValidating configuration...');
  const issues = await validateConfig(selections, detected);

  if (issues.length > 0) {
    logger.warn('\n⚠️  Configuration issues found:');
    issues.forEach(issue => logger.warn(`  - ${issue}`));

    const { proceed } = await inquirer.prompt([
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
  const config = await generateConfig(selections);

  if (args.dryRun) {
    logger.info('\n📄 Generated configuration (dry run):');
    console.log(JSON.stringify(config, null, 2));
    logger.info('\n💡 Run without --dry-run to install');
    return;
  }

  // Step 5: Install MCPs
  if (selections.preferences.installGlobally) {
    await installMCPs(selections.mcps, args.verbose);
  }

  // Step 6: Write config
  logger.info('\nWriting configuration file...');
  const configPath = await writeConfig(config, selections.editor, args.output, args.force);
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

async function gatherSelections(args: WizardArgs, detected: any): Promise<WizardSelections> {
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
  const answers = await inquirer.prompt([
    editorPrompt(detected.editor),
    mcpPrompt(detected.project),
    ...preferencesPrompt(detected),
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

async function writeConfig(
  config: any,
  editor: string,
  customPath?: string,
  force?: boolean
): Promise<string> {
  const { writeConfigFile } = await import('./utils/file-system.js');
  return writeConfigFile(config, editor, customPath, force);
}
