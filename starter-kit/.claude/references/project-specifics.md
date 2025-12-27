# Project-Specific Reference

**Customize this file with your project's specific commands, structure, and conventions**

---

## Project Overview

<!-- CUSTOMIZE THIS SECTION -->

**Project Name:** [Your Project Name]
**Language:** [Primary Language]
**Framework:** [Framework/Library]
**Architecture:** [e.g., Monorepo, Microservices, Monolith]

**Purpose:** [Brief description of what this project does]

---

## Development Commands

<!-- CUSTOMIZE: Add your actual commands -->

### Build
```bash
npm run build              # or: make build, cargo build, mvn package, etc.
```

### Test
```bash
npm test                   # or: pytest, go test, cargo test, etc.
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Lint & Format
```bash
npm run lint               # or: flake8, golint, rubocop, etc.
npm run format             # or: prettier, black, gofmt, etc.
```

### Development Server
```bash
npm run dev                # or: python manage.py runserver, cargo run, etc.
```

### Database
```bash
npm run db:migrate         # Run migrations
npm run db:seed            # Seed database
npm run db:reset           # Reset database
```

---

## Project Structure

<!-- CUSTOMIZE: Describe your actual structure -->

```
project-root/
├── src/                   # Main source code
│   ├── components/        # [Component description]
│   ├── services/          # [Service description]
│   └── utils/             # [Utility description]
├── tests/                 # Test files
├── docs/                  # Documentation
├── scripts/               # Build/automation scripts
└── config/                # Configuration files
```

---

## Code Organization Patterns

<!-- CUSTOMIZE: Add your patterns -->

### Module Pattern
[Describe how modules are organized]

### File Naming
- Components: [naming convention]
- Services: [naming convention]
- Tests: [naming convention]
- Utilities: [naming convention]

### Import Order
1. [External dependencies]
2. [Internal modules]
3. [Types/interfaces]
4. [Styles/assets]

---

## Conventions & Standards

### Naming Conventions
- **Files:** [e.g., kebab-case, snake_case, PascalCase]
- **Functions:** [e.g., camelCase, snake_case]
- **Classes:** [e.g., PascalCase]
- **Constants:** [e.g., UPPER_SNAKE_CASE]
- **Variables:** [e.g., camelCase, snake_case]

### Git Commit Messages
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: [your scopes]

Example:
feat(auth): add OAuth2 login
fix(api): handle 429 rate limit errors
```

### Code Style
- **Indentation:** [spaces/tabs, size]
- **Line length:** [max characters]
- **Quotes:** [single/double]
- **Semicolons:** [yes/no]

---

## Testing Standards

### Coverage Targets
- **Overall:** [e.g., >80%]
- **New code:** [e.g., >90%]
- **Critical paths:** [e.g., 100%]

### Test Organization
- **Unit tests:** [location/pattern]
- **Integration tests:** [location/pattern]
- **E2E tests:** [location/pattern]

### Test Naming
```
[Pattern description]

Examples:
- test_user_login_with_valid_credentials
- it('should validate email format')
- describe('UserService', () => { ... })
```

---

## Common Utilities

<!-- CUSTOMIZE: List your common utilities -->

### File Operations
- [Utility name]: [Description]

### Data Processing
- [Utility name]: [Description]

### Validation
- [Utility name]: [Description]

### API Helpers
- [Utility name]: [Description]

---

## Environment Variables

<!-- CUSTOMIZE: List your environment variables -->

```bash
# Required
[VAR_NAME]=                # [Description]

# Optional
[VAR_NAME]=                # [Description] (default: [value])
```

---

## Dependencies

### Core Dependencies
- **[Package name]:** [Purpose]
- **[Package name]:** [Purpose]

### Dev Dependencies
- **[Package name]:** [Purpose]
- **[Package name]:** [Purpose]

---

## Deployment

<!-- CUSTOMIZE: Add deployment info -->

### Environments
- **Development:** [URL/details]
- **Staging:** [URL/details]
- **Production:** [URL/details]

### Deployment Commands
```bash
[deploy command]           # Deploy to production
[deploy command --staging] # Deploy to staging
```

### CI/CD
- **Platform:** [e.g., GitHub Actions, GitLab CI, Jenkins]
- **Pipeline:** [Brief description]

---

## Troubleshooting

### Common Issues

#### Issue 1: [Problem description]
**Solution:** [Steps to fix]

#### Issue 2: [Problem description]
**Solution:** [Steps to fix]

### Debug Mode
```bash
[command to run in debug mode]
```

### Logs
- **Location:** [log file location]
- **Levels:** [log levels used]

---

## Additional Resources

- **Documentation:** [link to docs]
- **API Reference:** [link to API docs]
- **Wiki:** [link to wiki]
- **Slack/Discord:** [team communication channel]

---

## Notes

<!-- Add any project-specific notes, gotchas, or important information -->

- [Note 1]
- [Note 2]
- [Note 3]
