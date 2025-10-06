/**
 * Source Code Parser Module
 * Parses TypeScript/JavaScript files to extract documentation information
 */

import * as fs from 'fs';
import { FunctionInfo, ClassInfo, InterfaceInfo, ParameterInfo } from '../types.js';

/**
 * Extract JSDoc comment before a code element
 */
function extractJSDoc(fullMatch: string): string | undefined {
  const jsdocMatch = fullMatch.match(/\/\*\*([\s\S]*?)\*\//);
  if (!jsdocMatch) return undefined;

  const jsdocContent = jsdocMatch[1];
  const descMatch = jsdocContent.match(/\*\s*([^@\n][^\n]*)/);
  return descMatch ? descMatch[1].trim() : undefined;
}

/**
 * Infer description from function/variable name using common patterns
 */
function inferDescription(name: string, type: 'function' | 'class' | 'interface'): string {
  // Convert camelCase/PascalCase to words, preserving acronyms
  let words = name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // Split before last cap in acronym
    .replace(/([a-z\d])([A-Z])/g, '$1 $2') // Split at lowercase-uppercase boundary
    .trim();

  // Preserve known acronyms BEFORE lowercasing
  words = words
    .replace(/\bMC Ps\b/g, 'MCPs')
    .replace(/\bAPI s\b/g, 'APIs')
    .replace(/\bURL s\b/g, 'URLs')
    .replace(/\bHTTP s\b/g, 'HTTPs');

  words = words.toLowerCase();

  if (type === 'function') {
    // Common function prefixes
    if (name.startsWith('get')) return `Retrieves ${words.replace(/^get\s*/, '')}`;
    if (name.startsWith('set')) return `Sets ${words.replace(/^set\s*/, '')}`;
    if (name.startsWith('is') || name.startsWith('has')) return `Checks if ${words}`;
    if (name.startsWith('create')) return `Creates ${words.replace(/^create\s*/, '')}`;
    if (name.startsWith('delete')) return `Deletes ${words.replace(/^delete\s*/, '')}`;
    if (name.startsWith('update')) return `Updates ${words.replace(/^update\s*/, '')}`;
    if (name.startsWith('find')) return `Finds ${words.replace(/^find\s*/, '')}`;
    if (name.startsWith('generate')) return `Generates ${words.replace(/^generate\s*/, '')}`;
    if (name.startsWith('parse')) return `Parses ${words.replace(/^parse\s*/, '')}`;
    if (name.startsWith('validate')) return `Validates ${words.replace(/^validate\s*/, '')}`;
    if (name.startsWith('calculate')) return `Calculates ${words.replace(/^calculate\s*/, '')}`;
    if (name.startsWith('format')) return `Formats ${words.replace(/^format\s*/, '')}`;
    if (name.startsWith('convert')) return `Converts ${words.replace(/^convert\s*/, '')}`;
    if (name.startsWith('handle')) return `Handles ${words.replace(/^handle\s*/, '')}`;
    if (name.startsWith('process')) return `Processes ${words.replace(/^process\s*/, '')}`;
    if (name.startsWith('render')) return `Renders ${words.replace(/^render\s*/, '')}`;
    if (name.startsWith('fetch')) return `Fetches ${words.replace(/^fetch\s*/, '')}`;
    if (name.startsWith('load')) return `Loads ${words.replace(/^load\s*/, '')}`;
    if (name.startsWith('save')) return `Saves ${words.replace(/^save\s*/, '')}`;
    if (name.startsWith('init')) return `Initializes ${words.replace(/^init\s*/, '')}`;
    if (name.startsWith('detect')) return `Detects ${words.replace(/^detect\s*/, '')}`;
    if (name.startsWith('install')) return `Installs ${words.replace(/^install\s*/, '')}`;
    if (name.startsWith('run')) return `Runs ${words.replace(/^run\s*/, '')}`;

    return `Function to ${words}`;
  }

  if (type === 'class') {
    return `${name} class`;
  }

  if (type === 'interface') {
    return `Interface defining ${words}`;
  }

  return words;
}

/**
 * Infer parameter description from name
 */
function inferParamDescription(paramName: string): string {
  const words = paramName
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();

  // Common parameter patterns
  if (paramName === 'id') return 'Unique identifier';
  if (paramName.endsWith('Id')) return `${words.replace(/\s*id$/, '')} identifier`;
  if (paramName.endsWith('Path'))
    return `File or directory path for ${words.replace(/\s*path$/, '')}`;
  if (paramName.endsWith('Config'))
    return `Configuration options for ${words.replace(/\s*config$/, '')}`;
  if (paramName.endsWith('Options')) return `Options for ${words.replace(/\s*options$/, '')}`;
  if (paramName === 'callback') return 'Callback function';
  if (paramName === 'error' || paramName === 'err') return 'Error object';
  if (paramName === 'data') return 'Data to process';
  if (paramName === 'result') return 'Result value';
  if (paramName === 'args') return 'Arguments';
  if (paramName === 'params') return 'Parameters';
  if (paramName === 'options') return 'Configuration options';
  if (paramName === 'config') return 'Configuration object';
  if (paramName === 'verbose') return 'Enable verbose output';
  if (paramName === 'force') return 'Force operation';
  if (paramName === 'dryRun') return 'Perform dry run without making changes';

  return `The ${words}`;
}

export function parseSourceFile(filePath: string): {
  functions: FunctionInfo[];
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];
  const interfaces: InterfaceInfo[] = [];

  // Enhanced regex patterns with JSDoc extraction
  const functionRegex =
    /(?:\/\*\*[\s\S]*?\*\/\s*)?(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\((.*?)\)(?:\s*:\s*([^{]+))?\s*{/g;
  const classRegex =
    /(?:\/\*\*[\s\S]*?\*\/\s*)?(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*{/g;
  const interfaceRegex =
    /(?:\/\*\*[\s\S]*?\*\/\s*)?(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([\w,\s]+))?\s*{/g;

  let match;

  // Parse functions
  while ((match = functionRegex.exec(content)) !== null) {
    const [fullMatch, name, params, returnType] = match;

    // Extract existing JSDoc or infer description
    const description = extractJSDoc(fullMatch) || inferDescription(name, 'function');

    const parameters: ParameterInfo[] = params
      .split(',')
      .map((p: string) => p.trim())
      .filter((p: string) => p)
      .map((param: string) => {
        // Split by colon to separate name from type
        const [paramName, paramType] = param.split(':').map((s: string) => s.trim());

        // Remove default value from parameter name (e.g., "verbose = false" → "verbose")
        const nameWithoutDefault = paramName.split('=')[0].trim();

        const isOptional = nameWithoutDefault.includes('?') || paramName.includes('=');
        const isRest = nameWithoutDefault.startsWith('...');
        const cleanName = nameWithoutDefault.replace(/[?\.]/g, '');

        return {
          name: cleanName,
          type: paramType
            ? { name: paramType, isArray: paramType.includes('[]'), raw: paramType }
            : undefined,
          optional: isOptional,
          rest: isRest,
          description: inferParamDescription(cleanName),
        };
      });

    functions.push({
      name,
      description,
      parameters,
      returnType: returnType
        ? { name: returnType.trim(), isArray: returnType.includes('[]'), raw: returnType.trim() }
        : undefined,
      isAsync: match[0].includes('async'),
      isExported: match[0].includes('export'),
    });
  }

  // Parse classes
  while ((match = classRegex.exec(content)) !== null) {
    const [fullMatch, name, extendsClass, implementsInterfaces] = match;

    // Extract existing JSDoc or infer description
    const description = extractJSDoc(fullMatch) || inferDescription(name, 'class');

    classes.push({
      name,
      description,
      extends: extendsClass,
      implements: implementsInterfaces?.split(',').map((i: string) => i.trim()),
      properties: [],
      methods: [],
      constructor: undefined,
      isExported: match[0].includes('export'),
      isAbstract: match[0].includes('abstract'),
    });
  }

  // Parse interfaces
  while ((match = interfaceRegex.exec(content)) !== null) {
    const [fullMatch, name, extendsInterfaces] = match;

    // Extract existing JSDoc or infer description
    const description = extractJSDoc(fullMatch) || inferDescription(name, 'interface');

    interfaces.push({
      name,
      description,
      extends: extendsInterfaces?.split(',').map((i: string) => i.trim()),
      properties: [],
      methods: [],
      isExported: match[0].includes('export'),
    });
  }

  return { functions, classes, interfaces };
}
