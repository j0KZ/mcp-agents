/**
 * Utilities for converting callback/promise code to async/await
 */
/**
 * Convert callback-based code to async/await
 */
export declare function convertCallbackToAsync(code: string, useTryCatch: boolean): {
    code: string;
    changed: boolean;
};
/**
 * Convert Promise.then chains to async/await
 */
export declare function convertPromiseChainToAsync(code: string): {
    code: string;
    changed: boolean;
};
/**
 * Wrap code in try/catch block
 */
export declare function wrapInTryCatch(code: string, errorHandler?: string): string;
//# sourceMappingURL=async-converter.d.ts.map