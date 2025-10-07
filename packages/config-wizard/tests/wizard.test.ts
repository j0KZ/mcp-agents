import { describe, it, expect } from 'vitest';
import * as target from '../src/wizard.js';

describe('Wizard exports', () => {
  it('should export runWizard function', () => {
    expect(target.runWizard).toBeDefined();
    expect(typeof target.runWizard).toBe('function');
  });

  it('should export gatherSelections function', () => {
    expect(target.gatherSelections).toBeDefined();
    expect(typeof target.gatherSelections).toBe('function');
  });
});
