/**
 * Tool Specialization System
 * Phase 3.3 of Master Evolution Plan
 *
 * This system allows tools to develop specialized expertise through experience,
 * evolve their capabilities based on success patterns, and dynamically adjust
 * their focus areas based on performance metrics.
 */
import { EventEmitter } from 'events';
import { PerformanceTracker, MessageBus } from '@j0kz/shared';
export class SpecializationSystem extends EventEmitter {
    toolProfiles = new Map();
    domainExperts = new Map(); // domain -> expert tools
    skillTree = new Map();
    certificationPrograms = new Map();
    performanceTracker;
    messageBus;
    // Learning parameters
    LEARNING_RATE = 0.1;
    DECAY_RATE = 0.05;
    SPECIALIZATION_THRESHOLD = 75; // Score needed to specialize
    EXPERT_THRESHOLD = 90; // Score needed for expert status
    constructor() {
        super();
        this.performanceTracker = new PerformanceTracker();
        this.messageBus = new MessageBus();
        this.initializeSkillTree();
        this.initializeCertifications();
        this.initializeToolProfiles();
    }
    /**
     * Initialize skill tree with dependencies
     */
    initializeSkillTree() {
        // Code analysis skills
        this.addSkillNode('basic-analysis', {
            name: 'Basic Code Analysis',
            category: 'analysis',
            difficulty: 1,
            prerequisites: [],
            unlocks: ['pattern-detection', 'metrics-calculation']
        });
        this.addSkillNode('pattern-detection', {
            name: 'Pattern Detection',
            category: 'analysis',
            difficulty: 2,
            prerequisites: ['basic-analysis'],
            unlocks: ['anti-pattern-detection', 'design-pattern-application']
        });
        this.addSkillNode('anti-pattern-detection', {
            name: 'Anti-Pattern Detection',
            category: 'analysis',
            difficulty: 3,
            prerequisites: ['pattern-detection'],
            unlocks: ['refactoring-suggestions']
        });
        // Security skills
        this.addSkillNode('basic-security', {
            name: 'Basic Security Scanning',
            category: 'security',
            difficulty: 1,
            prerequisites: [],
            unlocks: ['vulnerability-detection', 'secret-scanning']
        });
        this.addSkillNode('vulnerability-detection', {
            name: 'Vulnerability Detection',
            category: 'security',
            difficulty: 2,
            prerequisites: ['basic-security'],
            unlocks: ['owasp-compliance', 'threat-modeling']
        });
        this.addSkillNode('threat-modeling', {
            name: 'Threat Modeling',
            category: 'security',
            difficulty: 4,
            prerequisites: ['vulnerability-detection'],
            unlocks: ['security-architecture']
        });
        // Testing skills
        this.addSkillNode('unit-testing', {
            name: 'Unit Test Generation',
            category: 'testing',
            difficulty: 1,
            prerequisites: [],
            unlocks: ['integration-testing', 'edge-case-generation']
        });
        this.addSkillNode('edge-case-generation', {
            name: 'Edge Case Generation',
            category: 'testing',
            difficulty: 3,
            prerequisites: ['unit-testing'],
            unlocks: ['property-testing', 'fuzzing']
        });
        // Architecture skills
        this.addSkillNode('dependency-analysis', {
            name: 'Dependency Analysis',
            category: 'architecture',
            difficulty: 2,
            prerequisites: [],
            unlocks: ['circular-detection', 'layer-validation']
        });
        this.addSkillNode('layer-validation', {
            name: 'Layer Validation',
            category: 'architecture',
            difficulty: 3,
            prerequisites: ['dependency-analysis'],
            unlocks: ['architecture-patterns', 'microservice-design']
        });
        // Refactoring skills
        this.addSkillNode('basic-refactoring', {
            name: 'Basic Refactoring',
            category: 'refactoring',
            difficulty: 1,
            prerequisites: [],
            unlocks: ['complex-refactoring', 'pattern-application']
        });
        this.addSkillNode('pattern-application', {
            name: 'Design Pattern Application',
            category: 'refactoring',
            difficulty: 3,
            prerequisites: ['basic-refactoring', 'pattern-detection'],
            unlocks: ['architecture-refactoring']
        });
    }
    /**
     * Add skill node to tree
     */
    addSkillNode(id, node) {
        this.skillTree.set(id, node);
    }
    /**
     * Initialize certification programs
     */
    initializeCertifications() {
        // Security Expert Certification
        this.certificationPrograms.set('security-expert', {
            name: 'Security Expert',
            domain: 'security',
            requirements: [
                { type: 'tasks', target: 100, description: 'Complete 100 security tasks' },
                { type: 'success-rate', target: 0.95, description: '95% success rate' },
                { type: 'skill-level', target: 90, description: 'Achieve level 90 in vulnerability detection', skill: 'vulnerability-detection' },
                { type: 'skill-level', target: 85, description: 'Achieve level 85 in threat modeling', skill: 'threat-modeling' }
            ],
            benefits: [
                'Priority assignment for security tasks',
                '20% confidence boost in security domain',
                'Mentor status for other tools'
            ]
        });
        // Testing Master Certification
        this.certificationPrograms.set('testing-master', {
            name: 'Testing Master',
            domain: 'testing',
            requirements: [
                { type: 'tasks', target: 150, description: 'Complete 150 testing tasks' },
                { type: 'success-rate', target: 0.90, description: '90% success rate' },
                { type: 'skill-level', target: 95, description: 'Achieve level 95 in unit testing', skill: 'unit-testing' },
                { type: 'skill-level', target: 85, description: 'Achieve level 85 in edge case generation', skill: 'edge-case-generation' }
            ],
            benefits: [
                'Automatic edge case generation capability',
                'Test strategy planning authority',
                'Coverage guarantee certification'
            ]
        });
        // Architecture Guru Certification
        this.certificationPrograms.set('architecture-guru', {
            name: 'Architecture Guru',
            domain: 'architecture',
            requirements: [
                { type: 'tasks', target: 75, description: 'Complete 75 architecture tasks' },
                { type: 'success-rate', target: 0.92, description: '92% success rate' },
                { type: 'skill-level', target: 90, description: 'Achieve level 90 in layer validation', skill: 'layer-validation' },
                { type: 'skill-level', target: 88, description: 'Achieve level 88 in architecture patterns', skill: 'architecture-patterns' }
            ],
            benefits: [
                'System design decision authority',
                'Cross-tool architecture coordination',
                'Performance optimization privileges'
            ]
        });
        // Code Quality Champion
        this.certificationPrograms.set('quality-champion', {
            name: 'Code Quality Champion',
            domain: 'quality',
            requirements: [
                { type: 'tasks', target: 200, description: 'Complete 200 quality tasks' },
                { type: 'success-rate', target: 0.93, description: '93% success rate' },
                { type: 'skill-level', target: 92, description: 'Achieve level 92 in anti-pattern detection', skill: 'anti-pattern-detection' },
                { type: 'skill-level', target: 90, description: 'Achieve level 90 in refactoring suggestions', skill: 'refactoring-suggestions' }
            ],
            benefits: [
                'Final say in code quality disputes',
                'Automated fix application authority',
                'Quality gate configuration'
            ]
        });
    }
    /**
     * Initialize tool profiles with starting specializations
     */
    initializeToolProfiles() {
        // Smart Reviewer Profile
        this.createToolProfile('smart-reviewer', {
            primaryFocus: 'code-quality',
            specializations: [
                this.createSpecialization('code-quality', 'quality', 75),
                this.createSpecialization('pattern-detection', 'analysis', 70),
                this.createSpecialization('metrics', 'analysis', 65)
            ],
            learningStyle: 'specialist',
            strengthAreas: ['analysis', 'quality', 'patterns']
        });
        // Security Scanner Profile
        this.createToolProfile('security-scanner', {
            primaryFocus: 'vulnerability-detection',
            specializations: [
                this.createSpecialization('vulnerability-detection', 'security', 85),
                this.createSpecialization('compliance', 'security', 80),
                this.createSpecialization('secret-scanning', 'security', 75)
            ],
            learningStyle: 'specialist',
            strengthAreas: ['security', 'compliance', 'risk']
        });
        // Test Generator Profile
        this.createToolProfile('test-generator', {
            primaryFocus: 'test-creation',
            specializations: [
                this.createSpecialization('unit-testing', 'testing', 70),
                this.createSpecialization('edge-cases', 'testing', 65),
                this.createSpecialization('mocking', 'testing', 60)
            ],
            learningStyle: 'steady-improver',
            strengthAreas: ['testing', 'coverage', 'validation']
        });
        // Architecture Analyzer Profile
        this.createToolProfile('architecture-analyzer', {
            primaryFocus: 'dependency-analysis',
            specializations: [
                this.createSpecialization('dependency-analysis', 'architecture', 80),
                this.createSpecialization('circular-detection', 'architecture', 75),
                this.createSpecialization('layer-validation', 'architecture', 70)
            ],
            learningStyle: 'specialist',
            strengthAreas: ['architecture', 'structure', 'design']
        });
        // Refactor Assistant Profile
        this.createToolProfile('refactor-assistant', {
            primaryFocus: 'code-transformation',
            specializations: [
                this.createSpecialization('refactoring', 'refactoring', 75),
                this.createSpecialization('pattern-application', 'refactoring', 70),
                this.createSpecialization('complexity-reduction', 'refactoring', 68)
            ],
            learningStyle: 'fast-learner',
            strengthAreas: ['refactoring', 'patterns', 'optimization']
        });
        // Doc Generator Profile
        this.createToolProfile('doc-generator', {
            primaryFocus: 'documentation',
            specializations: [
                this.createSpecialization('api-docs', 'documentation', 80),
                this.createSpecialization('readme-generation', 'documentation', 75),
                this.createSpecialization('changelog', 'documentation', 70)
            ],
            learningStyle: 'generalist',
            strengthAreas: ['documentation', 'communication', 'clarity']
        });
    }
    /**
     * Create tool profile
     */
    createToolProfile(toolId, config) {
        const profile = {
            toolId,
            specializations: new Map(),
            primaryFocus: config.primaryFocus,
            secondaryFocus: config.specializations.map((s) => s.name).slice(1),
            learningStyle: {
                type: config.learningStyle,
                preferredDomains: config.strengthAreas,
                strengthAreas: config.strengthAreas,
                improvementAreas: [],
                adaptabilityScore: config.learningStyle === 'fast-learner' ? 85 : 70
            },
            performanceHistory: [],
            evolutionPath: []
        };
        // Add specializations
        for (const spec of config.specializations) {
            profile.specializations.set(spec.id, spec);
        }
        this.toolProfiles.set(toolId, profile);
        // Update domain experts
        for (const spec of config.specializations) {
            this.addDomainExpert(spec.domain, toolId);
        }
    }
    /**
     * Create specialization
     */
    createSpecialization(name, domain, level) {
        return {
            id: `${name}-${Date.now()}`,
            name,
            domain,
            level,
            experience: Math.floor(level * 10), // Estimate based on level
            successRate: level / 100,
            recentPerformance: Array(10).fill(level),
            skills: this.getSkillsForSpecialization(name, level),
            certifications: [],
            trainingPath: this.createTrainingPath(name, level)
        };
    }
    /**
     * Get skills for specialization
     */
    getSkillsForSpecialization(name, level) {
        const skills = [];
        // Map specialization to relevant skills
        const skillMap = {
            'code-quality': ['basic-analysis', 'pattern-detection', 'anti-pattern-detection'],
            'vulnerability-detection': ['basic-security', 'vulnerability-detection', 'threat-modeling'],
            'unit-testing': ['unit-testing', 'edge-case-generation'],
            'dependency-analysis': ['dependency-analysis', 'circular-detection'],
            'refactoring': ['basic-refactoring', 'pattern-application']
        };
        const relevantSkills = skillMap[name] || ['basic-analysis'];
        for (const skillName of relevantSkills) {
            const node = this.skillTree.get(skillName);
            if (node) {
                skills.push({
                    name: node.name,
                    proficiency: level - (node.difficulty * 10), // Adjust by difficulty
                    lastUsed: new Date(),
                    improvementRate: 0.1,
                    dependencies: node.prerequisites
                });
            }
        }
        return skills;
    }
    /**
     * Create training path
     */
    createTrainingPath(specialization, currentLevel) {
        const nextLevel = this.getNextLevel(currentLevel);
        return {
            currentLevel: this.getLevelName(currentLevel),
            nextLevel: this.getLevelName(nextLevel),
            progress: (currentLevel % 10) * 10, // Progress to next 10-level milestone
            requirements: [
                {
                    type: 'tasks',
                    target: Math.floor((nextLevel - currentLevel) * 5),
                    description: `Complete ${Math.floor((nextLevel - currentLevel) * 5)} tasks`,
                    current: 0,
                    met: false
                },
                {
                    type: 'success-rate',
                    target: nextLevel / 100,
                    description: `Achieve ${(nextLevel / 100 * 100).toFixed(0)}% success rate`,
                    current: currentLevel / 100,
                    met: currentLevel >= nextLevel
                }
            ],
            estimatedTime: (nextLevel - currentLevel) * 2 // Hours
        };
    }
    /**
     * Get next level milestone
     */
    getNextLevel(current) {
        if (current < 50)
            return 50;
        if (current < 70)
            return 70;
        if (current < 85)
            return 85;
        if (current < 95)
            return 95;
        return 100;
    }
    /**
     * Get level name
     */
    getLevelName(level) {
        if (level < 30)
            return 'Novice';
        if (level < 50)
            return 'Apprentice';
        if (level < 70)
            return 'Journeyman';
        if (level < 85)
            return 'Expert';
        if (level < 95)
            return 'Master';
        return 'Grandmaster';
    }
    /**
     * Add domain expert
     */
    addDomainExpert(domain, toolId) {
        if (!this.domainExperts.has(domain)) {
            this.domainExperts.set(domain, []);
        }
        const experts = this.domainExperts.get(domain);
        if (!experts.includes(toolId)) {
            experts.push(toolId);
        }
    }
    /**
     * Assign task to most suitable tool
     */
    async assignTask(requirements) {
        const candidates = this.findCandidates(requirements);
        const selected = this.selectBestCandidate(candidates, requirements);
        const assignment = {
            taskId: `task-${Date.now()}`,
            taskType: requirements.domain,
            requirements,
            candidates,
            selected: selected.toolId,
            reasoning: this.explainSelection(selected, candidates, requirements)
        };
        // Notify selected tool
        await this.messageBus.shareInsight('specialization-system', {
            type: 'task-assignment',
            data: assignment,
            confidence: selected.estimatedSuccess,
            affects: [selected.toolId]
        });
        this.emit('task:assigned', assignment);
        return assignment;
    }
    /**
     * Find candidate tools for task
     */
    findCandidates(requirements) {
        const candidates = [];
        for (const [toolId, profile] of this.toolProfiles.entries()) {
            const matchScore = this.calculateMatchScore(profile, requirements);
            if (matchScore > 30) { // Minimum threshold
                candidates.push({
                    toolId,
                    matchScore,
                    specializations: Array.from(profile.specializations.keys()),
                    availability: this.calculateAvailability(toolId),
                    recentPerformance: this.calculateRecentPerformance(profile),
                    estimatedSuccess: this.estimateSuccess(profile, requirements)
                });
            }
        }
        // Sort by match score
        candidates.sort((a, b) => b.matchScore - a.matchScore);
        return candidates;
    }
    /**
     * Calculate match score for tool and requirements
     */
    calculateMatchScore(profile, requirements) {
        let score = 0;
        // Domain match
        for (const [_, spec] of profile.specializations.entries()) {
            if (spec.domain === requirements.domain) {
                score += spec.level * 0.5;
            }
        }
        // Skill match
        for (const requiredSkill of requirements.skillsRequired || []) {
            for (const [_, spec] of profile.specializations.entries()) {
                const skill = spec.skills.find(s => s.name.toLowerCase().includes(requiredSkill.toLowerCase()));
                if (skill) {
                    score += skill.proficiency * 0.3;
                }
            }
        }
        // Preferred specialization match
        if (requirements.preferredSpecializations) {
            for (const preferred of requirements.preferredSpecializations) {
                if (profile.specializations.has(preferred)) {
                    score += 20;
                }
            }
        }
        // Complexity handling
        const complexityScore = this.getComplexityScore(profile, requirements.complexity);
        score *= complexityScore;
        // Recent performance bonus
        const recentPerf = this.calculateRecentPerformance(profile);
        score *= (recentPerf / 100);
        return Math.min(score, 100);
    }
    /**
     * Get complexity handling score
     */
    getComplexityScore(profile, complexity) {
        const avgLevel = this.getAverageSpecializationLevel(profile);
        switch (complexity) {
            case 'simple': return 1.0;
            case 'moderate': return avgLevel > 50 ? 1.0 : 0.8;
            case 'complex': return avgLevel > 70 ? 1.0 : 0.6;
            case 'expert': return avgLevel > 85 ? 1.0 : 0.4;
            default: return 0.8;
        }
    }
    /**
     * Get average specialization level
     */
    getAverageSpecializationLevel(profile) {
        if (profile.specializations.size === 0)
            return 0;
        let total = 0;
        for (const [_, spec] of profile.specializations.entries()) {
            total += spec.level;
        }
        return total / profile.specializations.size;
    }
    /**
     * Calculate tool availability
     */
    calculateAvailability(toolId) {
        // In real system, would check current workload
        // For now, simulate with random availability
        return 0.7 + Math.random() * 0.3;
    }
    /**
     * Calculate recent performance
     */
    calculateRecentPerformance(profile) {
        const recent = profile.performanceHistory.slice(-10);
        if (recent.length === 0)
            return 70; // Default
        const totalScore = recent.reduce((sum, record) => sum + record.score, 0);
        return totalScore / recent.length;
    }
    /**
     * Estimate success probability
     */
    estimateSuccess(profile, requirements) {
        const matchScore = this.calculateMatchScore(profile, requirements);
        const recentPerformance = this.calculateRecentPerformance(profile);
        const specializationBonus = this.getSpecializationBonus(profile, requirements.domain);
        // Weighted combination
        const estimate = (matchScore * 0.4 + recentPerformance * 0.4 + specializationBonus * 0.2) / 100;
        return Math.min(estimate, 0.95); // Cap at 95%
    }
    /**
     * Get specialization bonus for domain
     */
    getSpecializationBonus(profile, domain) {
        let maxBonus = 0;
        for (const [_, spec] of profile.specializations.entries()) {
            if (spec.domain === domain) {
                maxBonus = Math.max(maxBonus, spec.level);
            }
        }
        return maxBonus;
    }
    /**
     * Select best candidate
     */
    selectBestCandidate(candidates, requirements) {
        if (candidates.length === 0) {
            throw new Error('No suitable candidates found');
        }
        // Score each candidate
        const scored = candidates.map(candidate => ({
            candidate,
            score: this.scoreCandidateForSelection(candidate, requirements)
        }));
        // Sort by score
        scored.sort((a, b) => b.score - a.score);
        return scored[0].candidate;
    }
    /**
     * Score candidate for final selection
     */
    scoreCandidateForSelection(candidate, requirements) {
        // Weighted scoring
        const matchWeight = 0.35;
        const successWeight = 0.30;
        const performanceWeight = 0.20;
        const availabilityWeight = 0.15;
        return (candidate.matchScore * matchWeight +
            candidate.estimatedSuccess * 100 * successWeight +
            candidate.recentPerformance * performanceWeight +
            candidate.availability * 100 * availabilityWeight);
    }
    /**
     * Explain selection reasoning
     */
    explainSelection(selected, candidates, requirements) {
        const reasoning = [];
        reasoning.push(`Selected ${selected.toolId} from ${candidates.length} candidates`);
        reasoning.push(`Match Score: ${selected.matchScore.toFixed(1)}/100`);
        reasoning.push(`Estimated Success: ${(selected.estimatedSuccess * 100).toFixed(1)}%`);
        reasoning.push(`Recent Performance: ${selected.recentPerformance.toFixed(1)}/100`);
        // Compare to next best
        if (candidates.length > 1) {
            const nextBest = candidates[1];
            reasoning.push(`Next best option: ${nextBest.toolId} (${nextBest.matchScore.toFixed(1)} match)`);
        }
        // Specialization match
        const profile = this.toolProfiles.get(selected.toolId);
        if (profile) {
            for (const [_, spec] of profile.specializations.entries()) {
                if (spec.domain === requirements.domain) {
                    reasoning.push(`Specialization in ${spec.name}: Level ${spec.level}/100`);
                }
            }
        }
        return reasoning;
    }
    /**
     * Record task outcome and update specializations
     */
    async recordOutcome(toolId, task) {
        const profile = this.toolProfiles.get(toolId);
        if (!profile)
            return;
        // Record performance
        const record = {
            timestamp: new Date(),
            task: `${task.domain}-${task.complexity}`,
            domain: task.domain,
            success: task.success,
            score: task.score,
            feedback: task.feedback,
            learnings: task.learnings || []
        };
        profile.performanceHistory.push(record);
        // Update specializations
        await this.updateSpecializations(profile, task);
        // Check for skill improvements
        await this.updateSkills(profile, task);
        // Check for certifications
        await this.checkCertifications(profile);
        // Check for evolution events
        await this.checkEvolution(profile, task);
        // Update domain experts if needed
        this.updateDomainExperts();
        // Emit update event
        this.emit('profile:updated', { toolId, profile });
    }
    /**
     * Update specializations based on task outcome
     */
    async updateSpecializations(profile, task) {
        for (const [id, spec] of profile.specializations.entries()) {
            if (spec.domain === task.domain) {
                // Update experience
                spec.experience++;
                // Update level based on performance
                const levelChange = this.calculateLevelChange(task.success, task.score, spec.level);
                spec.level = Math.max(0, Math.min(100, spec.level + levelChange));
                // Update success rate (moving average)
                spec.successRate = (spec.successRate * 0.9) + (task.success ? 0.1 : 0);
                // Update recent performance
                spec.recentPerformance.push(task.score);
                if (spec.recentPerformance.length > 10) {
                    spec.recentPerformance.shift();
                }
                // Update training path
                spec.trainingPath = this.createTrainingPath(spec.name, spec.level);
            }
        }
    }
    /**
     * Calculate level change based on performance
     */
    calculateLevelChange(success, score, currentLevel) {
        if (!success) {
            // Failure reduces level slightly
            return -1 * this.DECAY_RATE * currentLevel;
        }
        // Success increases level based on score and learning rate
        const performanceRatio = score / 100;
        const learningBonus = this.LEARNING_RATE * (100 - currentLevel); // Harder to improve at higher levels
        return performanceRatio * learningBonus;
    }
    /**
     * Update skills based on task
     */
    async updateSkills(profile, task) {
        for (const [_, spec] of profile.specializations.entries()) {
            if (spec.domain === task.domain) {
                for (const skill of spec.skills) {
                    // Update last used
                    skill.lastUsed = new Date();
                    // Update proficiency
                    if (task.success) {
                        skill.proficiency = Math.min(100, skill.proficiency + skill.improvementRate * task.score);
                        // Adjust improvement rate based on consistency
                        if (task.score > 80) {
                            skill.improvementRate = Math.min(0.3, skill.improvementRate * 1.05);
                        }
                    }
                    else {
                        // Reduce proficiency slightly on failure
                        skill.proficiency = Math.max(0, skill.proficiency - skill.improvementRate * 10);
                    }
                }
            }
        }
    }
    /**
     * Check for new certifications
     */
    async checkCertifications(profile) {
        for (const [certId, program] of this.certificationPrograms.entries()) {
            // Check if already certified
            const hasCert = Array.from(profile.specializations.values()).some(spec => spec.certifications.some(c => c.name === program.name));
            if (!hasCert) {
                // Check requirements
                const met = this.checkCertificationRequirements(profile, program);
                if (met) {
                    // Award certification
                    await this.awardCertification(profile, program);
                }
            }
        }
    }
    /**
     * Check certification requirements
     */
    checkCertificationRequirements(profile, program) {
        for (const req of program.requirements) {
            switch (req.type) {
                case 'tasks':
                    const taskCount = profile.performanceHistory.filter(r => r.domain === program.domain).length;
                    if (taskCount < req.target)
                        return false;
                    break;
                case 'success-rate':
                    const domainRecords = profile.performanceHistory.filter(r => r.domain === program.domain);
                    if (domainRecords.length > 0) {
                        const successRate = domainRecords.filter(r => r.success).length / domainRecords.length;
                        if (successRate < req.target)
                            return false;
                    }
                    else {
                        return false;
                    }
                    break;
                case 'skill-level':
                    let hasSkill = false;
                    for (const [_, spec] of profile.specializations.entries()) {
                        const skill = spec.skills.find(s => s.name.toLowerCase().includes(req.skill.toLowerCase()));
                        if (skill && skill.proficiency >= req.target) {
                            hasSkill = true;
                            break;
                        }
                    }
                    if (!hasSkill)
                        return false;
                    break;
            }
        }
        return true;
    }
    /**
     * Award certification to tool
     */
    async awardCertification(profile, program) {
        const certification = {
            name: program.name,
            domain: program.domain,
            achievedAt: new Date(),
            requirements: program.requirements.map(r => ({
                type: r.type,
                target: r.target,
                description: r.description,
                skill: r.skill,
                current: r.target,
                met: true
            }))
        };
        // Add to relevant specialization
        for (const [_, spec] of profile.specializations.entries()) {
            if (spec.domain === program.domain) {
                spec.certifications.push(certification);
                break;
            }
        }
        // Record evolution event
        profile.evolutionPath.push({
            timestamp: new Date(),
            type: 'certification',
            description: `Achieved ${program.name} certification`,
            impact: 'major'
        });
        // Notify system
        await this.messageBus.send({
            from: 'specialization-system',
            to: 'broadcast',
            type: 'broadcast',
            subject: 'certification-achieved',
            confidence: 1,
            data: {
                toolId: profile.toolId,
                certification: program.name,
                benefits: program.benefits
            }
        });
        this.emit('certification:achieved', {
            toolId: profile.toolId,
            certification: program.name
        });
    }
    /**
     * Check for evolution events
     */
    async checkEvolution(profile, task) {
        // Check for level-up
        for (const [_, spec] of profile.specializations.entries()) {
            const oldLevel = this.getLevelName(spec.level - this.calculateLevelChange(task.success, task.score, spec.level));
            const newLevel = this.getLevelName(spec.level);
            if (oldLevel !== newLevel) {
                profile.evolutionPath.push({
                    timestamp: new Date(),
                    type: 'level-up',
                    description: `Advanced to ${newLevel} in ${spec.name}`,
                    impact: 'moderate'
                });
            }
        }
        // Check for new skills
        if (task.learnings && task.learnings.length > 0) {
            profile.evolutionPath.push({
                timestamp: new Date(),
                type: 'skill-gained',
                description: `Learned: ${task.learnings.join(', ')}`,
                impact: 'minor'
            });
        }
        // Check for specialization change
        if (this.shouldChangeSpecialization(profile)) {
            await this.suggestSpecializationChange(profile);
        }
    }
    /**
     * Check if tool should change specialization
     */
    shouldChangeSpecialization(profile) {
        // Check if performance in non-primary areas is consistently better
        const primarySpec = profile.specializations.get(profile.primaryFocus);
        if (!primarySpec)
            return false;
        for (const [id, spec] of profile.specializations.entries()) {
            if (id !== profile.primaryFocus) {
                // If another specialization is 20+ points higher
                if (spec.level > primarySpec.level + 20) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Suggest specialization change
     */
    async suggestSpecializationChange(profile) {
        // Find highest level specialization
        let bestSpec = null;
        let bestLevel = 0;
        for (const [_, spec] of profile.specializations.entries()) {
            if (spec.level > bestLevel) {
                bestLevel = spec.level;
                bestSpec = spec;
            }
        }
        if (bestSpec && bestSpec.name !== profile.primaryFocus) {
            profile.evolutionPath.push({
                timestamp: new Date(),
                type: 'specialization-change',
                description: `Primary focus shifted from ${profile.primaryFocus} to ${bestSpec.name}`,
                impact: 'major'
            });
            // Update primary focus
            const oldPrimary = profile.primaryFocus;
            profile.primaryFocus = bestSpec.name;
            profile.secondaryFocus = [oldPrimary, ...profile.secondaryFocus.filter(f => f !== bestSpec.name)];
            await this.messageBus.shareInsight('specialization-system', {
                type: 'specialization-change',
                data: {
                    toolId: profile.toolId,
                    oldFocus: oldPrimary,
                    newFocus: bestSpec.name,
                    reason: `Superior performance in ${bestSpec.name} (Level ${bestLevel})`
                },
                confidence: bestLevel / 100,
                affects: ['orchestrator']
            });
        }
    }
    /**
     * Update domain experts list
     */
    updateDomainExperts() {
        // Clear and rebuild
        this.domainExperts.clear();
        for (const [toolId, profile] of this.toolProfiles.entries()) {
            for (const [_, spec] of profile.specializations.entries()) {
                if (spec.level >= this.EXPERT_THRESHOLD) {
                    this.addDomainExpert(spec.domain, toolId);
                }
            }
        }
    }
    /**
     * Get domain experts
     */
    getDomainExperts(domain) {
        return this.domainExperts.get(domain) || [];
    }
    /**
     * Get tool capabilities summary
     */
    getToolCapabilities(toolId) {
        const profile = this.toolProfiles.get(toolId);
        if (!profile)
            return null;
        // Get top skills
        const allSkills = [];
        for (const [_, spec] of profile.specializations.entries()) {
            allSkills.push(...spec.skills);
        }
        const topSkills = allSkills
            .sort((a, b) => b.proficiency - a.proficiency)
            .slice(0, 5);
        // Get all certifications
        const certifications = [];
        for (const [_, spec] of profile.specializations.entries()) {
            certifications.push(...spec.certifications);
        }
        return {
            specializations: Array.from(profile.specializations.values()),
            certifications,
            topSkills,
            performance: this.calculateRecentPerformance(profile),
            evolution: profile.evolutionPath.slice(-10) // Last 10 events
        };
    }
    /**
     * Generate specialization report
     */
    generateReport() {
        const domainCoverage = new Map();
        const certificationStats = new Map();
        const performers = [];
        // Calculate statistics
        for (const [toolId, profile] of this.toolProfiles.entries()) {
            // Domain coverage
            for (const [_, spec] of profile.specializations.entries()) {
                const current = domainCoverage.get(spec.domain) || 0;
                domainCoverage.set(spec.domain, Math.max(current, spec.level));
            }
            // Certification stats
            for (const [_, spec] of profile.specializations.entries()) {
                for (const cert of spec.certifications) {
                    certificationStats.set(cert.name, (certificationStats.get(cert.name) || 0) + 1);
                }
            }
            // Performance ranking
            performers.push({
                toolId,
                score: this.calculateRecentPerformance(profile)
            });
        }
        // Sort performers
        performers.sort((a, b) => b.score - a.score);
        return {
            toolProfiles: this.toolProfiles,
            domainCoverage,
            certificationStats,
            topPerformers: performers.slice(0, 5)
        };
    }
}
// Export for use
export default SpecializationSystem;
//# sourceMappingURL=specialization-system.js.map