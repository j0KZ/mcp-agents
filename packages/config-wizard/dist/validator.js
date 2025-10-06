/**
 * Configuration validator
 */
import semver from 'semver';
import fs from 'fs-extra';
import path from 'path';
import { getEditorConfigPath } from './detectors/editor.js';
const MIN_NODE_MAJOR_VERSION = 18;
const MIN_NODE_MINOR_VERSION = 0;
const MIN_NODE_PATCH_VERSION = 0;
export async function validateConfig(selections, _detected) {
    const issues = [];
    // Check Node version
    const nodeVersion = process.version;
    const minVersion = `${MIN_NODE_MAJOR_VERSION}.${MIN_NODE_MINOR_VERSION}.${MIN_NODE_PATCH_VERSION}`;
    if (!semver.satisfies(nodeVersion, `>=${minVersion}`)) {
        issues.push(`Node.js ${MIN_NODE_MAJOR_VERSION}+ required (current: ${nodeVersion})`);
    }
    // Check if editor config path exists or can be created
    const configPath = getEditorConfigPath(selections.editor);
    if (configPath) {
        const configDir = path.dirname(configPath);
        try {
            await fs.ensureDir(configDir);
        }
        catch {
            issues.push(`Cannot create config directory: ${configDir}`);
        }
        // Check if config file already exists
        if (await fs.pathExists(configPath)) {
            issues.push(`Config file already exists: ${configPath} (use --force to overwrite)`);
        }
    }
    else {
        issues.push(`Unknown editor: ${selections.editor}`);
    }
    // Check at least one MCP selected
    if (selections.mcps.length === 0) {
        issues.push('No MCP tools selected');
    }
    return issues;
}
//# sourceMappingURL=validator.js.map