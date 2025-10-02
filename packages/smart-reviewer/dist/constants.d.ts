/**
 * Smart Reviewer Constants
 * Central location for all magic numbers and constant values
 */
export declare const QUALITY_THRESHOLD: {
    readonly EXCELLENT_SCORE: 90;
    readonly GOOD_SCORE: 70;
    readonly FAIR_SCORE: 50;
    readonly POOR_SCORE: 30;
};
export declare const METRICS_THRESHOLD: {
    readonly MAX_FUNCTION_LENGTH: 50;
    readonly MAX_LINE_LENGTH: 120;
    readonly MAX_NESTING_DEPTH: 4;
    readonly MAX_PARAMETERS: 5;
    readonly MAX_COMPLEXITY: 10;
    readonly MIN_COMMENT_DENSITY: 10;
    readonly GOOD_COMMENT_DENSITY: 20;
};
export declare const SEVERITY: {
    readonly ERROR: "error";
    readonly WARNING: "warning";
    readonly INFO: "info";
};
export declare const RULE_CATEGORY: {
    readonly STYLE: "style";
    readonly BEST_PRACTICES: "best-practices";
    readonly BUGS: "bugs";
    readonly SECURITY: "security";
    readonly PERFORMANCE: "performance";
};
export declare const PATTERN: {
    readonly VAR_KEYWORD: RegExp;
    readonly CONSOLE_LOG: RegExp;
    readonly TODO_COMMENT: RegExp;
    readonly MAGIC_NUMBER: RegExp;
    readonly LONG_LINE: 120;
    readonly EMPTY_CATCH: RegExp;
};
export declare const DEFAULTS: {
    readonly SEVERITY: "moderate";
    readonly AUTO_FIX: false;
    readonly INCLUDE_METRICS: true;
    readonly MAX_ISSUES: 100;
};
export declare const COMPLEXITY: {
    readonly BASE: 1;
    readonly IF_STATEMENT: 1;
    readonly LOOP: 1;
    readonly CASE: 1;
    readonly LOGICAL_OPERATOR: 1;
    readonly CATCH: 1;
    readonly TERNARY: 1;
};
export declare const MAINTAINABILITY: {
    readonly VOLUME_WEIGHT: 0.23;
    readonly COMPLEXITY_WEIGHT: 0.16;
    readonly LOC_WEIGHT: 2.46;
    readonly MAX_SCORE: 171;
    readonly SCALE_FACTOR: 100;
};
//# sourceMappingURL=constants.d.ts.map