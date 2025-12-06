# Troubleshooting Guide

Common issues and solutions.

## Build Issues

### Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or for Python
pip cache purge
pip install -r requirements.txt
```

### TypeScript errors after update
```bash
# Rebuild types
npm run build --clean
# or
rm -rf dist/ && npm run build
```

## Test Issues

### Tests timing out
- Check for unresolved promises
- Look for missing `await`
- Increase timeout if needed

### Flaky tests
- Check for shared state between tests
- Look for race conditions
- Add proper setup/teardown

## Git Issues

### Merge conflicts
```bash
# See conflicting files
git status

# Accept theirs or ours
git checkout --theirs <file>
git checkout --ours <file>

# Manual merge then
git add <file>
git commit
```

### Undo last commit (not pushed)
```bash
git reset --soft HEAD~1
```

## Debug Strategies

### Systematic approach
1. Reproduce the issue
2. Isolate the component
3. Check recent changes
4. Add logging/breakpoints
5. Binary search through commits

### Useful commands
```bash
# Find when bug was introduced
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>

# Search for string in history
git log -S "searchString" --oneline

# Blame specific lines
git blame -L 10,20 <file>
```

## Performance Issues

### Memory leaks
- Check for unclosed connections
- Look for growing arrays/caches
- Profile with Chrome DevTools or equivalent

### Slow queries
- Add indexes for WHERE clauses
- Use EXPLAIN ANALYZE
- Consider pagination

## Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| ECONNREFUSED | Service not running | Start the service |
| ENOENT | File not found | Check path |
| EPERM | Permission denied | Check file permissions |
| MODULE_NOT_FOUND | Missing dependency | npm install |
