/**
 * Detectors index
 */

export {
  detectEditor,
  detectInstalledEditors,
  getEditorConfigPath,
  type SupportedEditor,
} from './editor.js';
export { detectProject, getRecommendedMCPs, type ProjectInfo } from './project.js';
export { detectTestFramework, type TestFramework } from './test-framework.js';
