import { describe, it, expect } from 'vitest';
import { ArchitectureAnalyzer } from './analyzer.js';

describe('Architecture Analyzer', () => {
  it('should create analyzer instance', () => {
    const analyzer = new ArchitectureAnalyzer();
    expect(analyzer).toBeDefined();
  });

  it('should analyze project architecture', async () => {
    const analyzer = new ArchitectureAnalyzer();
    const result = await analyzer.analyzeArchitecture(process.cwd(), {
      detectCircular: true,
      generateGraph: false,
    });
    expect(result.modules).toBeDefined();
    expect(Array.isArray(result.modules)).toBe(true);
  });
});
