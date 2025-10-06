/**
 * File system utilities
 */

import fs from 'fs-extra';
import path from 'path';
import { getEditorConfigPath } from '../detectors/editor.js';
import type { SupportedEditor } from '../detectors/editor.js';

export async function writeConfigFile(
  config: any,
  editor: string,
  customPath?: string,
  force = false
): Promise<string> {
  const configPath = customPath || getEditorConfigPath(editor as SupportedEditor);

  if (!configPath) {
    throw new Error(`Cannot determine config path for editor: ${editor}`);
  }

  // Check if file exists
  if (!force && (await fs.pathExists(configPath))) {
    throw new Error(`Config file already exists: ${configPath}. Use --force to overwrite.`);
  }

  // Ensure directory exists
  await fs.ensureDir(path.dirname(configPath));

  // Write config file
  await fs.writeJSON(configPath, config, { spaces: 2 });

  return configPath;
}

export async function backupConfigFile(configPath: string): Promise<string | null> {
  if (!(await fs.pathExists(configPath))) {
    return null;
  }

  const backupPath = `${configPath}.backup.${Date.now()}`;
  await fs.copy(configPath, backupPath);

  return backupPath;
}
