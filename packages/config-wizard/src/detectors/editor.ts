/**
 * Detect installed editors
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { execa } from 'execa';

export type SupportedEditor =
  | 'claude-code'
  | 'cursor'
  | 'windsurf'
  | 'vscode'
  | 'roo'
  | 'qoder'
  | null;

export async function detectEditor(): Promise<SupportedEditor> {
  const detectors = [
    detectClaudeCode,
    detectCursor,
    detectWindsurf,
    detectVSCode,
    detectRooCode,
    detectQoder,
  ];

  for (const detect of detectors) {
    const editor = await detect();
    if (editor) return editor;
  }

  return null;
}

export async function detectInstalledEditors(): Promise<SupportedEditor[]> {
  const editors: SupportedEditor[] = [];

  if (await detectClaudeCode()) editors.push('claude-code');
  if (await detectCursor()) editors.push('cursor');
  if (await detectWindsurf()) editors.push('windsurf');
  if (await detectVSCode()) editors.push('vscode');
  if (await detectRooCode()) editors.push('roo');
  if (await detectQoder()) editors.push('qoder');

  return editors;
}

async function detectClaudeCode(): Promise<SupportedEditor> {
  const configPaths = [
    path.join(os.homedir(), '.config', 'claude-code', 'mcp_settings.json'),
    path.join(os.homedir(), '.claude-code', 'mcp_settings.json'),
  ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(path.dirname(configPath))) {
      return 'claude-code';
    }
  }

  // Check if claude command exists
  try {
    await execa('claude', ['--version']);
    return 'claude-code';
  } catch {
    // Not found
  }

  return null;
}

async function detectCursor(): Promise<SupportedEditor> {
  const configPaths =
    process.platform === 'win32'
      ? [path.join(process.env.APPDATA || '', 'Cursor', 'User', 'mcp_config.json')]
      : [
          path.join(os.homedir(), '.cursor', 'mcp_config.json'),
          path.join(
            os.homedir(),
            'Library',
            'Application Support',
            'Cursor',
            'User',
            'mcp_config.json'
          ),
        ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(path.dirname(configPath))) {
      return 'cursor';
    }
  }

  // Check if cursor command exists
  try {
    await execa('cursor', ['--version']);
    return 'cursor';
  } catch {
    // Not found
  }

  return null;
}

async function detectWindsurf(): Promise<SupportedEditor> {
  const configPaths =
    process.platform === 'win32'
      ? [path.join(process.env.APPDATA || '', 'Windsurf', 'User', 'mcp_config.json')]
      : [
          path.join(os.homedir(), '.windsurf', 'mcp_config.json'),
          path.join(
            os.homedir(),
            'Library',
            'Application Support',
            'Windsurf',
            'User',
            'mcp_config.json'
          ),
        ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(path.dirname(configPath))) {
      return 'windsurf';
    }
  }

  return null;
}

async function detectVSCode(): Promise<SupportedEditor> {
  const configPaths =
    process.platform === 'win32'
      ? [path.join(process.env.APPDATA || '', 'Code', 'User', 'settings.json')]
      : [
          path.join(os.homedir(), '.config', 'Code', 'User', 'settings.json'),
          path.join(
            os.homedir(),
            'Library',
            'Application Support',
            'Code',
            'User',
            'settings.json'
          ),
        ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(configPath)) {
      // Check if Continue extension is installed
      const settings = await fs.readJSON(configPath).catch(() => ({}));
      if (settings.mcp || settings['continue.enableMCP']) {
        return 'vscode';
      }
    }
  }

  // Check if code command exists
  try {
    await execa('code', ['--version']);
    return 'vscode';
  } catch {
    // Not found
  }

  return null;
}

async function detectRooCode(): Promise<SupportedEditor> {
  // Check if roo command exists
  try {
    await execa('roo', ['--version']);
    return 'roo';
  } catch {
    // Not found
  }

  return null;
}

async function detectQoder(): Promise<SupportedEditor> {
  const configPaths =
    process.platform === 'win32'
      ? [
          path.join(process.env.APPDATA || '', 'Qoder', 'mcp-config.json'),
          path.join(process.env.LOCALAPPDATA || '', 'Qoder', 'mcp-config.json'),
        ]
      : process.platform === 'darwin'
        ? [
            path.join(os.homedir(), 'Library', 'Application Support', 'Qoder', 'mcp-config.json'),
            path.join(os.homedir(), '.qoder', 'mcp-config.json'),
          ]
        : [
            path.join(os.homedir(), '.qoder', 'mcp-config.json'),
            path.join(os.homedir(), '.config', 'qoder', 'mcp-config.json'),
          ];

  for (const configPath of configPaths) {
    if (await fs.pathExists(path.dirname(configPath))) {
      return 'qoder';
    }
  }

  // Check if qoder command exists
  try {
    await execa('qoder', ['--version']);
    return 'qoder';
  } catch {
    // Not found
  }

  return null;
}

export function getEditorConfigPath(editor: SupportedEditor): string | null {
  if (!editor) return null;

  const home = os.homedir();
  const appData = process.env.APPDATA || '';

  const paths: Record<string, string> = {
    'claude-code': path.join(home, '.config', 'claude-code', 'mcp_settings.json'),
    cursor:
      process.platform === 'win32'
        ? path.join(appData, 'Cursor', 'User', 'mcp_config.json')
        : path.join(home, '.cursor', 'mcp_config.json'),
    windsurf:
      process.platform === 'win32'
        ? path.join(appData, 'Windsurf', 'User', 'mcp_config.json')
        : path.join(home, '.windsurf', 'mcp_config.json'),
    vscode: path.join(home, '.continue', 'config.json'),
    roo: path.join(home, '.roo', 'mcp_config.json'),
    qoder:
      process.platform === 'win32'
        ? path.join(appData, 'Qoder', 'mcp-config.json')
        : process.platform === 'darwin'
          ? path.join(home, 'Library', 'Application Support', 'Qoder', 'mcp-config.json')
          : path.join(home, '.qoder', 'mcp-config.json'),
  };

  return paths[editor] || null;
}
