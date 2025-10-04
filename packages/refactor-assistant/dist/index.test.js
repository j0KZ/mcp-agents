import { describe, it, expect } from 'vitest';
import * as RefactorAssistant from './index.js';
describe('Package Exports', () => {
    describe('Function Exports', () => {
        it('should export extractFunction', () => {
            expect(RefactorAssistant.extractFunction).toBeDefined();
            expect(typeof RefactorAssistant.extractFunction).toBe('function');
        });
        it('should export convertToAsync', () => {
            expect(RefactorAssistant.convertToAsync).toBeDefined();
            expect(typeof RefactorAssistant.convertToAsync).toBe('function');
        });
        it('should export simplifyConditionals', () => {
            expect(RefactorAssistant.simplifyConditionals).toBeDefined();
            expect(typeof RefactorAssistant.simplifyConditionals).toBe('function');
        });
        it('should export removeDeadCode', () => {
            expect(RefactorAssistant.removeDeadCode).toBeDefined();
            expect(typeof RefactorAssistant.removeDeadCode).toBe('function');
        });
        it('should export applyDesignPattern', () => {
            expect(RefactorAssistant.applyDesignPattern).toBeDefined();
            expect(typeof RefactorAssistant.applyDesignPattern).toBe('function');
        });
        it('should export renameVariable', () => {
            expect(RefactorAssistant.renameVariable).toBeDefined();
            expect(typeof RefactorAssistant.renameVariable).toBe('function');
        });
        it('should export suggestRefactorings', () => {
            expect(RefactorAssistant.suggestRefactorings).toBeDefined();
            expect(typeof RefactorAssistant.suggestRefactorings).toBe('function');
        });
        it('should export calculateMetrics', () => {
            expect(RefactorAssistant.calculateMetrics).toBeDefined();
            expect(typeof RefactorAssistant.calculateMetrics).toBe('function');
        });
    });
    describe('Metadata Exports', () => {
        it('should export VERSION constant', () => {
            expect(RefactorAssistant.VERSION).toBeDefined();
            expect(typeof RefactorAssistant.VERSION).toBe('string');
            expect(RefactorAssistant.VERSION).toMatch(/^\d+\.\d+\.\d+$/);
        });
        it('should export NAME constant', () => {
            expect(RefactorAssistant.NAME).toBeDefined();
            expect(typeof RefactorAssistant.NAME).toBe('string');
            expect(RefactorAssistant.NAME).toContain('refactor-assistant');
        });
        it('should export DESCRIPTION constant', () => {
            expect(RefactorAssistant.DESCRIPTION).toBeDefined();
            expect(typeof RefactorAssistant.DESCRIPTION).toBe('string');
            expect(RefactorAssistant.DESCRIPTION.length).toBeGreaterThan(0);
        });
    });
    describe('Package Integrity', () => {
        it('should have all expected exports', () => {
            const exports = Object.keys(RefactorAssistant);
            const expectedExports = [
                'extractFunction',
                'convertToAsync',
                'simplifyConditionals',
                'removeDeadCode',
                'applyDesignPattern',
                'renameVariable',
                'suggestRefactorings',
                'calculateMetrics',
                'VERSION',
                'NAME',
                'DESCRIPTION'
            ];
            expectedExports.forEach(exportName => {
                expect(exports).toContain(exportName);
            });
        });
        it('should not have unexpected exports', () => {
            const exports = Object.keys(RefactorAssistant);
            // Should only have functions and metadata, no implementation details
            exports.forEach(exportName => {
                expect(['function', 'string']).toContain(typeof RefactorAssistant[exportName]);
            });
        });
    });
});
//# sourceMappingURL=index.test.js.map