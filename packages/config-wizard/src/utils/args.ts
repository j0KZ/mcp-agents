/**
 * Command-line argument parsing
 */

import { WizardArgs } from '../wizard.js';

export function parseArgs(): WizardArgs {
  const args = process.argv.slice(2);
  const parsed: WizardArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--version' || arg === '-v') {
      parsed.version = true;
    } else if (arg === '--dry-run') {
      parsed.dryRun = true;
    } else if (arg === '--force') {
      parsed.force = true;
    } else if (arg === '--verbose') {
      parsed.verbose = true;
    } else if (arg === '--editor' && args[i + 1]) {
      parsed.editor = args[++i];
    } else if (arg === '--mcps' && args[i + 1]) {
      parsed.mcps = args[++i];
    } else if (arg === '--output' && args[i + 1]) {
      parsed.output = args[++i];
    }
  }

  return parsed;
}
