/**
 * Phase 5.3: Intuition Engine
 *
 * Develops "gut feelings" about code through deep learning on millions of examples.
 * Goes beyond logical analysis to pattern matching at a subconscious level.
 *
 * Architecture:
 * - 100 layers deep neural network
 * - 10,000 neurons per layer
 * - Trained on millions of code examples
 * - Produces intuitive "hunches" with confidence scores
 *
 * Target: 90%+ accuracy on intuitive judgments
 */
import { EventEmitter } from 'events';
interface IntuitionRequest {
    code: string;
    context?: CodeContext;
    question?: string;
}
interface CodeContext {
    language: string;
    domain: string;
    framework?: string;
    fileType: 'component' | 'utility' | 'service' | 'model' | 'config' | 'test';
    surroundingCode?: string;
}
interface Intuition {
    feeling: Feeling;
    confidence: number;
    reasoning: string;
    similar: SimilarExample[];
    warning?: string;
    suggestion?: string;
}
type Feeling = 'good' | 'bad' | 'excellent' | 'terrible' | 'suspicious' | 'elegant' | 'clumsy' | 'dangerous' | 'solid' | 'fragile';
interface SimilarExample {
    code: string;
    outcome: 'success' | 'failure' | 'bug' | 'security-issue' | 'performance-problem';
    description: string;
    similarity: number;
}
interface DeepLearningModel {
    layers: Layer[];
    trained: boolean;
    trainingExamples: number;
    accuracy: number;
}
interface Layer {
    id: number;
    neurons: Neuron[];
    type: 'input' | 'hidden' | 'output';
    activation: 'relu' | 'leaky-relu' | 'tanh' | 'sigmoid' | 'softmax';
}
interface Neuron {
    id: string;
    weights: number[];
    bias: number;
    activation: number;
    specialization?: string;
}
interface SubconsciousPattern {
    id: string;
    trigger: number[];
    response: Feeling;
    strength: number;
    examples: number;
    accuracy: number;
}
export declare class IntuitionEngine extends EventEmitter {
    private subconscious;
    private patterns;
    private trainingData;
    private readonly LAYERS;
    private readonly NEURONS_PER_LAYER;
    private readonly EPOCHS;
    private readonly TARGET_ACCURACY;
    private readonly PRACTICAL_LAYERS;
    private readonly PRACTICAL_NEURONS;
    private readonly PRACTICAL_EPOCHS;
    private readonly FEATURE_DIM;
    constructor();
    /**
     * Develop "gut feelings" about code
     * Exactly as specified in MASTER_EVOLUTION_PLAN.md Phase 5.3
     */
    developIntuition(): Promise<{
        getHunch: (code: string) => Promise<Intuition>;
    }>;
    /**
     * Get immediate intuition about code
     */
    getIntuition(request: IntuitionRequest): Promise<Intuition>;
    private trainSubconscious;
    private createLayers;
    private createNeurons;
    private initializeWeights;
    private feedForward;
    private calculateLoss;
    private backpropagate;
    private validateAccuracy;
    private extractSubconsciousPatterns;
    private interpretNeuronSpecialization;
    private extractFeatures;
    private measureComplexity;
    private measureNestingDepth;
    private measureCyclomaticComplexity;
    private measureCoupling;
    private measureCohesion;
    private detectPatterns;
    private detectAntiPatterns;
    private measureNamingQuality;
    private measureCommentDensity;
    private measureConsistency;
    private measureErrorHandling;
    private measureSecurity;
    private measureElegance;
    private measureClarity;
    private measureSurprise;
    private interpretResponse;
    private explainIntuition;
    private generateWarning;
    private generateSuggestion;
    private findSimilarExamples;
    private euclideanDistance;
    private mapFeelingToOutcome;
    private loadMassiveDataset;
    private generateSyntheticFeatures;
    private featuresToVector;
    private initializeModel;
    private quickTrain;
    private shuffle;
    private processSubconscious;
}
export type { IntuitionRequest, Intuition, Feeling, SimilarExample, DeepLearningModel, SubconsciousPattern, };
//# sourceMappingURL=intuition-engine.d.ts.map