/**
 * ContextDetector: Automatically detects project type, framework, and configuration
 * Smart enough to understand any project without configuration
 */

import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';

export interface ProjectContext {
  language: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'java' | 'unknown';
  framework: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'none';
  testRunner: string;
  hasGit: boolean;
  hasDocker: boolean;
  hasCI: boolean;
  fileCount: number;
  structure: 'monorepo' | 'single' | 'unknown';
  buildTool: string;
  linter: string;
  formatter: string;
  dependencies: string[];
  isProduction: boolean;
  mcpTools: string[];
}

export class ContextDetector {
  private cache: ProjectContext | null = null;

  /**
   * Detect everything about the current project
   */
  async detect(): Promise<ProjectContext> {
    if (this.cache) {
      return this.cache;
    }

    const context: ProjectContext = {
      language: 'unknown',
      framework: 'none',
      packageManager: 'none',
      testRunner: 'none',
      hasGit: false,
      hasDocker: false,
      hasCI: false,
      fileCount: 0,
      structure: 'unknown',
      buildTool: 'none',
      linter: 'none',
      formatter: 'none',
      dependencies: [],
      isProduction: false,
      mcpTools: [],
    };

    // Detect in parallel for speed
    await Promise.all([
      this.detectLanguage(context),
      this.detectPackageManager(context),
      this.detectFramework(context),
      this.detectTestRunner(context),
      this.detectVersionControl(context),
      this.detectContainerization(context),
      this.detectCI(context),
      this.detectProjectStructure(context),
      this.detectBuildTools(context),
      this.detectLinters(context),
      this.detectMCPTools(context),
    ]);

    // Count files
    context.fileCount = await this.countSourceFiles();

    // Determine if production
    context.isProduction = await this.isProductionProject();

    this.cache = context;
    return context;
  }

  /**
   * Detect primary programming language
   */
  private async detectLanguage(context: ProjectContext): Promise<void> {
    try {
      const files = await readdir(process.cwd(), { recursive: true });

      const extensions = {
        typescript: ['.ts', '.tsx'],
        javascript: ['.js', '.jsx', '.mjs'],
        python: ['.py'],
        go: ['.go'],
        rust: ['.rs'],
        java: ['.java'],
      };

      const counts: Record<string, number> = {};

      for (const file of files) {
        if (typeof file === 'string') {
          for (const [lang, exts] of Object.entries(extensions)) {
            if (exts.some(ext => file.endsWith(ext))) {
              counts[lang] = (counts[lang] || 0) + 1;
            }
          }
        }
      }

      // Find language with most files
      let maxCount = 0;
      let detectedLang: any = 'unknown';

      for (const [lang, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          detectedLang = lang;
        }
      }

      context.language = detectedLang;

      // Check for TypeScript config
      try {
        await stat(path.join(process.cwd(), 'tsconfig.json'));
        context.language = 'typescript';
      } catch {
        // No tsconfig
      }
    } catch {
      // Error detecting language
    }
  }

  /**
   * Detect package manager
   */
  private async detectPackageManager(context: ProjectContext): Promise<void> {
    const checks = [
      { file: 'pnpm-lock.yaml', manager: 'pnpm' as const },
      { file: 'yarn.lock', manager: 'yarn' as const },
      { file: 'package-lock.json', manager: 'npm' as const },
    ];

    for (const check of checks) {
      try {
        await stat(path.join(process.cwd(), check.file));
        context.packageManager = check.manager;
        return;
      } catch {
        // File doesn't exist
      }
    }

    // Check if package.json exists at all
    try {
      await stat(path.join(process.cwd(), 'package.json'));
      context.packageManager = 'npm'; // Default to npm
    } catch {
      context.packageManager = 'none';
    }
  }

  /**
   * Detect framework
   */
  private async detectFramework(context: ProjectContext): Promise<void> {
    try {
      const packageJson = await this.readPackageJson();

      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Framework detection patterns
      const frameworks = [
        { name: 'Next.js', check: ['next'] },
        { name: 'React', check: ['react'] },
        { name: 'Vue', check: ['vue'] },
        { name: 'Angular', check: ['@angular/core'] },
        { name: 'Express', check: ['express'] },
        { name: 'NestJS', check: ['@nestjs/core'] },
        { name: 'Fastify', check: ['fastify'] },
        { name: 'Svelte', check: ['svelte'] },
        { name: 'Nuxt', check: ['nuxt'] },
      ];

      for (const fw of frameworks) {
        if (fw.check.some(dep => dep in deps)) {
          context.framework = fw.name;
          return;
        }
      }

      // Check for monorepo tools
      if ('lerna' in deps || 'nx' in deps || 'rush' in deps) {
        context.framework = 'Monorepo';
      }
    } catch {
      // No package.json or error reading
    }
  }

  /**
   * Detect test runner
   */
  private async detectTestRunner(context: ProjectContext): Promise<void> {
    try {
      const packageJson = await this.readPackageJson();
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const testRunners = ['vitest', 'jest', 'mocha', 'jasmine', 'ava', 'tape', 'qunit'];

      for (const runner of testRunners) {
        if (runner in deps) {
          context.testRunner = runner;
          return;
        }
      }

      // Check scripts for test command
      if (packageJson.scripts?.test) {
        const testCmd = packageJson.scripts.test;
        for (const runner of testRunners) {
          if (testCmd.includes(runner)) {
            context.testRunner = runner;
            return;
          }
        }
      }
    } catch {
      // No test runner detected
    }
  }

  /**
   * Detect version control
   */
  private async detectVersionControl(context: ProjectContext): Promise<void> {
    try {
      await stat(path.join(process.cwd(), '.git'));
      context.hasGit = true;
    } catch {
      context.hasGit = false;
    }
  }

  /**
   * Detect containerization
   */
  private async detectContainerization(context: ProjectContext): Promise<void> {
    try {
      await stat(path.join(process.cwd(), 'Dockerfile'));
      context.hasDocker = true;
    } catch {
      // Check for docker-compose
      try {
        await stat(path.join(process.cwd(), 'docker-compose.yml'));
        context.hasDocker = true;
      } catch {
        context.hasDocker = false;
      }
    }
  }

  /**
   * Detect CI/CD setup
   */
  private async detectCI(context: ProjectContext): Promise<void> {
    const ciFiles = [
      '.github/workflows',
      '.gitlab-ci.yml',
      '.circleci/config.yml',
      'azure-pipelines.yml',
      '.travis.yml',
      'Jenkinsfile',
      'bitbucket-pipelines.yml',
    ];

    for (const ciFile of ciFiles) {
      try {
        await stat(path.join(process.cwd(), ciFile));
        context.hasCI = true;
        return;
      } catch {
        // File doesn't exist
      }
    }
  }

  /**
   * Detect project structure
   */
  private async detectProjectStructure(context: ProjectContext): Promise<void> {
    try {
      // Check for lerna.json or workspace config
      try {
        await stat(path.join(process.cwd(), 'lerna.json'));
        context.structure = 'monorepo';
        return;
      } catch {
        // Not lerna
      }

      // Check package.json for workspaces
      const packageJson = await this.readPackageJson();
      if (packageJson.workspaces) {
        context.structure = 'monorepo';
        return;
      }

      // Check for packages directory
      try {
        const packagesDir = await readdir(path.join(process.cwd(), 'packages'));
        if (packagesDir.length > 0) {
          context.structure = 'monorepo';
          return;
        }
      } catch {
        // No packages directory
      }

      // Default to single package
      context.structure = 'single';
    } catch {
      context.structure = 'unknown';
    }
  }

  /**
   * Detect build tools
   */
  private async detectBuildTools(context: ProjectContext): Promise<void> {
    const buildTools = [
      { file: 'webpack.config.js', tool: 'webpack' },
      { file: 'rollup.config.js', tool: 'rollup' },
      { file: 'vite.config.js', tool: 'vite' },
      { file: 'esbuild.config.js', tool: 'esbuild' },
      { file: 'parcel.json', tool: 'parcel' },
      { file: 'gulpfile.js', tool: 'gulp' },
      { file: 'Gruntfile.js', tool: 'grunt' },
    ];

    for (const { file, tool } of buildTools) {
      try {
        await stat(path.join(process.cwd(), file));
        context.buildTool = tool;
        return;
      } catch {
        // File doesn't exist
      }
    }

    // Check package.json scripts
    try {
      const packageJson = await this.readPackageJson();
      if (packageJson.scripts?.build) {
        const buildCmd = packageJson.scripts.build;
        for (const { tool } of buildTools) {
          if (buildCmd.includes(tool)) {
            context.buildTool = tool;
            return;
          }
        }

        // Default to tsc for TypeScript
        if (buildCmd.includes('tsc')) {
          context.buildTool = 'tsc';
        }
      }
    } catch {
      // No build tool detected
    }
  }

  /**
   * Detect linters
   */
  private async detectLinters(context: ProjectContext): Promise<void> {
    const linters = [
      { file: '.eslintrc', tool: 'eslint' },
      { file: '.eslintrc.js', tool: 'eslint' },
      { file: '.eslintrc.json', tool: 'eslint' },
      { file: 'eslint.config.js', tool: 'eslint' },
      { file: '.prettierrc', tool: 'prettier' },
      { file: 'prettier.config.js', tool: 'prettier' },
      { file: 'biome.json', tool: 'biome' },
      { file: '.stylelintrc', tool: 'stylelint' },
    ];

    // Check for linter configs
    for (const { file, tool } of linters) {
      try {
        await stat(path.join(process.cwd(), file));
        if (tool === 'prettier') {
          context.formatter = tool;
        } else {
          context.linter = tool;
        }
      } catch {
        // File doesn't exist
      }
    }

    // Check package.json
    try {
      const packageJson = await this.readPackageJson();
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if ('eslint' in deps) context.linter = 'eslint';
      if ('prettier' in deps) context.formatter = 'prettier';
      if ('@biomejs/biome' in deps) {
        context.linter = 'biome';
        context.formatter = 'biome';
      }
    } catch {
      // No linters detected
    }
  }

  /**
   * Detect installed MCP tools
   */
  private async detectMCPTools(context: ProjectContext): Promise<void> {
    const mcpTools = [
      '@j0kz/smart-reviewer',
      '@j0kz/test-generator',
      '@j0kz/security-scanner',
      '@j0kz/architecture-analyzer',
      '@j0kz/refactor-assistant',
      '@j0kz/code-historian',
      '@j0kz/complexity-analyzer',
      '@j0kz/orchestrator-mcp',
      '@j0kz/config-wizard',
    ];

    try {
      const packageJson = await this.readPackageJson();
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      context.mcpTools = mcpTools.filter(tool => tool in deps);
    } catch {
      // No package.json
    }
  }

  /**
   * Count source files
   */
  private async countSourceFiles(): Promise<number> {
    try {
      const files = await readdir(process.cwd(), { recursive: true });
      const sourceExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.rs', '.java'];

      return files.filter(
        file =>
          typeof file === 'string' &&
          sourceExtensions.some(ext => file.endsWith(ext)) &&
          !file.includes('node_modules') &&
          !file.includes('dist') &&
          !file.includes('build')
      ).length;
    } catch {
      return 0;
    }
  }

  /**
   * Check if this is a production project
   */
  private async isProductionProject(): Promise<boolean> {
    try {
      const packageJson = await this.readPackageJson();

      // Check for production indicators
      const prodIndicators = [
        packageJson.private === false,
        packageJson.version && !packageJson.version.includes('0.0.'),
        packageJson.repository,
        packageJson.license && packageJson.license !== 'UNLICENSED',
      ];

      return prodIndicators.filter(Boolean).length >= 2;
    } catch {
      return false;
    }
  }

  /**
   * Read package.json safely
   */
  private async readPackageJson(): Promise<any> {
    try {
      const content = await readFile(path.join(process.cwd(), 'package.json'), 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  /**
   * Get file type for a path
   */
  async getFileType(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript-react',
      '.js': 'javascript',
      '.jsx': 'javascript-react',
      '.json': 'json',
      '.md': 'markdown',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.css': 'css',
      '.scss': 'scss',
      '.html': 'html',
    };

    return typeMap[ext] || 'unknown';
  }
}
