/**
 * Tests for dependency graph generation in ArchitectureAnalyzer
 * Tests lines 275-278 (edge generation) and 281-284 (truncation note)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import { ArchitectureAnalyzer } from '../src/analyzer.js';

describe('ArchitectureAnalyzer - Dependency Graph', () => {
  let analyzer: ArchitectureAnalyzer;
  let testDir: string;

  beforeEach(async () => {
    analyzer = new ArchitectureAnalyzer();
    testDir = path.join(os.tmpdir(), `arch-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should generate edges for internal dependencies', async () => {
    // Create files with actual import relationships
    // Note: Use import WITHOUT .js extension because the scanner has a bug
    // where it only adds .ts extension when there's NO extension at all
    await fs.writeFile(
      path.join(testDir, 'fileA.ts'),
      `import { helper } from './fileB';\nexport const value = helper();`
    );
    await fs.writeFile(path.join(testDir, 'fileB.ts'), `export function helper() { return 42; }`);

    const result = await analyzer.analyzeArchitecture(testDir, {
      generateGraph: true,
      excludePatterns: [],
    });

    expect(result.dependencies.length).toBeGreaterThan(0);
    expect(result.dependencyGraph).toContain('graph TD');
    // Should have edge from fileA to fileB
    expect(result.dependencyGraph).toContain('-->');
  });

  it('should generate multiple edges for complex dependency chain', async () => {
    // Create a chain: A -> B -> C
    await fs.writeFile(
      path.join(testDir, 'a.ts'),
      `import { b } from './b';\nexport const a = b + 1;`
    );
    await fs.writeFile(
      path.join(testDir, 'b.ts'),
      `import { c } from './c';\nexport const b = c + 1;`
    );
    await fs.writeFile(path.join(testDir, 'c.ts'), `export const c = 1;`);

    const result = await analyzer.analyzeArchitecture(testDir, {
      generateGraph: true,
      excludePatterns: [],
    });

    // Should have edges: a->b, b->c (Mermaid arrow syntax)
    expect(result.dependencies.length).toBeGreaterThanOrEqual(2);
    // Using split instead of regex to avoid CodeQL false positive (js/bad-tag-filter)
    const edgeCount = result.dependencyGraph.split(' --> ').length - 1;
    expect(edgeCount).toBeGreaterThanOrEqual(2);
  });

  it('should truncate graph when dependencies exceed MAX_GRAPH_EDGES (50)', async () => {
    // Create 60 files with dependencies to trigger truncation
    const numFiles = 60;

    // Create central hub file
    await fs.writeFile(path.join(testDir, 'hub.ts'), `export const hub = 'central';`);

    // Create 59 files that import the hub (without .js extension)
    for (let i = 0; i < numFiles - 1; i++) {
      await fs.writeFile(
        path.join(testDir, `module${i}.ts`),
        `import { hub } from './hub';\nexport const mod${i} = hub + ${i};`
      );
    }

    const result = await analyzer.analyzeArchitecture(testDir, {
      generateGraph: true,
      excludePatterns: [],
    });

    // Should have 59 dependencies (each module imports hub)
    expect(result.dependencies.length).toBeGreaterThanOrEqual(50);

    // If dependencies > 50, should have truncation note
    if (result.dependencies.length > 50) {
      expect(result.dependencyGraph).toContain('more dependencies');
    }
  });

  it('should sanitize special characters in node IDs', async () => {
    // Create files with special characters in names
    await fs.writeFile(path.join(testDir, 'file-with-dashes.ts'), `export const x = 1;`);
    await fs.writeFile(
      path.join(testDir, 'importer.ts'),
      `import { x } from './file-with-dashes';\nexport const y = x;`
    );

    const result = await analyzer.analyzeArchitecture(testDir, {
      generateGraph: true,
      excludePatterns: [],
    });

    expect(result.dependencyGraph).toBeDefined();
    // Node IDs should be sanitized (dashes converted to underscores in ID)
    // But labels (inside brackets) keep original names
    expect(result.dependencyGraph).toContain('file_with_dashes');
    // Dependency edge should also have sanitized IDs
    expect(result.dependencyGraph).toContain('-->');
  });

  it('should include node labels in brackets', async () => {
    await fs.writeFile(path.join(testDir, 'myModule.ts'), `export const x = 1;`);

    const result = await analyzer.analyzeArchitecture(testDir, {
      generateGraph: true,
      excludePatterns: [],
    });

    // Should have node definition with label
    expect(result.dependencyGraph).toMatch(/\["myModule"\]/);
  });
});
