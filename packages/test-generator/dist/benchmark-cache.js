/**
 * Performance benchmark for AST parsing cache
 * Run with: node dist/benchmark-cache.js
 */
import { ASTParser } from './ast-parser.js';
import { AnalysisCache } from '@j0kz/shared';
const sampleCode = `
import { Something } from 'somewhere';

export class UserService {
  constructor(private db: Database) {}

  async getUser(id: number): Promise<User> {
    const user = await this.db.findOne({ id });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const existing = await this.db.findOne({ email: data.email });
    if (existing) {
      throw new Error('User already exists');
    }
    return this.db.create(data);
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.getUser(id);
    return this.db.update({ id }, data);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.getUser(id);
    await this.db.delete({ id });
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^ 	@]{1,64}@[^ 	@]{1,253}.[^ 	@]{2,24}$/;
  return emailRegex.test(email);
}

export function hashPassword(password: string): string {
  // Simplified for demo
  return btoa(password);
}
`;
function benchmark() {
    console.log('AST Parsing Cache Performance Benchmark\n');
    console.log('='.repeat(60));
    // Test 1: Without cache
    console.log('\n1. WITHOUT CACHE (10 parses):');
    const uncachedParser = new ASTParser();
    const uncachedStart = performance.now();
    for (let i = 0; i < 10; i++) {
        uncachedParser.parseCode(sampleCode, 'test.ts');
    }
    const uncachedTime = performance.now() - uncachedStart;
    console.log(`   Total time: ${uncachedTime.toFixed(2)}ms`);
    console.log(`   Average per parse: ${(uncachedTime / 10).toFixed(2)}ms`);
    // Test 2: With cache (should hit cache after first parse)
    console.log('\n2. WITH CACHE (10 parses):');
    const cache = new AnalysisCache();
    const cachedParser = new ASTParser(cache);
    const cachedStart = performance.now();
    for (let i = 0; i < 10; i++) {
        cachedParser.parseCode(sampleCode, 'test.ts');
    }
    const cachedTime = performance.now() - cachedStart;
    console.log(`   Total time: ${cachedTime.toFixed(2)}ms`);
    console.log(`   Average per parse: ${(cachedTime / 10).toFixed(2)}ms`);
    const stats = cache.getStats();
    console.log(`   Cache hits: ${stats.hits}`);
    console.log(`   Cache misses: ${stats.misses}`);
    console.log(`   Hit rate: ${stats.hitRate.toFixed(2)}%`);
    // Calculate improvement
    console.log('\n3. PERFORMANCE IMPROVEMENT:');
    const speedup = ((uncachedTime / cachedTime) * 100).toFixed(1);
    const timeSaved = uncachedTime - cachedTime;
    console.log(`   Speedup: ${speedup}% faster with cache`);
    console.log(`   Time saved: ${timeSaved.toFixed(2)}ms`);
    console.log(`   Reduction: ${((timeSaved / uncachedTime) * 100).toFixed(1)}% less time`);
    console.log('\n' + '='.repeat(60));
    console.log('\nConclusion:');
    console.log(`  ✓ Caching reduces parsing time by ~${((timeSaved / uncachedTime) * 100).toFixed(0)}%`);
    console.log(`  ✓ Cache hit rate: ${stats.hitRate.toFixed(0)}%`);
    console.log(`  ✓ Average speedup: ${speedup}%\n`);
}
benchmark();
//# sourceMappingURL=benchmark-cache.js.map