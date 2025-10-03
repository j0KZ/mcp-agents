// Benchmark for Test Generator parsing performance
import Benchmark from 'benchmark';
import { readFileSync } from 'fs';
import { CodeParser } from '../../packages/test-generator/dist/parser.js';

const suite = new Benchmark.Suite();
const parser = new CodeParser();

// Test data of varying sizes
const smallCode = readFileSync('../test-data/small.js', 'utf8');      // 100 lines
const mediumCode = readFileSync('../test-data/medium.js', 'utf8');    // 500 lines
const largeCode = readFileSync('../test-data/large.js', 'utf8');      // 2000 lines

console.log('🔬 Test Generator Benchmarks\n');

suite
  .add('Parse small file (100 lines)', () => {
    parser.parseCode(smallCode);
  })
  .add('Parse medium file (500 lines)', () => {
    parser.parseCode(mediumCode);
  })
  .add('Parse large file (2000 lines)', () => {
    parser.parseCode(largeCode);
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('\n✅ Fastest: ' + this.filter('fastest').map('name'));

    // Performance targets
    const smallOpsPerSec = this[0].hz;
    const mediumOpsPerSec = this[1].hz;
    const largeOpsPerSec = this[2].hz;

    console.log('\n📊 Performance Analysis:');
    console.log(`  Small files:  ${smallOpsPerSec.toFixed(2)} ops/sec`);
    console.log(`  Medium files: ${mediumOpsPerSec.toFixed(2)} ops/sec`);
    console.log(`  Large files:  ${largeOpsPerSec.toFixed(2)} ops/sec`);

    // Check against targets
    const targets = {
      small: 1000,   // Should parse > 1000 small files/sec
      medium: 200,   // Should parse > 200 medium files/sec
      large: 50      // Should parse > 50 large files/sec
    };

    console.log('\n🎯 Target Comparison:');
    console.log(`  Small:  ${smallOpsPerSec >= targets.small ? '✅' : '❌'} (target: ${targets.small} ops/sec)`);
    console.log(`  Medium: ${mediumOpsPerSec >= targets.medium ? '✅' : '❌'} (target: ${targets.medium} ops/sec)`);
    console.log(`  Large:  ${largeOpsPerSec >= targets.large ? '✅' : '❌'} (target: ${targets.large} ops/sec)`);
  })
  .run({ async: true });
