/**
 * Learning Engine
 * Phase 4.1 of Master Evolution Plan
 *
 * Implements machine learning from outcomes exactly as specified in the plan.
 * Learns from every decision, retrains periodically, identifies patterns,
 * and updates strategies autonomously.
 */
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
export class LearningEngine extends EventEmitter {
    history = new Map();
    patterns = [];
    model;
    strategyWeights = new Map();
    // Learning parameters from plan
    RETRAIN_INTERVAL = 100; // Retrain every 100 decisions
    PATTERN_SIGNIFICANCE_THRESHOLD = 0.8;
    LEARNING_RATE = 0.01;
    MOMENTUM = 0.9;
    dataPath;
    constructor(dataPath = './learning-data') {
        super();
        this.dataPath = dataPath;
        this.model = new SimpleNeuralNetwork({
            inputSize: 20, // Feature vector size
            hiddenLayers: [50, 30, 10],
            outputSize: 5, // Action classifications
            learningRate: this.LEARNING_RATE,
            momentum: this.MOMENTUM,
        });
        this.initializeStrategies();
    }
    /**
     * Initialize strategy weights
     */
    initializeStrategies() {
        // Initialize with equal weights
        const strategies = [
            'pattern-matching',
            'similarity-search',
            'heuristic-rules',
            'neural-network',
            'ensemble-voting',
        ];
        for (const strategy of strategies) {
            this.strategyWeights.set(strategy, 1.0);
        }
    }
    /**
     * Learn from a decision and its outcome
     * This is the core learning loop from the plan
     */
    async learn(decision, outcome) {
        // Store experience
        this.history.set(decision.id, { decision, outcome });
        // Persist to disk for long-term learning
        await this.persistExperience(decision, outcome);
        // Update model if enough data
        if (this.history.size % this.RETRAIN_INTERVAL === 0) {
            await this.retrain();
            this.emit('model:retrained', { historySize: this.history.size });
        }
        // Identify patterns
        const patterns = await this.identifyPatterns();
        // Update strategies if significant patterns found
        for (const pattern of patterns) {
            if (pattern.significance > this.PATTERN_SIGNIFICANCE_THRESHOLD) {
                await this.updateStrategies(pattern);
                this.emit('pattern:discovered', pattern);
            }
        }
        // Emit learning event
        this.emit('learning:completed', {
            decisionId: decision.id,
            success: outcome.success,
            patternsFound: patterns.length,
        });
    }
    /**
     * Persist experience to disk
     */
    async persistExperience(decision, outcome) {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
            const experiencePath = path.join(this.dataPath, 'experiences.jsonl');
            const experience = { decision, outcome, timestamp: new Date() };
            await fs.appendFile(experiencePath, JSON.stringify(experience) + '\n');
        }
        catch (error) {
            console.error('Failed to persist experience:', error);
        }
    }
    /**
     * Retrain model on accumulated experiences
     */
    async retrain() {
        const startTime = Date.now();
        // Prepare training data
        const trainingData = [];
        for (const { decision, outcome } of this.history.values()) {
            const input = decision.features;
            const output = this.outcomeToVector(outcome);
            trainingData.push({ input, output });
        }
        // Train neural network
        const epochs = Math.min(100, Math.floor(trainingData.length / 10));
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;
            // Shuffle training data
            const shuffled = this.shuffle(trainingData);
            for (const sample of shuffled) {
                const loss = this.model.train(this.vectorToArray(sample.input), sample.output);
                totalLoss += loss;
            }
            const avgLoss = totalLoss / shuffled.length;
            if (epoch % 10 === 0) {
                this.emit('training:progress', { epoch, loss: avgLoss });
            }
        }
        const duration = Date.now() - startTime;
        this.emit('training:complete', {
            samples: trainingData.length,
            epochs,
            duration,
        });
    }
    /**
     * Convert outcome to vector for training
     */
    outcomeToVector(outcome) {
        return [
            outcome.success ? 1 : 0,
            outcome.metrics.accuracy,
            outcome.metrics.quality / 100,
            Math.min(outcome.metrics.performance / 1000, 1), // Normalize to 0-1
            outcome.feedback?.rating ? outcome.feedback.rating / 5 : 0.5,
        ];
    }
    /**
     * Convert feature vector to array
     */
    vectorToArray(features) {
        const array = new Array(20).fill(0);
        let i = 0;
        for (const value of Object.values(features)) {
            if (i < 20) {
                array[i++] = typeof value === 'number' ? value : 0;
            }
        }
        return array;
    }
    /**
     * Shuffle array using Fisher-Yates
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    /**
     * Identify patterns in decision history
     */
    async identifyPatterns() {
        const newPatterns = [];
        // Group decisions by success/failure
        const successful = Array.from(this.history.values()).filter(h => h.outcome.success);
        const failed = Array.from(this.history.values()).filter(h => !h.outcome.success);
        // Find common features in successful decisions
        const successFeatures = this.findCommonFeatures(successful.map(h => h.decision));
        for (const [feature, value] of successFeatures) {
            // Check if this feature is rare in failures
            const failureRate = this.getFeatureRate(failed.map(h => h.decision), feature, value);
            const successRate = this.getFeatureRate(successful.map(h => h.decision), feature, value);
            if (successRate > 0.7 && failureRate < 0.3) {
                const pattern = {
                    name: `high-success-when-${feature}-${value}`,
                    description: `Success rate is ${(successRate * 100).toFixed(0)}% when ${feature} = ${value}`,
                    conditions: [{ feature, operator: 'eq', value }],
                    action: 'prefer-this-approach',
                    significance: successRate - failureRate,
                    confidence: Math.min(successful.length, failed.length) / 10, // More examples = more confidence
                    examples: successful.filter(h => this.matchesCondition(h.decision.features, { feature, operator: 'eq', value })).length,
                };
                newPatterns.push(pattern);
            }
        }
        // Add to pattern library
        for (const pattern of newPatterns) {
            const existing = this.patterns.find(p => p.name === pattern.name);
            if (existing) {
                // Update existing pattern
                existing.confidence = (existing.confidence + pattern.confidence) / 2;
                existing.examples += pattern.examples;
            }
            else {
                this.patterns.push(pattern);
            }
        }
        return newPatterns;
    }
    /**
     * Find features that appear frequently
     */
    findCommonFeatures(decisions) {
        const featureCounts = new Map();
        for (const decision of decisions) {
            for (const [key, value] of Object.entries(decision.features)) {
                if (!featureCounts.has(key)) {
                    featureCounts.set(key, new Map());
                }
                const valueCounts = featureCounts.get(key);
                valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
            }
        }
        // Find most common value for each feature
        const commonFeatures = new Map();
        for (const [feature, valueCounts] of featureCounts.entries()) {
            let maxCount = 0;
            let commonValue;
            for (const [value, count] of valueCounts.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    commonValue = value;
                }
            }
            // Only include if it appears in >50% of decisions
            if (maxCount > decisions.length * 0.5) {
                commonFeatures.set(feature, commonValue);
            }
        }
        return commonFeatures;
    }
    /**
     * Get rate of feature value in decisions
     */
    getFeatureRate(decisions, feature, value) {
        if (decisions.length === 0)
            return 0;
        const matches = decisions.filter(d => d.features[feature] === value).length;
        return matches / decisions.length;
    }
    /**
     * Check if features match condition
     */
    matchesCondition(features, condition) {
        const value = features[condition.feature];
        if (value === undefined)
            return false;
        switch (condition.operator) {
            case 'eq':
                return value === condition.value;
            case 'gt':
                return value > condition.value;
            case 'lt':
                return value < condition.value;
            case 'gte':
                return value >= condition.value;
            case 'lte':
                return value <= condition.value;
            case 'in':
                return Array.isArray(condition.value) && Array.from(condition.value).includes(value);
            case 'contains': {
                if (typeof value !== 'string' || typeof condition.value !== 'string')
                    return false;
                const strValue = value;
                const strCondValue = condition.value;
                return strValue.includes(strCondValue);
            }
            default:
                return false;
        }
    }
    /**
     * Update strategies based on patterns
     */
    async updateStrategies(pattern) {
        // Determine which strategy would have caught this pattern
        const strategies = [
            { name: 'pattern-matching', score: this.scorePatternMatching(pattern) },
            { name: 'similarity-search', score: this.scoreSimilaritySearch(pattern) },
            { name: 'heuristic-rules', score: this.scoreHeuristicRules(pattern) },
            { name: 'neural-network', score: this.scoreNeuralNetwork(pattern) },
            { name: 'ensemble-voting', score: 0.5 }, // Always moderate
        ];
        // Increase weight of successful strategies
        for (const strategy of strategies) {
            const currentWeight = this.strategyWeights.get(strategy.name) || 1.0;
            // Adjust weight based on how well it would have done
            const adjustment = strategy.score * pattern.significance * 0.1;
            const newWeight = currentWeight * (1 + adjustment);
            this.strategyWeights.set(strategy.name, Math.max(0.1, Math.min(2.0, newWeight)));
        }
        // Normalize weights
        const totalWeight = Array.from(this.strategyWeights.values()).reduce((a, b) => a + b, 0);
        for (const [name, weight] of this.strategyWeights.entries()) {
            this.strategyWeights.set(name, (weight / totalWeight) * strategies.length);
        }
        this.emit('strategies:updated', {
            pattern: pattern.name,
            weights: Object.fromEntries(this.strategyWeights),
        });
    }
    /**
     * Score how well pattern-matching would have done
     */
    scorePatternMatching(pattern) {
        // Pattern matching excels at simple, clear patterns
        return pattern.conditions.length === 1 ? 0.9 : 0.6;
    }
    /**
     * Score how well similarity-search would have done
     */
    scoreSimilaritySearch(pattern) {
        // Similarity search good for complex multi-feature patterns
        return pattern.conditions.length > 3 ? 0.8 : 0.4;
    }
    /**
     * Score how well heuristic-rules would have done
     */
    scoreHeuristicRules(pattern) {
        // Heuristics good for domain-specific patterns
        return pattern.description.includes('domain') ? 0.85 : 0.5;
    }
    /**
     * Score how well neural-network would have done
     */
    scoreNeuralNetwork(pattern) {
        // Neural network good for subtle, complex patterns
        return pattern.significance > 0.9 ? 0.95 : 0.7;
    }
    /**
     * Predict best action for a situation using learned model
     */
    async predict(situation) {
        // Extract features from situation
        const features = this.extractFeatures(situation);
        // Use neural network prediction
        const nnPrediction = this.model.predict(this.vectorToArray(features));
        // Use pattern matching
        const patternPrediction = this.predictByPatterns(features);
        // Use similarity search
        const similarityPrediction = this.predictBySimilarity(features);
        // Ensemble voting weighted by strategy performance
        const predictions = [
            {
                method: 'neural-network',
                prediction: nnPrediction,
                weight: this.strategyWeights.get('neural-network') || 1,
            },
            {
                method: 'pattern-matching',
                prediction: patternPrediction,
                weight: this.strategyWeights.get('pattern-matching') || 1,
            },
            {
                method: 'similarity-search',
                prediction: similarityPrediction,
                weight: this.strategyWeights.get('similarity-search') || 1,
            },
        ];
        // Weighted average
        const bestAction = this.ensembleVote(predictions);
        // Explain prediction
        const explanation = this.explainPrediction(bestAction, features);
        return {
            action: bestAction.action,
            confidence: bestAction.confidence,
            expectedOutcome: bestAction.expectedOutcome,
            explanation,
            alternatives: bestAction.alternatives,
        };
    }
    /**
     * Extract features from situation
     */
    extractFeatures(situation) {
        const features = {};
        // Code complexity
        if (situation.code) {
            features.codeLength = situation.code.length / 1000; // Normalize
            features.lineCount = (situation.code.match(/\n/g) || []).length / 100;
            features.functionCount = (situation.code.match(/function |=> /g) || []).length / 10;
        }
        // Context features
        if (situation.context) {
            features.hasFramework = situation.context.framework ? 1 : 0;
            features.complexity = situation.context.complexity || 0.5;
            features.hasDomain = situation.context.domain ? 1 : 0;
        }
        // Temporal features
        const hour = new Date().getHours();
        features.timeOfDay = hour / 24; // 0-1
        features.isWeekend = new Date().getDay() % 6 === 0 ? 1 : 0;
        return features;
    }
    /**
     * Predict using pattern matching
     */
    predictByPatterns(features) {
        // Find matching patterns
        const matches = this.patterns.filter(pattern => pattern.conditions.every(condition => this.matchesCondition(features, condition)));
        if (matches.length === 0) {
            return { action: 'default', confidence: 0.3 };
        }
        // Use highest confidence pattern
        matches.sort((a, b) => b.confidence - a.confidence);
        const best = matches[0];
        return {
            action: best.action,
            confidence: best.confidence,
            expectedOutcome: {
                success: best.confidence,
                quality: 80,
                performance: 100,
            },
        };
    }
    /**
     * Predict using similarity to past decisions
     */
    predictBySimilarity(features) {
        // Find most similar past successful decision
        let bestSimilarity = 0;
        let bestDecision = null;
        for (const { decision, outcome } of this.history.values()) {
            if (!outcome.success)
                continue;
            const similarity = this.calculateSimilarity(features, decision.features);
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestDecision = decision;
            }
        }
        if (!bestDecision || bestSimilarity < 0.5) {
            return { action: 'explore', confidence: 0.4 };
        }
        return {
            action: bestDecision.operation,
            confidence: bestSimilarity * 0.8,
            expectedOutcome: {
                success: bestSimilarity,
                quality: 75,
                performance: 150,
            },
        };
    }
    /**
     * Calculate similarity between feature vectors
     */
    calculateSimilarity(f1, f2) {
        const keys = new Set([...Object.keys(f1), ...Object.keys(f2)]);
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        for (const key of keys) {
            const v1 = f1[key] || 0;
            const v2 = f2[key] || 0;
            dotProduct += v1 * v2;
            magnitude1 += v1 * v1;
            magnitude2 += v2 * v2;
        }
        if (magnitude1 === 0 || magnitude2 === 0)
            return 0;
        // Cosine similarity
        return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
    }
    /**
     * Ensemble voting from multiple predictions
     */
    ensembleVote(predictions) {
        const votes = new Map();
        for (const { method, prediction, weight } of predictions) {
            const action = prediction.action;
            if (!votes.has(action)) {
                votes.set(action, { weight: 0, data: prediction });
            }
            const vote = votes.get(action);
            vote.weight += weight * (prediction.confidence || 0.5);
        }
        // Find winner
        let bestAction = 'default';
        let bestWeight = 0;
        let bestData = null;
        for (const [action, vote] of votes.entries()) {
            if (vote.weight > bestWeight) {
                bestWeight = vote.weight;
                bestAction = action;
                bestData = vote.data;
            }
        }
        // Calculate confidence from weight distribution
        const totalWeight = Array.from(votes.values()).reduce((sum, v) => sum + v.weight, 0);
        const confidence = totalWeight > 0 ? bestWeight / totalWeight : 0.5;
        // Get alternatives
        const alternatives = Array.from(votes.entries())
            .filter(([action]) => action !== bestAction)
            .map(([action, vote]) => ({
            action,
            confidence: totalWeight > 0 ? vote.weight / totalWeight : 0,
            tradeoff: `Alternative approach with ${((vote.weight / totalWeight) * 100).toFixed(0)}% support`,
        }))
            .slice(0, 3);
        return {
            action: bestAction,
            confidence,
            expectedOutcome: bestData?.expectedOutcome || {
                success: confidence,
                quality: 70,
                performance: 200,
            },
            alternatives,
        };
    }
    /**
     * Explain prediction
     */
    explainPrediction(prediction, features) {
        const explanation = [];
        explanation.push(`Recommended action: ${prediction.action}`);
        explanation.push(`Confidence: ${(prediction.confidence * 100).toFixed(0)}%`);
        // Explain based on features
        const topFeatures = Object.entries(features)
            .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
            .slice(0, 3);
        explanation.push(`Key factors:`);
        for (const [feature, value] of topFeatures) {
            explanation.push(`  - ${feature}: ${typeof value === 'number' ? value.toFixed(2) : value}`);
        }
        // Explain expected outcome
        explanation.push(`Expected outcome:`);
        explanation.push(`  - Success probability: ${(prediction.expectedOutcome.success * 100).toFixed(0)}%`);
        explanation.push(`  - Quality score: ${prediction.expectedOutcome.quality}/100`);
        explanation.push(`  - Estimated time: ${prediction.expectedOutcome.performance}ms`);
        return explanation;
    }
    /**
     * Get learning statistics
     */
    getStatistics() {
        const total = this.history.size;
        const successful = Array.from(this.history.values()).filter(h => h.outcome.success).length;
        return {
            totalDecisions: total,
            successRate: total > 0 ? successful / total : 0,
            patternsDiscovered: this.patterns.length,
            modelAccuracy: this.estimateModelAccuracy(),
            strategyWeights: Object.fromEntries(this.strategyWeights),
        };
    }
    /**
     * Estimate model accuracy from recent predictions
     */
    estimateModelAccuracy() {
        // Would track actual predictions vs outcomes
        // For now, estimate based on pattern confidence
        if (this.patterns.length === 0)
            return 0.5;
        const avgConfidence = this.patterns.reduce((sum, p) => sum + p.confidence, 0) / this.patterns.length;
        return Math.min(0.95, avgConfidence);
    }
}
/**
 * Simple feedforward neural network
 */
class SimpleNeuralNetwork {
    weights; // layers of weight matrices
    biases; // layers of bias vectors
    config;
    momentum = []; // For momentum optimization
    constructor(config) {
        this.config = config;
        this.weights = [];
        this.biases = [];
        // Initialize weights and biases
        const layers = [config.inputSize, ...config.hiddenLayers, config.outputSize];
        for (let i = 0; i < layers.length - 1; i++) {
            const inputSize = layers[i];
            const outputSize = layers[i + 1];
            // Xavier initialization
            const scale = Math.sqrt(2.0 / (inputSize + outputSize));
            const layerWeights = [];
            for (let j = 0; j < outputSize; j++) {
                const neuronWeights = [];
                for (let k = 0; k < inputSize; k++) {
                    neuronWeights.push((Math.random() * 2 - 1) * scale);
                }
                layerWeights.push(neuronWeights);
            }
            this.weights.push(layerWeights);
            this.biases.push(new Array(outputSize).fill(0));
            this.momentum.push(layerWeights.map(row => new Array(row.length).fill(0)));
        }
    }
    /**
     * Forward pass
     */
    predict(input) {
        let activation = input;
        for (let i = 0; i < this.weights.length; i++) {
            activation = this.layerForward(activation, this.weights[i], this.biases[i]);
        }
        return activation;
    }
    /**
     * Train on single example
     */
    train(input, target) {
        // Forward pass with activations saved
        const activations = [input];
        for (let i = 0; i < this.weights.length; i++) {
            const output = this.layerForward(activations[activations.length - 1], this.weights[i], this.biases[i]);
            activations.push(output);
        }
        // Calculate loss (MSE)
        const prediction = activations[activations.length - 1];
        let loss = 0;
        for (let i = 0; i < prediction.length; i++) {
            loss += Math.pow(prediction[i] - target[i], 2);
        }
        loss /= prediction.length;
        // Backpropagation
        let delta = prediction.map((p, i) => (2 * (p - target[i])) / prediction.length);
        for (let i = this.weights.length - 1; i >= 0; i--) {
            const input = activations[i];
            const output = activations[i + 1];
            // Update weights
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    const gradient = delta[j] * input[k];
                    // Momentum update
                    this.momentum[i][j][k] =
                        this.config.momentum * this.momentum[i][j][k] - this.config.learningRate * gradient;
                    this.weights[i][j][k] += this.momentum[i][j][k];
                }
                // Update bias
                this.biases[i][j] -= this.config.learningRate * delta[j];
            }
            // Calculate delta for previous layer
            const newDelta = new Array(input.length).fill(0);
            for (let j = 0; j < delta.length; j++) {
                for (let k = 0; k < input.length; k++) {
                    newDelta[k] += delta[j] * this.weights[i][j][k];
                }
            }
            // Derivative of activation function
            for (let k = 0; k < newDelta.length; k++) {
                newDelta[k] *= input[k] > 0 ? 1 : 0.01; // Leaky ReLU derivative
            }
            delta = newDelta;
        }
        return loss;
    }
    /**
     * Forward pass through single layer
     */
    layerForward(input, weights, biases) {
        const output = [];
        for (let i = 0; i < weights.length; i++) {
            let sum = biases[i];
            for (let j = 0; j < input.length; j++) {
                sum += input[j] * weights[i][j];
            }
            // Leaky ReLU activation
            output.push(sum > 0 ? sum : sum * 0.01);
        }
        return output;
    }
}
// Export for use
export default LearningEngine;
//# sourceMappingURL=learning-engine.js.map