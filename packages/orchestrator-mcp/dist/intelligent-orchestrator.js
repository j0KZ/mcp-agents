/**
 * Intelligent Orchestrator
 * Phase 3.1 of Master Evolution Plan
 *
 * This is not just a task runner - it's an intelligent system that:
 * - Analyzes tasks to determine optimal tool combinations
 * - Manages parallel and sequential execution intelligently
 * - Learns from outcomes to improve future orchestrations
 * - Handles failures gracefully with automatic retries and fallbacks
 */
import { EventEmitter } from 'events';
import { MessageBus, PerformanceTracker, SemanticAnalyzer, DomainKnowledgeBase, ExplanationEngine } from '@j0kz/shared';
export class IntelligentOrchestrator extends EventEmitter {
    messageBus;
    performanceTracker;
    semanticAnalyzer;
    domainKnowledge;
    explanationEngine;
    // Tool registry with capabilities
    toolCapabilities = new Map();
    // Historical performance data for learning
    orchestrationHistory = new Map();
    // Pattern recognition for task-tool matching
    successPatterns = new Map();
    // Active orchestrations
    activeOrchestrations = new Map();
    constructor() {
        super();
        this.messageBus = new MessageBus();
        this.performanceTracker = new PerformanceTracker();
        this.semanticAnalyzer = new SemanticAnalyzer();
        this.domainKnowledge = new DomainKnowledgeBase(this.messageBus);
        this.explanationEngine = new ExplanationEngine(this.messageBus);
        this.initializeToolCapabilities();
        this.setupMessageHandlers();
    }
    /**
     * Initialize tool capabilities registry
     */
    initializeToolCapabilities() {
        // Smart Reviewer
        this.toolCapabilities.set('smart-reviewer', {
            tool: 'smart-reviewer',
            strengths: ['code quality', 'pattern detection', 'metrics calculation', 'auto-fixes'],
            weaknesses: ['security analysis', 'test generation'],
            performance: {
                averageTime: 500,
                successRate: 0.95,
                qualityScore: 85
            },
            specializations: ['code-review', 'quality-metrics', 'refactoring-suggestions'],
            dependencies: ['refactor-assistant']
        });
        // Test Generator
        this.toolCapabilities.set('test-generator', {
            tool: 'test-generator',
            strengths: ['test creation', 'coverage analysis', 'edge cases', 'mocking'],
            weaknesses: ['performance testing', 'integration tests'],
            performance: {
                averageTime: 800,
                successRate: 0.88,
                qualityScore: 80
            },
            specializations: ['unit-tests', 'edge-cases', 'mock-generation'],
            dependencies: ['smart-reviewer']
        });
        // Security Scanner
        this.toolCapabilities.set('security-scanner', {
            tool: 'security-scanner',
            strengths: ['vulnerability detection', 'OWASP compliance', 'secret scanning', 'dependency audit'],
            weaknesses: ['performance optimization', 'code style'],
            performance: {
                averageTime: 1200,
                successRate: 0.92,
                qualityScore: 90
            },
            specializations: ['security-audit', 'compliance', 'vulnerability-assessment'],
            dependencies: []
        });
        // Refactor Assistant
        this.toolCapabilities.set('refactor-assistant', {
            tool: 'refactor-assistant',
            strengths: ['code transformation', 'pattern application', 'complexity reduction', 'async conversion'],
            weaknesses: ['security analysis', 'test generation'],
            performance: {
                averageTime: 600,
                successRate: 0.90,
                qualityScore: 82
            },
            specializations: ['refactoring', 'pattern-application', 'code-cleanup'],
            dependencies: ['smart-reviewer']
        });
        // Architecture Analyzer
        this.toolCapabilities.set('architecture-analyzer', {
            tool: 'architecture-analyzer',
            strengths: ['dependency analysis', 'circular detection', 'layer validation', 'module coupling'],
            weaknesses: ['code generation', 'security'],
            performance: {
                averageTime: 1000,
                successRate: 0.94,
                qualityScore: 88
            },
            specializations: ['architecture-review', 'dependency-graph', 'module-analysis'],
            dependencies: []
        });
        // Doc Generator
        this.toolCapabilities.set('doc-generator', {
            tool: 'doc-generator',
            strengths: ['documentation', 'API docs', 'README generation', 'changelog'],
            weaknesses: ['code analysis', 'security'],
            performance: {
                averageTime: 400,
                successRate: 0.96,
                qualityScore: 85
            },
            specializations: ['documentation', 'api-reference', 'markdown-generation'],
            dependencies: []
        });
        // API Designer
        this.toolCapabilities.set('api-designer', {
            tool: 'api-designer',
            strengths: ['API design', 'OpenAPI spec', 'REST patterns', 'GraphQL schema'],
            weaknesses: ['implementation', 'testing'],
            performance: {
                averageTime: 700,
                successRate: 0.91,
                qualityScore: 87
            },
            specializations: ['api-design', 'openapi', 'graphql'],
            dependencies: ['doc-generator']
        });
        // DB Schema Designer
        this.toolCapabilities.set('db-schema', {
            tool: 'db-schema',
            strengths: ['schema design', 'normalization', 'indexing', 'migrations'],
            weaknesses: ['API design', 'frontend'],
            performance: {
                averageTime: 900,
                successRate: 0.89,
                qualityScore: 84
            },
            specializations: ['database-design', 'sql-generation', 'migration-scripts'],
            dependencies: []
        });
    }
    /**
     * Setup message handlers for inter-tool communication
     */
    setupMessageHandlers() {
        this.messageBus.on('insight', async (message) => {
            // Learn from tool insights
            await this.processInsight(message);
        });
        this.messageBus.on('tool-failure', async (message) => {
            // Handle tool failures intelligently
            await this.handleToolFailure(message);
        });
        this.messageBus.on('consensus-needed', async (message) => {
            // Coordinate consensus when tools disagree
            await this.coordinateConsensus(message);
        });
    }
    /**
     * Create an intelligent orchestration plan
     */
    async createPlan(task) {
        const startTime = Date.now();
        // Analyze task semantics
        const taskAnalysis = await this.analyzeTask(task);
        // Determine optimal tool combination
        const toolSelection = this.selectTools(taskAnalysis, task.requirements);
        // Create execution stages
        const stages = this.createExecutionStages(toolSelection, task);
        // Estimate time and confidence
        const estimation = this.estimatePerformance(stages);
        // Generate alternatives
        const alternatives = this.generateAlternatives(taskAnalysis, toolSelection);
        // Create plan
        const plan = {
            id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            task,
            stages,
            estimatedTime: estimation.time,
            confidence: estimation.confidence,
            reasoning: this.explainPlanReasoning(taskAnalysis, toolSelection, stages),
            alternatives
        };
        // Track planning performance
        await this.performanceTracker.track({
            toolId: 'intelligent-orchestrator',
            operation: 'create-plan',
            timestamp: new Date(),
            duration: Date.now() - startTime,
            success: true,
            confidence: plan.confidence,
            input: {
                type: 'workflow',
                size: JSON.stringify(task).length,
                complexity: stages.length
            },
            output: {
                type: 'execution-plan',
                size: stages.length,
                quality: plan.confidence * 100
            }
        });
        // Store active plan
        this.activeOrchestrations.set(plan.id, plan);
        return plan;
    }
    /**
     * Analyze task to understand requirements
     */
    async analyzeTask(task) {
        const analysis = {
            type: task.type,
            complexity: this.assessComplexity(task),
            requiredCapabilities: [],
            preferredTools: [],
            constraints: []
        };
        // Determine required capabilities based on task type
        switch (task.type) {
            case 'analysis':
                analysis.requiredCapabilities.push('code-review', 'metrics-calculation', 'pattern-detection');
                analysis.preferredTools.push('smart-reviewer', 'architecture-analyzer');
                break;
            case 'generation':
                analysis.requiredCapabilities.push('code-generation', 'test-creation', 'documentation');
                analysis.preferredTools.push('test-generator', 'doc-generator', 'api-designer');
                break;
            case 'refactoring':
                analysis.requiredCapabilities.push('code-transformation', 'pattern-application', 'quality-improvement');
                analysis.preferredTools.push('refactor-assistant', 'smart-reviewer');
                break;
            case 'security':
                analysis.requiredCapabilities.push('vulnerability-detection', 'compliance-check', 'secret-scanning');
                analysis.preferredTools.push('security-scanner');
                break;
            case 'testing':
                analysis.requiredCapabilities.push('test-generation', 'coverage-analysis', 'mock-creation');
                analysis.preferredTools.push('test-generator');
                break;
        }
        // Add constraints based on requirements
        if (task.requirements.speed === 'fast') {
            analysis.constraints.push('prefer-fast-tools');
        }
        if (task.requirements.quality && task.requirements.quality > 90) {
            analysis.constraints.push('require-high-quality-tools');
            analysis.constraints.push('use-consensus-for-critical-decisions');
        }
        if (task.requirements.depth === 'deep') {
            analysis.constraints.push('use-multiple-tools');
            analysis.constraints.push('cross-validate-results');
        }
        // Check for patterns from history
        const similarTasks = this.findSimilarTasks(task);
        if (similarTasks.length > 0) {
            const successfulPatterns = this.extractSuccessfulPatterns(similarTasks);
            analysis.preferredTools.push(...successfulPatterns);
        }
        return analysis;
    }
    /**
     * Assess task complexity
     */
    assessComplexity(task) {
        let complexity = 0;
        // Check input size
        const inputStr = JSON.stringify(task.input);
        if (inputStr.length > 10000)
            complexity++;
        if (inputStr.length > 50000)
            complexity++;
        // Check requirements
        if (task.requirements.quality && task.requirements.quality > 85)
            complexity++;
        if (task.requirements.depth === 'deep')
            complexity++;
        if (task.requirements.confidence && task.requirements.confidence > 0.9)
            complexity++;
        // Check context
        if (task.context?.previousResults && task.context.previousResults.length > 3)
            complexity++;
        if (complexity <= 1)
            return 'simple';
        if (complexity <= 3)
            return 'moderate';
        return 'complex';
    }
    /**
     * Select optimal tools based on analysis
     */
    selectTools(analysis, requirements) {
        const selectedTools = new Set();
        // Add tools that match required capabilities
        for (const capability of analysis.requiredCapabilities) {
            for (const [tool, cap] of this.toolCapabilities.entries()) {
                if (cap.specializations.includes(capability)) {
                    selectedTools.add(tool);
                }
            }
        }
        // Add preferred tools
        for (const tool of analysis.preferredTools) {
            if (this.toolCapabilities.has(tool)) {
                selectedTools.add(tool);
            }
        }
        // Filter based on constraints
        const filtered = Array.from(selectedTools).filter(tool => {
            const cap = this.toolCapabilities.get(tool);
            // Speed constraint
            if (analysis.constraints.includes('prefer-fast-tools') && cap.performance.averageTime > 1000) {
                return false;
            }
            // Quality constraint
            if (analysis.constraints.includes('require-high-quality-tools') && cap.performance.qualityScore < 85) {
                return false;
            }
            return true;
        });
        // Add dependencies
        const withDependencies = [...filtered];
        for (const tool of filtered) {
            const cap = this.toolCapabilities.get(tool);
            if (cap.dependencies) {
                withDependencies.push(...cap.dependencies);
            }
        }
        return [...new Set(withDependencies)];
    }
    /**
     * Create execution stages with intelligent grouping
     */
    createExecutionStages(tools, task) {
        const stages = [];
        // Group tools by dependency and compatibility
        const groups = this.groupToolsByDependency(tools);
        for (const group of groups) {
            // Determine execution mode
            let execution;
            if (group.length === 1) {
                execution = 'sequential';
            }
            else if (this.canRunInParallel(group)) {
                execution = 'parallel';
            }
            else if (task.requirements.quality && task.requirements.quality > 90) {
                execution = 'consensus';
            }
            else {
                execution = 'sequential';
            }
            // Create stage
            stages.push({
                id: `stage-${stages.length + 1}`,
                tools: group,
                execution,
                inputs: task.input,
                expectedOutputs: this.determineExpectedOutputs(group),
                timeout: this.calculateTimeout(group, task.requirements.speed),
                retryStrategy: {
                    maxAttempts: task.requirements.quality && task.requirements.quality > 80 ? 3 : 2,
                    backoff: 'exponential',
                    fallbackTool: this.selectFallbackTool(group[0])
                }
            });
        }
        return stages;
    }
    /**
     * Group tools by dependency relationships
     */
    groupToolsByDependency(tools) {
        const groups = [];
        const processed = new Set();
        for (const tool of tools) {
            if (processed.has(tool))
                continue;
            const group = [tool];
            const cap = this.toolCapabilities.get(tool);
            // Add tools that depend on this one
            for (const other of tools) {
                if (other === tool)
                    continue;
                const otherCap = this.toolCapabilities.get(other);
                if (otherCap?.dependencies?.includes(tool)) {
                    group.push(other);
                    processed.add(other);
                }
            }
            groups.push(group);
            processed.add(tool);
        }
        return groups;
    }
    /**
     * Check if tools can run in parallel
     */
    canRunInParallel(tools) {
        // Tools can run in parallel if they don't depend on each other
        for (const tool of tools) {
            const cap = this.toolCapabilities.get(tool);
            if (cap.dependencies) {
                for (const dep of cap.dependencies) {
                    if (tools.includes(dep)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    /**
     * Determine expected outputs from tools
     */
    determineExpectedOutputs(tools) {
        const outputs = new Set();
        for (const tool of tools) {
            switch (tool) {
                case 'smart-reviewer':
                    outputs.add('issues');
                    outputs.add('metrics');
                    outputs.add('suggestions');
                    break;
                case 'test-generator':
                    outputs.add('tests');
                    outputs.add('coverage');
                    break;
                case 'security-scanner':
                    outputs.add('vulnerabilities');
                    outputs.add('risks');
                    break;
                case 'refactor-assistant':
                    outputs.add('refactored_code');
                    outputs.add('changes');
                    break;
                case 'architecture-analyzer':
                    outputs.add('dependencies');
                    outputs.add('circular_deps');
                    outputs.add('metrics');
                    break;
                case 'doc-generator':
                    outputs.add('documentation');
                    break;
                case 'api-designer':
                    outputs.add('api_spec');
                    outputs.add('endpoints');
                    break;
                case 'db-schema':
                    outputs.add('schema');
                    outputs.add('migrations');
                    break;
            }
        }
        return Array.from(outputs);
    }
    /**
     * Calculate timeout based on tools and speed requirements
     */
    calculateTimeout(tools, speed) {
        let baseTimeout = 0;
        for (const tool of tools) {
            const cap = this.toolCapabilities.get(tool);
            if (cap) {
                baseTimeout += cap.performance.averageTime;
            }
        }
        // Adjust for speed requirements
        switch (speed) {
            case 'fast':
                return baseTimeout * 0.8;
            case 'balanced':
                return baseTimeout * 1.2;
            case 'thorough':
                return baseTimeout * 2;
            default:
                return baseTimeout * 1.5;
        }
    }
    /**
     * Select fallback tool for retry strategy
     */
    selectFallbackTool(primaryTool) {
        // Find alternative tool with similar capabilities
        const primaryCap = this.toolCapabilities.get(primaryTool);
        if (!primaryCap)
            return undefined;
        let bestAlternative;
        let bestScore = 0;
        for (const [tool, cap] of this.toolCapabilities.entries()) {
            if (tool === primaryTool)
                continue;
            // Calculate similarity score
            const commonStrengths = cap.strengths.filter(s => primaryCap.strengths.includes(s)).length;
            const score = commonStrengths / primaryCap.strengths.length;
            if (score > bestScore) {
                bestScore = score;
                bestAlternative = tool;
            }
        }
        return bestScore > 0.5 ? bestAlternative : undefined;
    }
    /**
     * Estimate performance of the plan
     */
    estimatePerformance(stages) {
        let totalTime = 0;
        let totalConfidence = 0;
        for (const stage of stages) {
            // Calculate stage time
            let stageTime = 0;
            let stageConfidence = 1;
            for (const tool of stage.tools) {
                const cap = this.toolCapabilities.get(tool);
                if (cap) {
                    if (stage.execution === 'parallel') {
                        stageTime = Math.max(stageTime, cap.performance.averageTime);
                    }
                    else {
                        stageTime += cap.performance.averageTime;
                    }
                    stageConfidence *= cap.performance.successRate;
                }
            }
            totalTime += stageTime;
            totalConfidence += stageConfidence;
        }
        return {
            time: totalTime,
            confidence: totalConfidence / stages.length
        };
    }
    /**
     * Generate alternative plans
     */
    generateAlternatives(analysis, selectedTools) {
        const alternatives = [];
        // Fast alternative - use only essential tools
        if (selectedTools.length > 2) {
            const essential = selectedTools.slice(0, 2);
            alternatives.push({
                reason: 'Faster execution with essential tools only',
                stages: this.createExecutionStages(essential, {}),
                tradeoffs: {
                    pros: ['50% faster execution', 'Lower resource usage'],
                    cons: ['Less comprehensive analysis', 'May miss edge cases']
                }
            });
        }
        // Thorough alternative - add more tools
        const additionalTools = Array.from(this.toolCapabilities.keys())
            .filter(t => !selectedTools.includes(t))
            .slice(0, 2);
        if (additionalTools.length > 0) {
            alternatives.push({
                reason: 'More comprehensive analysis with additional tools',
                stages: this.createExecutionStages([...selectedTools, ...additionalTools], {}),
                tradeoffs: {
                    pros: ['Higher confidence results', 'Better coverage'],
                    cons: ['2x slower execution', 'Higher resource usage']
                }
            });
        }
        return alternatives;
    }
    /**
     * Explain plan reasoning
     */
    explainPlanReasoning(analysis, tools, stages) {
        const reasoning = [];
        reasoning.push(`Task Type: ${analysis.type} (${analysis.complexity} complexity)`);
        reasoning.push(`Selected ${tools.length} tools based on required capabilities`);
        // Explain tool selection
        for (const tool of tools) {
            const cap = this.toolCapabilities.get(tool);
            if (cap) {
                reasoning.push(`- ${tool}: Strong in ${cap.strengths.slice(0, 2).join(', ')}`);
            }
        }
        // Explain execution strategy
        reasoning.push(`Execution Plan: ${stages.length} stages`);
        for (const stage of stages) {
            reasoning.push(`- Stage ${stage.id}: ${stage.tools.join(' + ')} (${stage.execution})`);
        }
        // Explain optimization decisions
        if (analysis.constraints.includes('prefer-fast-tools')) {
            reasoning.push('Optimized for speed - selected fastest tools');
        }
        if (analysis.constraints.includes('use-consensus-for-critical-decisions')) {
            reasoning.push('Using consensus mechanism for high-quality requirements');
        }
        return reasoning;
    }
    /**
     * Execute orchestration plan with intelligent coordination
     */
    async execute(plan) {
        const startTime = Date.now();
        const results = new Map();
        const stageTimings = new Map();
        const toolTimings = new Map();
        const learnings = [];
        this.emit('orchestration:start', { planId: plan.id });
        try {
            // Execute each stage
            for (const stage of plan.stages) {
                const stageStart = Date.now();
                this.emit('stage:start', { planId: plan.id, stageId: stage.id });
                const stageResults = await this.executeStage(stage, results);
                // Merge results
                for (const [key, value] of stageResults.entries()) {
                    results.set(key, value);
                }
                const stageDuration = Date.now() - stageStart;
                stageTimings.set(stage.id, stageDuration);
                this.emit('stage:complete', {
                    planId: plan.id,
                    stageId: stage.id,
                    duration: stageDuration
                });
                // Learn from stage execution
                const stageLearning = this.analyzeStageExecution(stage, stageResults, stageDuration);
                if (stageLearning) {
                    learnings.push(stageLearning);
                }
            }
            // Apply consensus if needed
            let consensus;
            if (plan.stages.some(s => s.execution === 'consensus')) {
                consensus = await this.applyConsensus(results);
            }
            // Generate explanation
            const explanation = await this.generateOrchestrationExplanation(plan, results, consensus, learnings);
            // Calculate overall success
            const success = this.determineSuccess(results, plan.task.requirements);
            // Create result
            const result = {
                success,
                planId: plan.id,
                results,
                consensus,
                performance: {
                    totalTime: Date.now() - startTime,
                    stageTimings,
                    toolTimings
                },
                learnings,
                explanation
            };
            // Store for learning
            this.storeOrchestrationResult(plan.task, result);
            // Track performance
            await this.performanceTracker.track({
                toolId: 'intelligent-orchestrator',
                operation: 'execute-plan',
                timestamp: new Date(),
                duration: result.performance.totalTime,
                success: result.success,
                confidence: consensus?.confidence || 0.8,
                input: {
                    type: 'execution-plan',
                    size: plan.stages.length,
                    complexity: plan.stages.length
                },
                output: {
                    type: 'orchestration-result',
                    size: results.size,
                    quality: (consensus?.confidence || 0.8) * 100
                }
            });
            this.emit('orchestration:complete', { planId: plan.id, result });
            return result;
        }
        catch (error) {
            // Intelligent error handling
            const recovery = await this.attemptRecovery(plan, error, results);
            if (recovery) {
                return recovery;
            }
            throw error;
        }
    }
    /**
     * Execute a single stage with retry logic
     */
    async executeStage(stage, previousResults) {
        const results = new Map();
        if (stage.execution === 'parallel') {
            // Execute tools in parallel
            const promises = stage.tools.map(tool => this.executeTool(tool, stage.inputs, previousResults, stage.retryStrategy));
            const toolResults = await Promise.allSettled(promises);
            for (let i = 0; i < stage.tools.length; i++) {
                const tool = stage.tools[i];
                const result = toolResults[i];
                if (result.status === 'fulfilled') {
                    results.set(tool, result.value);
                }
                else {
                    // Handle failure with fallback
                    if (stage.retryStrategy?.fallbackTool) {
                        const fallbackResult = await this.executeTool(stage.retryStrategy.fallbackTool, stage.inputs, previousResults);
                        results.set(tool, fallbackResult);
                    }
                    else {
                        results.set(tool, { error: result.reason });
                    }
                }
            }
        }
        else if (stage.execution === 'sequential') {
            // Execute tools sequentially
            for (const tool of stage.tools) {
                const result = await this.executeTool(tool, stage.inputs, previousResults, stage.retryStrategy);
                results.set(tool, result);
                previousResults.set(tool, result); // Make available for next tool
            }
        }
        else if (stage.execution === 'consensus') {
            // Execute all tools and reach consensus
            const allResults = new Map();
            for (const tool of stage.tools) {
                const result = await this.executeTool(tool, stage.inputs, previousResults);
                allResults.set(tool, result);
            }
            // Apply consensus mechanism
            const consensus = await this.applyConsensus(allResults);
            results.set('consensus', consensus);
        }
        return results;
    }
    /**
     * Execute a single tool with retry logic
     */
    async executeTool(toolName, input, context, retryStrategy) {
        const maxAttempts = retryStrategy?.maxAttempts || 1;
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // Send execution request via message bus
                const response = await this.messageBus.request({
                    from: 'orchestrator',
                    to: toolName,
                    type: 'request',
                    subject: 'execute',
                    data: { input, context: Object.fromEntries(context) },
                    confidence: 1
                });
                // Validate response - check if data contains result
                if (response.data) {
                    return response.data;
                }
                else {
                    throw new Error('Tool execution failed');
                }
            }
            catch (error) {
                lastError = error;
                if (attempt < maxAttempts) {
                    // Apply backoff strategy
                    const delay = retryStrategy?.backoff === 'exponential'
                        ? Math.pow(2, attempt) * 100
                        : attempt * 100;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
    /**
     * Apply consensus mechanism when tools disagree
     */
    async applyConsensus(results) {
        const conflicts = [];
        const agreements = new Map();
        // Identify conflicts
        const aspects = this.extractAspects(results);
        for (const aspect of aspects) {
            const opinions = new Map();
            for (const [tool, result] of results.entries()) {
                if (result[aspect] !== undefined) {
                    opinions.set(tool, result[aspect]);
                }
            }
            if (opinions.size > 1) {
                // Check if there's disagreement
                const values = Array.from(opinions.values());
                const firstValue = JSON.stringify(values[0]);
                const hasDisagreement = values.some(v => JSON.stringify(v) !== firstValue);
                if (hasDisagreement) {
                    // Resolve conflict
                    const resolution = await this.resolveConflict(aspect, opinions);
                    conflicts.push({
                        aspect,
                        toolOpinions: opinions,
                        resolution: resolution.method
                    });
                    agreements.set(aspect, resolution.value);
                }
                else {
                    agreements.set(aspect, values[0]);
                }
            }
            else if (opinions.size === 1) {
                agreements.set(aspect, opinions.values().next().value);
            }
        }
        // Calculate agreement level
        const totalAspects = aspects.length;
        const agreedAspects = aspects.length - conflicts.length;
        const agreementLevel = totalAspects > 0 ? agreedAspects / totalAspects : 1;
        return {
            agreement: agreementLevel,
            conflicts,
            resolution: Object.fromEntries(agreements),
            confidence: this.calculateConsensusConfidence(agreementLevel, results.size)
        };
    }
    /**
     * Extract aspects from results for comparison
     */
    extractAspects(results) {
        const aspects = new Set();
        for (const result of results.values()) {
            if (typeof result === 'object' && result !== null) {
                Object.keys(result).forEach(key => aspects.add(key));
            }
        }
        return Array.from(aspects);
    }
    /**
     * Resolve conflict between tool opinions
     */
    async resolveConflict(aspect, opinions) {
        // Strategy 1: Weighted by tool quality scores
        const weightedScores = new Map();
        for (const [tool, opinion] of opinions.entries()) {
            const cap = this.toolCapabilities.get(tool);
            if (cap) {
                const weight = cap.performance.qualityScore / 100;
                const key = JSON.stringify(opinion);
                weightedScores.set(key, (weightedScores.get(key) || 0) + weight);
            }
        }
        // Find highest weighted opinion
        let bestOpinion;
        let bestScore = 0;
        for (const [opinion, score] of weightedScores.entries()) {
            if (score > bestScore) {
                bestScore = score;
                bestOpinion = JSON.parse(opinion);
            }
        }
        // Strategy 2: Expert opinion (tool specialized in this aspect)
        const expertTool = this.findExpertForAspect(aspect);
        if (expertTool && opinions.has(expertTool)) {
            return {
                method: 'expert',
                value: opinions.get(expertTool)
            };
        }
        // Strategy 3: Majority vote
        const voteCounts = new Map();
        for (const opinion of opinions.values()) {
            const key = JSON.stringify(opinion);
            voteCounts.set(key, (voteCounts.get(key) || 0) + 1);
        }
        const majorityThreshold = opinions.size / 2;
        for (const [opinion, count] of voteCounts.entries()) {
            if (count > majorityThreshold) {
                return {
                    method: 'majority',
                    value: JSON.parse(opinion)
                };
            }
        }
        // Default to weighted if no clear majority
        return {
            method: 'weighted',
            value: bestOpinion
        };
    }
    /**
     * Find expert tool for specific aspect
     */
    findExpertForAspect(aspect) {
        const expertMap = {
            'security': 'security-scanner',
            'vulnerabilities': 'security-scanner',
            'tests': 'test-generator',
            'coverage': 'test-generator',
            'quality': 'smart-reviewer',
            'metrics': 'smart-reviewer',
            'refactoring': 'refactor-assistant',
            'architecture': 'architecture-analyzer',
            'dependencies': 'architecture-analyzer',
            'documentation': 'doc-generator',
            'api': 'api-designer',
            'schema': 'db-schema'
        };
        return expertMap[aspect.toLowerCase()];
    }
    /**
     * Calculate consensus confidence
     */
    calculateConsensusConfidence(agreementLevel, toolCount) {
        // Higher agreement = higher confidence
        // More tools = higher confidence
        const agreementFactor = agreementLevel;
        const toolFactor = Math.min(toolCount / 5, 1); // Max benefit at 5 tools
        return (agreementFactor * 0.7 + toolFactor * 0.3);
    }
    /**
     * Analyze stage execution for learning
     */
    analyzeStageExecution(stage, results, duration) {
        // Check if stage was slower than expected
        if (stage.timeout && duration > stage.timeout) {
            return {
                pattern: 'slow-execution',
                observation: `Stage ${stage.id} took ${duration}ms (expected ${stage.timeout}ms)`,
                impact: 'negative',
                recommendation: `Consider using faster tools or parallel execution`
            };
        }
        // Check if consensus had high disagreement
        const consensus = results.get('consensus');
        if (consensus && consensus.agreement < 0.5) {
            return {
                pattern: 'low-agreement',
                observation: `Tools had ${(consensus.agreement * 100).toFixed(0)}% agreement`,
                impact: 'negative',
                recommendation: 'Consider using more specialized tools or adjusting inputs'
            };
        }
        // Check for successful patterns
        if (stage.execution === 'parallel' && duration < stage.timeout * 0.5) {
            return {
                pattern: 'efficient-parallel',
                observation: `Parallel execution saved ${(stage.timeout - duration)}ms`,
                impact: 'positive',
                recommendation: 'Continue using parallel execution for these tools'
            };
        }
        return null;
    }
    /**
     * Determine overall success based on requirements
     */
    determineSuccess(results, requirements) {
        // Check if all expected results are present
        for (const [key, value] of results.entries()) {
            if (value.error) {
                return false;
            }
        }
        // Check quality requirements
        if (requirements.quality) {
            const qualityResults = Array.from(results.values())
                .filter(r => r.quality !== undefined)
                .map(r => r.quality);
            if (qualityResults.length > 0) {
                const avgQuality = qualityResults.reduce((a, b) => a + b, 0) / qualityResults.length;
                if (avgQuality < requirements.quality) {
                    return false;
                }
            }
        }
        // Check confidence requirements
        if (requirements.confidence) {
            const confidenceResults = Array.from(results.values())
                .filter(r => r.confidence !== undefined)
                .map(r => r.confidence);
            if (confidenceResults.length > 0) {
                const avgConfidence = confidenceResults.reduce((a, b) => a + b, 0) / confidenceResults.length;
                if (avgConfidence < requirements.confidence) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Generate comprehensive explanation for orchestration
     */
    async generateOrchestrationExplanation(plan, results, consensus, learnings) {
        const explanations = [];
        // Explain plan execution
        explanations.push({
            title: 'Orchestration Plan',
            content: plan.reasoning.join('\n')
        });
        // Explain results from each tool
        for (const [tool, result] of results.entries()) {
            if (result.explanation) {
                explanations.push({
                    title: `${tool} Analysis`,
                    content: result.explanation
                });
            }
        }
        // Explain consensus if applied
        if (consensus) {
            explanations.push({
                title: 'Consensus Resolution',
                content: `Agreement Level: ${(consensus.agreement * 100).toFixed(0)}%\n` +
                    `Conflicts Resolved: ${consensus.conflicts.length}\n` +
                    `Confidence: ${(consensus.confidence * 100).toFixed(0)}%`
            });
            for (const conflict of consensus.conflicts) {
                explanations.push({
                    title: `Conflict: ${conflict.aspect}`,
                    content: `Resolution Method: ${conflict.resolution}\n` +
                        `Opinions: ${Array.from(conflict.toolOpinions.entries())
                            .map(([t, o]) => `${t}: ${JSON.stringify(o)}`)
                            .join('\n')}`
                });
            }
        }
        // Explain learnings
        if (learnings && learnings.length > 0) {
            explanations.push({
                title: 'Execution Insights',
                content: learnings.map(l => `${l.pattern}: ${l.observation}\n` +
                    `Impact: ${l.impact}\n` +
                    `${l.recommendation ? `Recommendation: ${l.recommendation}` : ''}`).join('\n\n')
            });
        }
        return explanations;
    }
    /**
     * Attempt recovery from orchestration failure
     */
    async attemptRecovery(plan, error, partialResults) {
        // Check if we have alternatives
        if (plan.alternatives && plan.alternatives.length > 0) {
            // Try first alternative
            const alternative = plan.alternatives[0];
            this.emit('orchestration:recovery', {
                planId: plan.id,
                reason: alternative.reason
            });
            // Create new plan with alternative stages
            const recoveryPlan = {
                ...plan,
                stages: alternative.stages,
                reasoning: [
                    ...plan.reasoning,
                    `Recovery: ${alternative.reason}`,
                    `Original error: ${error.message}`
                ]
            };
            try {
                return await this.execute(recoveryPlan);
            }
            catch (recoveryError) {
                // Recovery also failed
                return null;
            }
        }
        return null;
    }
    /**
     * Store orchestration result for learning
     */
    storeOrchestrationResult(task, result) {
        const key = `${task.type}-${task.requirements.quality || 'default'}`;
        if (!this.orchestrationHistory.has(key)) {
            this.orchestrationHistory.set(key, []);
        }
        this.orchestrationHistory.get(key).push(result);
        // Learn successful patterns
        if (result.success) {
            const tools = result.results.keys();
            this.successPatterns.set(key, Array.from(tools));
        }
        // Limit history size
        const history = this.orchestrationHistory.get(key);
        if (history.length > 100) {
            history.shift();
        }
    }
    /**
     * Find similar tasks from history
     */
    findSimilarTasks(task) {
        const key = `${task.type}-${task.requirements.quality || 'default'}`;
        return this.orchestrationHistory.get(key) || [];
    }
    /**
     * Extract successful patterns from history
     */
    extractSuccessfulPatterns(history) {
        const toolFrequency = new Map();
        for (const result of history) {
            if (result.success) {
                for (const tool of result.results.keys()) {
                    toolFrequency.set(tool, (toolFrequency.get(tool) || 0) + 1);
                }
            }
        }
        // Return tools used in >70% of successful runs
        const threshold = history.length * 0.7;
        return Array.from(toolFrequency.entries())
            .filter(([_, count]) => count >= threshold)
            .map(([tool, _]) => tool);
    }
    /**
     * Process insights from tools for learning
     */
    async processInsight(message) {
        // Store insights for pattern recognition
        const insight = {
            tool: message.from,
            type: message.data.type,
            confidence: message.confidence,
            timestamp: new Date()
        };
        // Update tool performance metrics based on insights
        const cap = this.toolCapabilities.get(message.from);
        if (cap && message.confidence > 0.8) {
            // Positive insight increases quality score
            cap.performance.qualityScore = Math.min(100, cap.performance.qualityScore * 1.01);
        }
    }
    /**
     * Handle tool failures intelligently
     */
    async handleToolFailure(message) {
        const failedTool = message.data.tool;
        const cap = this.toolCapabilities.get(failedTool);
        if (cap) {
            // Update success rate
            cap.performance.successRate *= 0.95;
            // Find alternative tool
            const alternative = this.selectFallbackTool(failedTool);
            if (alternative) {
                // Notify about fallback
                await this.messageBus.send({
                    from: 'orchestrator',
                    to: 'broadcast',
                    type: 'broadcast',
                    subject: 'fallback-activated',
                    confidence: 1,
                    data: {
                        failed: failedTool,
                        fallback: alternative
                    }
                });
            }
        }
    }
    /**
     * Coordinate consensus when requested
     */
    async coordinateConsensus(message) {
        const results = new Map(Object.entries(message.data.results));
        const consensus = await this.applyConsensus(results);
        // Send consensus result back
        await this.messageBus.send({
            from: 'orchestrator',
            to: message.from,
            type: 'response',
            subject: 'consensus-result',
            confidence: consensus.confidence || 0.8,
            data: consensus,
            inReplyTo: message.id
        });
    }
}
// Export for use
export default IntelligentOrchestrator;
//# sourceMappingURL=intelligent-orchestrator.js.map