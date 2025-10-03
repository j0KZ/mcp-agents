# MCP Agents Performance Benchmarks

Performance benchmarking suite for all MCP tools.

## Quick Start

```bash
cd benchmarks
npm install
npm run bench
```

## Running Specific Benchmarks

```bash
# Test Generator
npm run bench:test-gen

# Refactor Assistant
npm run bench:refactor

# Security Scanner
npm run bench:security

# All benchmarks
npm run bench:all
```

## Performance Targets

### Test Generator
| File Size | Target | Description |
|-----------|--------|-------------|
| Small (100 lines) | >1000 ops/sec | Quick parsing |
| Medium (500 lines) | >200 ops/sec | Typical files |
| Large (2000 lines) | >50 ops/sec | Large modules |

### Refactor Assistant
| Operation | Target | Description |
|-----------|--------|-------------|
| Callback→Async | >100 ops/sec | Convert callbacks |
| Simplify Conditionals | >200 ops/sec | Guard clauses |
| Extract Function | >150 ops/sec | Code extraction |

### Security Scanner
| File Size | Target | Description |
|-----------|--------|-------------|
| Small | >500 ops/sec | Fast scanning |
| Medium | >100 ops/sec | Thorough check |
| Large | >25 ops/sec | Deep analysis |

## Results Format

```
🔬 Test Generator Benchmarks

Parse small file (100 lines) x 1,234 ops/sec ±1.23%
Parse medium file (500 lines) x 456 ops/sec ±2.34%
Parse large file (2000 lines) x 78 ops/sec ±3.45%

✅ Fastest: Parse small file (100 lines)

📊 Performance Analysis:
  Small files:  1234.56 ops/sec
  Medium files: 456.78 ops/sec
  Large files:  78.90 ops/sec

🎯 Target Comparison:
  Small:  ✅ (target: 1000 ops/sec)
  Medium: ✅ (target: 200 ops/sec)
  Large:  ✅ (target: 50 ops/sec)
```

## Memory Profiling

Run with memory profiling:

```bash
node --expose-gc --trace-gc bench.js
```

## CI Integration

Benchmarks run automatically on:
- Every push to main
- Pull requests
- Weekly scheduled runs

Results are tracked over time to detect performance regressions.

## Adding New Benchmarks

1. Create `benchmarks/<tool>/bench.js`
2. Add test cases with varying sizes
3. Set performance targets
4. Add to `run-benchmarks.js`

Example:
```javascript
import Benchmark from 'benchmark';

const suite = new Benchmark.Suite();

suite
  .add('Operation name', () => {
    // Code to benchmark
  })
  .on('cycle', (event) => {
    console.log(String(event.target));
  })
  .run({ async: true });
```

## Performance Tips

### Test Generator
- Use bounded quantifiers in regex
- Add input length limits
- Cache parsing results

### Refactor Assistant
- Process files in parallel
- Use streaming for large files
- Implement incremental updates

### Security Scanner
- Cache vulnerability patterns
- Skip unchanged files
- Parallel file scanning

## Historical Data

Performance trends tracked in `benchmarks/history/`:
- Daily snapshots
- Release comparisons
- Regression detection

## Contributing

When adding features:
1. Run benchmarks before changes
2. Run benchmarks after changes
3. Ensure no >10% regression
4. Update targets if needed

## License

MIT
