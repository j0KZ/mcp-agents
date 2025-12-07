/**
 * Tests for spinner utility
 */

import { describe, it, expect, vi } from 'vitest';
import { spinner } from '../src/utils/spinner.js';

// Mock ora
vi.mock('ora', () => {
  const mockSpinner = {
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    text: '',
  };
  return {
    default: vi.fn(() => mockSpinner),
  };
});

describe('spinner', () => {
  it('should create and start a spinner with text', async () => {
    const ora = (await import('ora')).default;

    const result = spinner('Loading...');

    expect(ora).toHaveBeenCalledWith('Loading...');
    expect(result.start).toHaveBeenCalled();
  });

  it('should return the spinner instance', async () => {
    const result = spinner('Processing');

    expect(result).toBeDefined();
    expect(typeof result.start).toBe('function');
    expect(typeof result.stop).toBe('function');
    expect(typeof result.succeed).toBe('function');
    expect(typeof result.fail).toBe('function');
  });

  it('should accept any text string', async () => {
    const ora = (await import('ora')).default;

    spinner('Installing packages...');
    expect(ora).toHaveBeenCalledWith('Installing packages...');

    spinner('Configuring settings...');
    expect(ora).toHaveBeenCalledWith('Configuring settings...');

    spinner('');
    expect(ora).toHaveBeenCalledWith('');
  });
});
