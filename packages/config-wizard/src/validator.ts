/**
 * Configuration validator
 */

import semver from 'semver';
import fs from 'fs-extra';
import { getEditorConfigPath } from './detectors/editor.js';
import type { WizardSelections } from './wizard.js';

export async function validateConfig(
  selections: WizardSelections,
  detected: any
): Promise<string[]> {
  const issues: string[] = [];

  // Check Node version
  const nodeVersion = process.version;
  if (!semver.satisfies(nodeVersion, '>=18.0.0')) {
    issues.push(`Node.js 18+ required (current: ${nodeVersion})`);
  }

  // Check if editor config path exists or can be created
  const configPath = getEditorConfigPath(selections.editor as any);
  if (configPath) {
    const configDir = require('path').dirname(configPath);

    try {
      await fs.ensureDir(configDir);
    } catch (error) {
      issues.push(`Cannot create config directory: ${configDir}`);
    }

    // Check if config file already exists
    if (await fs.pathExists(configPath)) {
      issues.push(`Config file already exists: ${configPath} (use --force to overwrite)`);
    }
  } else {
    issues.push(`Unknown editor: ${selections.editor}`);
  }

  // Check at least one MCP selected
  if (selections.mcps.length === 0) {
    issues.push('No MCP tools selected');
  }

  return issues;
}
