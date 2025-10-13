/**
 * File system helper utilities
 */
import * as fs from 'fs';
import * as path from 'path';
import { EXCLUSION_PATTERNS, FILE_PATTERNS } from '../constants/doc-limits.js';
/**
 * Find all source files recursively
 *
 * @param dirPath - Directory to search
 * @param fileList - Accumulated file list
 * @returns Array of file paths
 */
export function findSourceFiles(dirPath, fileList = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (shouldExcludeDirectory(file)) {
                return;
            }
            findSourceFiles(filePath, fileList);
        }
        else if (isSourceFile(file)) {
            fileList.push(filePath);
        }
    });
    return fileList;
}
/**
 * Check if directory should be excluded from scanning
 *
 * @param dirname - Directory name
 * @returns True if should exclude
 */
function shouldExcludeDirectory(dirname) {
    return (EXCLUSION_PATTERNS.HIDDEN_DIRS.test(dirname) ||
        dirname === EXCLUSION_PATTERNS.NODE_MODULES ||
        dirname === EXCLUSION_PATTERNS.DIST);
}
/**
 * Check if file is a source file (not a test)
 *
 * @param filename - File name
 * @returns True if source file
 */
function isSourceFile(filename) {
    return FILE_PATTERNS.SOURCE_FILES.test(filename) && !EXCLUSION_PATTERNS.TEST_FILES.test(filename);
}
//# sourceMappingURL=file-helpers.js.map