/**
 * Type definitions for documentation generation
 * @module types
 */
/**
 * Documentation error
 */
export class DocError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'DocError';
    }
}
//# sourceMappingURL=types.js.map