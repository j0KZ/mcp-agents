/**
 * Factory for applying design patterns
 */
import { applySingletonPattern, applyFactoryPattern, applyObserverPattern, applyStrategyPattern, applyDecoratorPattern, applyAdapterPattern, applyFacadePattern, applyProxyPattern, applyCommandPattern, applyChainOfResponsibilityPattern, } from './index.js';
/**
 * Map of pattern names to their implementation functions
 */
const PATTERN_APPLIERS = {
    singleton: applySingletonPattern,
    factory: applyFactoryPattern,
    observer: applyObserverPattern,
    strategy: applyStrategyPattern,
    decorator: applyDecoratorPattern,
    adapter: applyAdapterPattern,
    facade: applyFacadePattern,
    proxy: applyProxyPattern,
    command: applyCommandPattern,
    'chain-of-responsibility': applyChainOfResponsibilityPattern,
};
/**
 * Apply a design pattern to code
 */
export function applyPattern(pattern, code, options) {
    const applier = PATTERN_APPLIERS[pattern];
    if (!applier) {
        throw new Error(`Unknown pattern: ${pattern}`);
    }
    return applier(code, options);
}
/**
 * Check if a pattern name is valid
 */
export function isValidPattern(pattern) {
    return pattern in PATTERN_APPLIERS;
}
/**
 * Get list of all supported patterns
 */
export function getSupportedPatterns() {
    return Object.keys(PATTERN_APPLIERS);
}
//# sourceMappingURL=pattern-factory.js.map