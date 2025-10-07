import { describe, it, expect, vi } from 'vitest';

// Mock all external dependencies before importing wizard
vi.mock('inquirer', () => ({
  default: { prompt: vi.fn() }
}));

vi.mock('chalk', () => ({
  default: {
    bold: { cyan: vi.fn((s: string) => s) },
    gray: vi.fn((s: string) => s),
    green: vi.fn((s: string) => s),
    blue: vi.fn((s: string) => s),
    yellow: vi.fn((s: string) => s),
    red: vi.fn((s: string) => s),
    dim: vi.fn((s: string) => s)
  }
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn()
  }))
}));

vi.mock('execa', () => ({
  execa: vi.fn()
}));

vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readJSON: vi.fn(),
    writeJSON: vi.fn(),
    ensureDir: vi.fn()
  }
}));

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
