/**
 * Domain Knowledge Base
 * Phase 2.3 of Master Evolution Plan
 *
 * This module contains deep knowledge about common frameworks, patterns,
 * best practices, and domain-specific conventions that MCPs can leverage
 * to make expert-level decisions.
 */
import { EventEmitter } from 'events';
export class DomainKnowledgeBase extends EventEmitter {
    frameworks = new Map();
    domains = new Map();
    patterns = new Map();
    messageBus;
    constructor(messageBus) {
        super();
        this.messageBus = messageBus;
        this.initializeKnowledge();
    }
    /**
     * Initialize with comprehensive framework and domain knowledge
     */
    initializeKnowledge() {
        // React Knowledge
        this.frameworks.set('react', {
            name: 'React',
            category: 'frontend',
            patterns: [
                {
                    name: 'Container/Presentational Components',
                    description: 'Separate data logic from presentation',
                    when: 'Need clear separation of concerns',
                    implementation: 'Container handles state/logic, Presentational handles UI',
                    example: 'UserContainer fetches data, UserList displays it',
                    antiPattern: 'Mixing data fetching with rendering in one component'
                },
                {
                    name: 'Custom Hooks',
                    description: 'Extract component logic into reusable functions',
                    when: 'Logic needs to be shared between multiple components',
                    implementation: 'Create hook with use prefix, return state and handlers',
                    example: 'useAuth, useDebounce, useFetch'
                },
                {
                    name: 'Compound Components',
                    description: 'Components that work together to form a complete UI',
                    when: 'Building flexible, composable interfaces',
                    implementation: 'Parent provides context, children consume it',
                    example: '<Select><Select.Option /></Select>'
                }
            ],
            conventions: [
                {
                    aspect: 'File Naming',
                    standard: 'PascalCase for components, camelCase for utils',
                    reasoning: 'Distinguishes components from regular functions',
                    example: 'UserProfile.tsx, formatDate.ts'
                },
                {
                    aspect: 'Component Structure',
                    standard: 'Props interface, component, export',
                    reasoning: 'Consistent structure improves readability',
                    example: 'interface Props {}\nconst Component: FC<Props> = () => {}\nexport default Component'
                }
            ],
            pitfalls: [
                {
                    issue: 'Using array index as key',
                    symptoms: ['Incorrect rendering after reorder', 'Lost component state'],
                    solution: 'Use stable, unique IDs as keys',
                    severity: 'high'
                },
                {
                    issue: 'Direct state mutation',
                    symptoms: ['Component not re-rendering', 'Stale data displayed'],
                    solution: 'Always create new objects/arrays when updating state',
                    severity: 'high'
                },
                {
                    issue: 'useEffect without dependencies',
                    symptoms: ['Infinite loops', 'Performance issues'],
                    solution: 'Always specify dependency array',
                    severity: 'critical'
                }
            ],
            bestPractices: [
                {
                    category: 'State Management',
                    practice: 'Lift state up to common ancestor',
                    reasoning: 'Prevents prop drilling and keeps state centralized',
                    implementation: 'Move shared state to parent component',
                    impact: 'maintainability'
                },
                {
                    category: 'Performance',
                    practice: 'Memoize expensive computations',
                    reasoning: 'Avoid recalculation on every render',
                    implementation: 'Use useMemo for values, useCallback for functions',
                    impact: 'performance'
                }
            ],
            performance: [
                {
                    operation: 'List rendering',
                    optimization: 'Use React.memo and key prop',
                    improvement: '50-70% faster for large lists',
                    tradeoff: 'Slightly more memory usage'
                },
                {
                    operation: 'Context updates',
                    optimization: 'Split contexts by update frequency',
                    improvement: 'Reduces unnecessary re-renders by 80%',
                    tradeoff: 'More complex setup'
                }
            ],
            security: [
                {
                    threat: 'XSS attacks',
                    vulnerability: 'dangerouslySetInnerHTML with user input',
                    mitigation: 'Sanitize HTML or use text content',
                    owaspCategory: 'A03:2021 - Injection'
                }
            ]
        });
        // Node.js/Express Knowledge
        this.frameworks.set('express', {
            name: 'Express',
            category: 'backend',
            patterns: [
                {
                    name: 'Middleware Pipeline',
                    description: 'Chain of responsibility for request processing',
                    when: 'Need modular request handling',
                    implementation: 'app.use() with next() calls',
                    example: 'auth -> validation -> controller -> error handler'
                },
                {
                    name: 'Router Separation',
                    description: 'Organize routes in separate modules',
                    when: 'Application has multiple route groups',
                    implementation: 'Create router instances, mount on app',
                    example: 'userRouter, productRouter, authRouter'
                }
            ],
            conventions: [
                {
                    aspect: 'Error Handling',
                    standard: 'Centralized error middleware',
                    reasoning: 'Consistent error responses',
                    example: 'app.use((err, req, res, next) => {...})'
                },
                {
                    aspect: 'Route Naming',
                    standard: 'RESTful conventions with plural nouns',
                    reasoning: 'Predictable API structure',
                    example: '/api/users, /api/products/:id'
                }
            ],
            pitfalls: [
                {
                    issue: 'Synchronous operations blocking event loop',
                    symptoms: ['Poor performance', 'Request timeouts'],
                    solution: 'Use async/await or promises',
                    severity: 'high'
                },
                {
                    issue: 'Missing error handling in async routes',
                    symptoms: ['Unhandled promise rejections', 'Server crashes'],
                    solution: 'Wrap async handlers with error catcher',
                    severity: 'critical'
                }
            ],
            bestPractices: [
                {
                    category: 'Security',
                    practice: 'Use helmet for security headers',
                    reasoning: 'Protects against common vulnerabilities',
                    implementation: "app.use(helmet())",
                    impact: 'security'
                },
                {
                    category: 'Performance',
                    practice: 'Enable gzip compression',
                    reasoning: 'Reduces response size by 70%',
                    implementation: "app.use(compression())",
                    impact: 'performance'
                }
            ],
            performance: [
                {
                    operation: 'Database queries',
                    optimization: 'Use connection pooling',
                    improvement: '10x throughput increase',
                    tradeoff: 'More memory usage'
                }
            ],
            security: [
                {
                    threat: 'SQL Injection',
                    vulnerability: 'String concatenation in queries',
                    mitigation: 'Use parameterized queries',
                    owaspCategory: 'A03:2021 - Injection'
                },
                {
                    threat: 'NoSQL Injection',
                    vulnerability: 'Direct object passing to MongoDB',
                    mitigation: 'Validate and sanitize inputs',
                    owaspCategory: 'A03:2021 - Injection'
                }
            ]
        });
        // TypeScript Knowledge
        this.frameworks.set('typescript', {
            name: 'TypeScript',
            category: 'fullstack',
            patterns: [
                {
                    name: 'Discriminated Unions',
                    description: 'Type-safe state machines',
                    when: 'Handling multiple states or variants',
                    implementation: 'Common discriminator property',
                    example: 'type State = { type: "loading" } | { type: "success", data: T }',
                    antiPattern: 'Optional properties for different states'
                },
                {
                    name: 'Builder Pattern',
                    description: 'Fluent interface for object construction',
                    when: 'Complex object creation with many options',
                    implementation: 'Chain methods returning this',
                    example: 'new QueryBuilder().select("*").where("id", 1).build()'
                }
            ],
            conventions: [
                {
                    aspect: 'Type vs Interface',
                    standard: 'Interface for objects, Type for unions/intersections',
                    reasoning: 'Interfaces are extendable and provide better error messages',
                    example: 'interface User {} vs type Status = "active" | "inactive"'
                },
                {
                    aspect: 'Naming',
                    standard: 'PascalCase for types/interfaces, avoid I/T prefixes',
                    reasoning: 'Modern TypeScript convention',
                    example: 'User not IUser, Status not TStatus'
                }
            ],
            pitfalls: [
                {
                    issue: 'Using any type',
                    symptoms: ['Runtime errors', 'Lost type safety'],
                    solution: 'Use unknown or specific types',
                    severity: 'medium'
                },
                {
                    issue: 'Not using strict mode',
                    symptoms: ['Implicit any', 'Nullable issues'],
                    solution: 'Enable strict in tsconfig.json',
                    severity: 'high'
                }
            ],
            bestPractices: [
                {
                    category: 'Type Safety',
                    practice: 'Use const assertions',
                    reasoning: 'Narrower types, readonly properties',
                    implementation: 'const config = {...} as const',
                    impact: 'maintainability'
                },
                {
                    category: 'Performance',
                    practice: 'Avoid enum, use const objects',
                    reasoning: 'Enums generate extra JavaScript',
                    implementation: 'const Status = { Active: "active" } as const',
                    impact: 'performance'
                }
            ],
            performance: [
                {
                    operation: 'Type checking',
                    optimization: 'Use project references',
                    improvement: '3-5x faster builds',
                    tradeoff: 'More complex setup'
                }
            ],
            security: []
        });
        // Testing Knowledge
        this.frameworks.set('jest', {
            name: 'Jest/Vitest',
            category: 'testing',
            patterns: [
                {
                    name: 'AAA Pattern',
                    description: 'Arrange, Act, Assert',
                    when: 'Writing any test',
                    implementation: 'Setup data, execute function, check result',
                    example: 'const data = ...; const result = fn(data); expect(result).toBe(...)'
                },
                {
                    name: 'Test Data Builders',
                    description: 'Flexible test data creation',
                    when: 'Complex test objects needed',
                    implementation: 'Builder class with default values',
                    example: 'new UserBuilder().withEmail("test@test.com").build()'
                }
            ],
            conventions: [
                {
                    aspect: 'Test Naming',
                    standard: 'describe what is being tested',
                    reasoning: 'Self-documenting tests',
                    example: 'it("should return user when valid ID provided")'
                },
                {
                    aspect: 'File Structure',
                    standard: '__tests__ folder or .test.ts suffix',
                    reasoning: 'Clear separation of tests and code',
                    example: 'user.test.ts or __tests__/user.ts'
                }
            ],
            pitfalls: [
                {
                    issue: 'Testing implementation details',
                    symptoms: ['Tests break on refactor', 'Brittle tests'],
                    solution: 'Test behavior, not implementation',
                    severity: 'medium'
                },
                {
                    issue: 'Shared mutable test data',
                    symptoms: ['Flaky tests', 'Order-dependent tests'],
                    solution: 'Create fresh data for each test',
                    severity: 'high'
                }
            ],
            bestPractices: [
                {
                    category: 'Test Quality',
                    practice: 'One assertion per test',
                    reasoning: 'Clear failure messages',
                    implementation: 'Split multiple assertions into separate tests',
                    impact: 'maintainability'
                },
                {
                    category: 'Performance',
                    practice: 'Use beforeAll for expensive setup',
                    reasoning: 'Reduce test execution time',
                    implementation: 'beforeAll for DB connection, beforeEach for data',
                    impact: 'performance'
                }
            ],
            performance: [
                {
                    operation: 'Test execution',
                    optimization: 'Run tests in parallel',
                    improvement: '4x faster test runs',
                    tradeoff: 'May need test isolation'
                }
            ],
            security: []
        });
        // Database Knowledge
        this.frameworks.set('postgresql', {
            name: 'PostgreSQL',
            category: 'database',
            patterns: [
                {
                    name: 'Soft Deletes',
                    description: 'Mark records as deleted instead of removing',
                    when: 'Need audit trail or recovery capability',
                    implementation: 'deleted_at timestamp column',
                    example: 'UPDATE users SET deleted_at = NOW() WHERE id = ?',
                    antiPattern: 'Hard delete with no recovery option'
                },
                {
                    name: 'Materialized Views',
                    description: 'Pre-computed query results',
                    when: 'Complex queries with infrequent data changes',
                    implementation: 'CREATE MATERIALIZED VIEW with REFRESH',
                    example: 'Dashboard aggregations refreshed hourly'
                }
            ],
            conventions: [
                {
                    aspect: 'Naming',
                    standard: 'snake_case for tables and columns',
                    reasoning: 'PostgreSQL convention, case-insensitive',
                    example: 'user_accounts, created_at'
                },
                {
                    aspect: 'Primary Keys',
                    standard: 'Use UUID or BIGSERIAL',
                    reasoning: 'UUID for distributed, BIGSERIAL for single DB',
                    example: 'id UUID DEFAULT gen_random_uuid()'
                }
            ],
            pitfalls: [
                {
                    issue: 'N+1 query problem',
                    symptoms: ['Slow page loads', 'High DB CPU'],
                    solution: 'Use JOIN or batch fetching',
                    severity: 'high'
                },
                {
                    issue: 'Missing indexes on foreign keys',
                    symptoms: ['Slow joins', 'Lock contention'],
                    solution: 'Create indexes on all FK columns',
                    severity: 'high'
                }
            ],
            bestPractices: [
                {
                    category: 'Performance',
                    practice: 'Use EXPLAIN ANALYZE',
                    reasoning: 'Understand query execution plan',
                    implementation: 'EXPLAIN ANALYZE SELECT ...',
                    impact: 'performance'
                },
                {
                    category: 'Data Integrity',
                    practice: 'Use transactions for multi-table updates',
                    reasoning: 'Maintain consistency',
                    implementation: 'BEGIN; UPDATE...; UPDATE...; COMMIT;',
                    impact: 'maintainability'
                }
            ],
            performance: [
                {
                    operation: 'Bulk inserts',
                    optimization: 'Use COPY instead of INSERT',
                    improvement: '10-100x faster',
                    tradeoff: 'Less flexible than INSERT'
                },
                {
                    operation: 'Count queries',
                    optimization: 'Use approximate count for large tables',
                    improvement: '1000x faster',
                    tradeoff: 'Not exact count'
                }
            ],
            security: [
                {
                    threat: 'SQL Injection',
                    vulnerability: 'String concatenation',
                    mitigation: 'Use parameterized queries ($1, $2)',
                    owaspCategory: 'A03:2021 - Injection'
                }
            ]
        });
        // Domain Concepts
        this.initializeDomainConcepts();
    }
    /**
     * Initialize domain-specific concepts
     */
    initializeDomainConcepts() {
        // E-commerce Domain
        this.domains.set('ecommerce', {
            domain: 'E-commerce',
            concepts: [
                {
                    name: 'Shopping Cart',
                    definition: 'Temporary storage for items before purchase',
                    importance: 'critical',
                    relatedConcepts: ['Session Management', 'Inventory', 'Checkout']
                },
                {
                    name: 'Inventory Management',
                    definition: 'Track product availability and stock levels',
                    importance: 'critical',
                    relatedConcepts: ['SKU', 'Warehousing', 'Reorder Points']
                },
                {
                    name: 'Payment Gateway',
                    definition: 'Interface for processing payments',
                    importance: 'critical',
                    relatedConcepts: ['PCI Compliance', 'Tokenization', 'Webhooks']
                },
                {
                    name: 'Order Fulfillment',
                    definition: 'Process from order to delivery',
                    importance: 'high',
                    relatedConcepts: ['Shipping', 'Tracking', 'Returns']
                }
            ]
        });
        // FinTech Domain
        this.domains.set('fintech', {
            domain: 'FinTech',
            concepts: [
                {
                    name: 'KYC (Know Your Customer)',
                    definition: 'Identity verification process',
                    importance: 'critical',
                    relatedConcepts: ['AML', 'Identity Verification', 'Compliance']
                },
                {
                    name: 'PCI DSS Compliance',
                    definition: 'Payment Card Industry Data Security Standards',
                    importance: 'critical',
                    relatedConcepts: ['Encryption', 'Tokenization', 'Audit Logs']
                },
                {
                    name: 'Double-Entry Bookkeeping',
                    definition: 'Every transaction affects two accounts',
                    importance: 'critical',
                    relatedConcepts: ['Ledger', 'Journal', 'Trial Balance']
                },
                {
                    name: 'Idempotency',
                    definition: 'Same operation produces same result',
                    importance: 'critical',
                    relatedConcepts: ['Retry Logic', 'Distributed Systems', 'API Design']
                }
            ]
        });
        // Healthcare Domain
        this.domains.set('healthcare', {
            domain: 'Healthcare',
            concepts: [
                {
                    name: 'HIPAA Compliance',
                    definition: 'Health Insurance Portability and Accountability Act',
                    importance: 'critical',
                    relatedConcepts: ['PHI', 'Encryption', 'Access Control']
                },
                {
                    name: 'HL7/FHIR',
                    definition: 'Healthcare data exchange standards',
                    importance: 'high',
                    relatedConcepts: ['Interoperability', 'APIs', 'Data Standards']
                },
                {
                    name: 'Electronic Health Records (EHR)',
                    definition: 'Digital patient medical records',
                    importance: 'critical',
                    relatedConcepts: ['Patient Portal', 'Clinical Data', 'Audit Trail']
                }
            ]
        });
    }
    /**
     * Get framework knowledge
     */
    getFrameworkKnowledge(framework) {
        return this.frameworks.get(framework.toLowerCase()) || null;
    }
    /**
     * Get domain concepts
     */
    getDomainKnowledge(domain) {
        return this.domains.get(domain.toLowerCase()) || null;
    }
    /**
     * Analyze code and provide framework-specific insights
     */
    async analyzeWithKnowledge(code, context) {
        const result = {
            insights: [],
            warnings: [],
            suggestions: [],
            patterns: [],
            pitfalls: []
        };
        // Detect framework if not provided
        const detectedFramework = context.framework || this.detectFramework(code);
        if (detectedFramework) {
            const knowledge = this.getFrameworkKnowledge(detectedFramework);
            if (knowledge) {
                // Check for pitfalls
                for (const pitfall of knowledge.pitfalls) {
                    if (this.checkForPitfall(code, pitfall)) {
                        result.pitfalls.push(pitfall);
                        result.warnings.push(`Potential ${pitfall.severity} issue: ${pitfall.issue}`);
                        result.suggestions.push(pitfall.solution);
                    }
                }
                // Suggest applicable patterns
                for (const pattern of knowledge.patterns) {
                    if (this.isPatternApplicable(code, pattern)) {
                        result.patterns.push(pattern);
                        result.insights.push(`Consider using ${pattern.name}: ${pattern.description}`);
                    }
                }
                // Check best practices
                for (const practice of knowledge.bestPractices) {
                    if (!this.followsBestPractice(code, practice)) {
                        result.suggestions.push(`${practice.category}: ${practice.practice}`);
                    }
                }
                // Performance optimizations
                for (const tip of knowledge.performance) {
                    if (this.needsOptimization(code, tip)) {
                        result.suggestions.push(`Performance: ${tip.optimization} for ${tip.operation}`);
                    }
                }
                // Security considerations
                for (const security of knowledge.security) {
                    if (this.hasSecurityIssue(code, security)) {
                        result.warnings.push(`Security: ${security.threat} - ${security.vulnerability}`);
                        result.suggestions.push(security.mitigation);
                    }
                }
            }
        }
        // Domain-specific analysis
        if (context.domain) {
            const domainKnowledge = this.getDomainKnowledge(context.domain);
            if (domainKnowledge) {
                for (const concept of domainKnowledge.concepts) {
                    if (concept.importance === 'critical' && this.involvesconcept(code, concept)) {
                        result.insights.push(`Critical ${context.domain} concept: ${concept.name}`);
                        // Add related concept warnings
                        for (const related of concept.relatedConcepts) {
                            if (!this.includesRelatedConcept(code, related)) {
                                result.suggestions.push(`Consider implementing ${related} with ${concept.name}`);
                            }
                        }
                    }
                }
            }
        }
        // Share insights with other tools
        if (result.warnings.length > 0 || result.pitfalls.length > 0) {
            await this.messageBus.shareInsight('domain-knowledge', {
                type: 'framework-issues',
                data: {
                    framework: detectedFramework,
                    warnings: result.warnings,
                    pitfalls: result.pitfalls
                },
                confidence: 0.85,
                affects: ['smart-reviewer', 'refactor-assistant']
            });
        }
        return result;
    }
    /**
     * Detect framework from code
     */
    detectFramework(code) {
        const detectors = [
            { pattern: /import.*from\s+['"]react['"]/, framework: 'react' },
            { pattern: /require\(['"]react['"]\)/, framework: 'react' },
            { pattern: /import.*express/i, framework: 'express' },
            { pattern: /app\.(get|post|put|delete|use)/, framework: 'express' },
            { pattern: /(describe|it|test|expect)\s*\(/, framework: 'jest' },
            { pattern: /interface\s+\w+|type\s+\w+\s*=/, framework: 'typescript' },
            { pattern: /SELECT.*FROM|INSERT INTO|UPDATE.*SET/, framework: 'postgresql' }
        ];
        for (const detector of detectors) {
            if (detector.pattern.test(code)) {
                return detector.framework;
            }
        }
        return null;
    }
    /**
     * Check if code has a specific pitfall
     */
    checkForPitfall(code, pitfall) {
        // React pitfalls
        if (pitfall.issue === 'Using array index as key') {
            return /key=\{index\}|key=\{i\}/.test(code);
        }
        if (pitfall.issue === 'Direct state mutation') {
            return /state\.\w+\s*=|state\.\w+\.push|state\.\w+\.pop/.test(code);
        }
        if (pitfall.issue === 'useEffect without dependencies') {
            return /useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]+\}\s*\)(?!\s*,)/.test(code);
        }
        // Express pitfalls
        if (pitfall.issue === 'Synchronous operations blocking event loop') {
            return /fs\.readFileSync|fs\.writeFileSync/.test(code) && !/(test|spec)\./.test(code);
        }
        if (pitfall.issue === 'Missing error handling in async routes') {
            return /async\s+\(req,\s*res\)/.test(code) && !/(try|catch|\.catch)/.test(code);
        }
        // TypeScript pitfalls
        if (pitfall.issue === 'Using any type') {
            return /:\s*any\b|\bas\s+any\b/.test(code);
        }
        // Jest pitfalls
        if (pitfall.issue === 'Testing implementation details') {
            return /expect\([^)]+\._/.test(code); // Testing private methods
        }
        // Database pitfalls
        if (pitfall.issue === 'N+1 query problem') {
            return /for.*await.*SELECT|map.*async.*SELECT/.test(code);
        }
        return false;
    }
    /**
     * Check if pattern is applicable to code
     */
    isPatternApplicable(code, pattern) {
        // Simple heuristics for pattern applicability
        if (pattern.name === 'Custom Hooks' && code.includes('useState') && code.includes('useEffect')) {
            return true;
        }
        if (pattern.name === 'Middleware Pipeline' && code.includes('app.use')) {
            return true;
        }
        if (pattern.name === 'Discriminated Unions' && code.includes('type') && code.includes('|')) {
            return true;
        }
        return false;
    }
    /**
     * Check if code follows best practice
     */
    followsBestPractice(code, practice) {
        // Simple checks for common practices
        if (practice.practice === 'Use helmet for security headers') {
            return code.includes('helmet()');
        }
        if (practice.practice === 'Enable gzip compression') {
            return code.includes('compression()');
        }
        if (practice.practice === 'Use const assertions') {
            return code.includes('as const');
        }
        return true; // Assume following if can't determine
    }
    /**
     * Check if code needs optimization
     */
    needsOptimization(code, tip) {
        if (tip.operation === 'List rendering' && code.includes('map') && !code.includes('key=')) {
            return true;
        }
        if (tip.operation === 'Database queries' && !code.includes('pool')) {
            return true;
        }
        return false;
    }
    /**
     * Check for security issues
     */
    hasSecurityIssue(code, security) {
        if (security.threat === 'SQL Injection') {
            return /\+\s*['"].*SELECT|WHERE.*\+\s*\w+/.test(code);
        }
        if (security.threat === 'XSS attacks') {
            return /dangerouslySetInnerHTML\s*=\s*\{/.test(code);
        }
        return false;
    }
    /**
     * Check if code involves domain concept
     */
    involvesconcept(code, concept) {
        const keywords = concept.name.toLowerCase().split(' ');
        return keywords.some(keyword => code.toLowerCase().includes(keyword));
    }
    /**
     * Check if code includes related concept
     */
    includesRelatedConcept(code, related) {
        return code.toLowerCase().includes(related.toLowerCase());
    }
    /**
     * Get recommendations for specific operation
     */
    getRecommendations(operation, context) {
        const recommendations = [];
        // Get framework-specific recommendations
        if (context.framework) {
            const knowledge = this.getFrameworkKnowledge(context.framework);
            if (knowledge) {
                // Find relevant patterns
                const relevantPatterns = knowledge.patterns.filter(p => operation.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
                for (const pattern of relevantPatterns) {
                    recommendations.push(`Use ${pattern.name}: ${pattern.implementation}`);
                }
                // Find relevant best practices
                for (const practice of knowledge.bestPractices) {
                    if (operation.toLowerCase().includes(practice.category.toLowerCase())) {
                        recommendations.push(practice.practice);
                    }
                }
            }
        }
        return recommendations;
    }
    /**
     * Learn new pattern from successful code
     */
    async learnPattern(code, metadata) {
        const framework = this.frameworks.get(metadata.framework);
        if (framework) {
            // Add to patterns if highly rated
            if (metadata.userRating && metadata.userRating >= 4) {
                framework.patterns.push({
                    name: metadata.patternName,
                    description: metadata.description,
                    when: 'Learned from successful implementation',
                    implementation: code.substring(0, 500),
                    example: code
                });
                // Share learning with other tools
                await this.messageBus.shareInsight('domain-knowledge', {
                    type: 'new-pattern-learned',
                    data: {
                        framework: metadata.framework,
                        pattern: metadata.patternName
                    },
                    confidence: metadata.userRating / 5,
                    affects: ['test-generator', 'refactor-assistant']
                });
            }
        }
    }
}
// Export for use in other modules
export default DomainKnowledgeBase;
//# sourceMappingURL=domain-knowledge.js.map