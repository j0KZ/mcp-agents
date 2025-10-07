import { describe, it, expect } from 'vitest';
import { runWizard, gatherSelections } from '../src/wizard.js';

describe('Wizard exports', () => {
  it('should export runWizard function', () => {
    expect(runWizard).toBeDefined();
    expect(typeof runWizard).toBe('function');
  });

  it('should export gatherSelections function', () => {
    expect(gatherSelections).toBeDefined();
    expect(typeof gatherSelections).toBe('function');
  });
});
