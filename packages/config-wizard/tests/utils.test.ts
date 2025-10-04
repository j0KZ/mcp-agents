/**
 * Tests for utility modules
 */

import { describe, it, expect } from 'vitest';
import { parseArgs } from '../src/utils/args.js';

describe('Argument Parser', () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should parse --help flag', () => {
    process.argv = ['node', 'script.js', '--help'];
    const args = parseArgs();
    expect(args.help).toBe(true);
  });

  it('should parse --version flag', () => {
    process.argv = ['node', 'script.js', '--version'];
    const args = parseArgs();
    expect(args.version).toBe(true);
  });

  it('should parse --dry-run flag', () => {
    process.argv = ['node', 'script.js', '--dry-run'];
    const args = parseArgs();
    expect(args.dryRun).toBe(true);
  });

  it('should parse --force flag', () => {
    process.argv = ['node', 'script.js', '--force'];
    const args = parseArgs();
    expect(args.force).toBe(true);
  });

  it('should parse --verbose flag', () => {
    process.argv = ['node', 'script.js', '--verbose'];
    const args = parseArgs();
    expect(args.verbose).toBe(true);
  });

  it('should parse --editor with value', () => {
    process.argv = ['node', 'script.js', '--editor', 'claude-code'];
    const args = parseArgs();
    expect(args.editor).toBe('claude-code');
  });

  it('should parse --mcps with value', () => {
    process.argv = ['node', 'script.js', '--mcps', 'smart-reviewer,security-scanner'];
    const args = parseArgs();
    expect(args.mcps).toBe('smart-reviewer,security-scanner');
  });

  it('should parse --output with value', () => {
    process.argv = ['node', 'script.js', '--output', '/custom/path.json'];
    const args = parseArgs();
    expect(args.output).toBe('/custom/path.json');
  });

  it('should parse multiple flags together', () => {
    process.argv = [
      'node', 'script.js',
      '--editor', 'cursor',
      '--mcps', 'smart-reviewer',
      '--force',
      '--verbose'
    ];
    const args = parseArgs();

    expect(args.editor).toBe('cursor');
    expect(args.mcps).toBe('smart-reviewer');
    expect(args.force).toBe(true);
    expect(args.verbose).toBe(true);
  });

  it('should handle -h as alias for --help', () => {
    process.argv = ['node', 'script.js', '-h'];
    const args = parseArgs();
    expect(args.help).toBe(true);
  });

  it('should handle -v as alias for --version', () => {
    process.argv = ['node', 'script.js', '-v'];
    const args = parseArgs();
    expect(args.version).toBe(true);
  });
});
