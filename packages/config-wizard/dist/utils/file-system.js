/**
 * File system utilities
 */
import fs from 'fs-extra';
import path from 'path';
import { getEditorConfigPath } from '../detectors/editor.js';
export async function writeConfigFile(config, editor, customPath, force = false) {
    const configPath = customPath || getEditorConfigPath(editor);
    if (!configPath) {
        throw new Error(`Cannot determine config path for editor: ${editor}`);
    }
    // Check if file exists
    if (!force && await fs.pathExists(configPath)) {
        throw new Error(`Config file already exists: ${configPath}. Use --force to overwrite.`);
    }
    // Ensure directory exists
    await fs.ensureDir(path.dirname(configPath));
    // Write config file
    await fs.writeJSON(configPath, config, { spaces: 2 });
    return configPath;
}
export async function backupConfigFile(configPath) {
    if (!await fs.pathExists(configPath)) {
        return null;
    }
    const backupPath = `${configPath}.backup.${Date.now()}`;
    await fs.copy(configPath, backupPath);
    return backupPath;
}
//# sourceMappingURL=file-system.js.map