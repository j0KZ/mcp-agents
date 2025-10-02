/**
 * Example 3: Using caching to speed up repeated analyses
 *
 * This example shows how to use FileCache and AnalysisCache to avoid
 * redundant file reads and expensive computations.
 */

import { FileCache, AnalysisCache } from '../src/cache/index.js';
import { FileSystemManager } from '../src/fs/index.js';
import { measure } from '../src/performance/index.js';
import { generateHash } from '../src/utils/index.js';

interface CodeComplexity {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  maintainability: number;
}

// Expensive analysis function
async function analyzeComplexity(code: string): Promise<CodeComplexity> {
  // Simulate expensive computation
  await new Promise(resolve => setTimeout(resolve, 100));

  const lines = code.split('\n');
  const cyclomaticComplexity = lines.filter(l => /if|while|for|switch/.test(l)).length;
  const cognitiveComplexity = cyclomaticComplexity * 1.5;
  const maintainability = Math.max(0, 100 - cyclomaticComplexity * 2);

  return { cyclomaticComplexity, cognitiveComplexity, maintainability };
}

async function demonstrateCaching() {
  const fsManager = new FileSystemManager(100); // 100-file cache
  const analysisCache = new AnalysisCache(50, 1800000); // 50 entries, 30min TTL

  const filePath = './packages/smart-reviewer/src/reviewer.ts';

  console.log('🚀 Demonstrating caching benefits\n');

  // First run - no cache
  console.log('📖 First analysis (cold cache):');
  const firstRun = await measure(async () => {
    const content = await fsManager.readFile(filePath, true);
    const fileHash = generateHash(content);

    // Check cache
    const cached = analysisCache.get(filePath, 'complexity', fileHash);
    if (cached) {
      console.log('  ✨ Cache hit!');
      return cached;
    }

    console.log('  ⏳ Cache miss - analyzing...');
    const result = await analyzeComplexity(content);
    analysisCache.set(filePath, 'complexity', fileHash, result);
    return result;
  });

  console.log(`  Result:`, firstRun.result);
  console.log(`  Duration: ${firstRun.duration}ms\n`);

  // Second run - with cache
  console.log('📖 Second analysis (warm cache):');
  const secondRun = await measure(async () => {
    const content = await fsManager.readFile(filePath, true);
    const fileHash = generateHash(content);

    const cached = analysisCache.get(filePath, 'complexity', fileHash);
    if (cached) {
      console.log('  ✨ Cache hit!');
      return cached;
    }

    console.log('  ⏳ Cache miss - analyzing...');
    const result = await analyzeComplexity(content);
    analysisCache.set(filePath, 'complexity', fileHash, result);
    return result;
  });

  console.log(`  Result:`, secondRun.result);
  console.log(`  Duration: ${secondRun.duration}ms\n`);

  // Performance improvement
  const improvement = ((firstRun.duration - secondRun.duration) / firstRun.duration) * 100;
  console.log(`⚡ Performance improvement: ${improvement.toFixed(1)}%`);

  // Cache statistics
  console.log('\n📊 Cache Statistics:');
  console.log('File Cache:', fsManager.getCacheStats().fileCache);
  console.log('Analysis Cache:', analysisCache.getStats());

  // Batch operations with caching
  console.log('\n\n🔄 Demonstrating batch operations with caching:');
  const files = await fsManager.findFiles('**/*.ts', {
    cwd: './packages/smart-reviewer/src',
    ignore: ['node_modules/**', 'dist/**'],
  });

  console.log(`Found ${files.length} files`);

  const batchStart = Date.now();
  const contents = await fsManager.readFiles(files.slice(0, 5), {
    useCache: true,
    concurrency: 3,
  });
  const batchDuration = Date.now() - batchStart;

  console.log(`Loaded ${contents.size} files in ${batchDuration}ms`);

  // Second batch read (should be much faster)
  const batchStart2 = Date.now();
  const contents2 = await fsManager.readFiles(files.slice(0, 5), {
    useCache: true,
    concurrency: 3,
  });
  const batchDuration2 = Date.now() - batchStart2;

  console.log(`Re-loaded ${contents2.size} files in ${batchDuration2}ms (cached)`);
  console.log(`⚡ Batch improvement: ${(((batchDuration - batchDuration2) / batchDuration) * 100).toFixed(1)}%`);

  // Final cache stats
  console.log('\n📊 Final Cache Statistics:');
  const finalStats = fsManager.getCacheStats().fileCache;
  console.log(`  Cache size: ${finalStats.size}/${finalStats.maxSize}`);
  console.log(`  Hit rate: ${finalStats.hitRate.toFixed(1)}%`);
  console.log(`  Total hits: ${finalStats.hits}`);
  console.log(`  Total misses: ${finalStats.misses}`);
}

// Run example
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateCaching()
    .then(() => console.log('\n✅ Caching demonstration completed'))
    .catch(err => console.error('❌ Demo failed:', err));
}
