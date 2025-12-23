# Claude Desktop Skills

**29 skills empaquetadas para Claude Desktop App**

## Instalación

1. Abre **Claude Desktop**
2. Ve a **Settings** > **Capabilities**
3. Sube el archivo `.zip` de la skill que quieras
4. Activa la skill en tu lista

## Skills Disponibles

### 🌍 Universal (funcionan sin MCP)

| Skill | Descripción |
|-------|-------------|
| `quick-pr-review.zip` | Checklist pre-PR |
| `zero-to-hero.zip` | Dominar cualquier codebase |
| `legacy-modernizer.zip` | Modernización segura |
| `tech-debt-tracker.zip` | Gestión de deuda técnica |
| `api-integration.zip` | Conectar servicios |
| `debug-detective.zip` | Debugging sistemático |
| `performance-hunter.zip` | Encontrar bottlenecks |
| `test-coverage-boost.zip` | 0% a 80% cobertura |
| `security-first.zip` | Protección OWASP |
| `dependency-doctor.zip` | Salud de dependencias |
| `brand-guidelines.zip` | Consistencia de marca |
| `competitive-ads-extractor.zip` | Análisis de competencia |

### 🔧 MCP-Enhanced (mejores con @j0kz/mcp-agents)

| Skill | Descripción |
|-------|-------------|
| `code-quality-pipeline.zip` | Pipeline de calidad |
| `testing-patterns-vitest.zip` | Patrones Vitest |
| `modular-refactoring-pattern.zip` | Archivos <300 LOC |
| `documentation-generation.zip` | README, CHANGELOG |
| `git-pr-workflow.zip` | Workflow de PRs |
| `api-contract-validator.zip` | Validación OpenAPI |
| `caching-optimizer.zip` | Estrategias de cache |
| `dependency-analyzer.zip` | Auditoría de deps |
| `performance-profiler.zip` | Profiling |
| `security-scanner.zip` | Escaneo de vulnerabilidades |
| `mcp-workflow-composition.zip` | Combinar MCP tools |
| `tool-discovery.zip` | Encontrar herramientas |
| `mcp-troubleshooting.zip` | Debug MCP |
| `project-standardization.zip` | Estándares |
| `monorepo-package-workflow.zip` | Patrones monorepo |
| `release-publishing-workflow.zip` | Proceso de release |
| `model-first-reasoning.zip` | Reducir alucinaciones |

## Estructura de cada ZIP

```
skill-name.zip
└── skill-name/           # Carpeta con nombre = skill name
    ├── SKILL.md          # Skill principal (requerido)
    └── references/       # Documentación adicional (opcional)
        ├── guide-1.md
        └── ...
```

## Formato YAML (Anthropic Spec)

Solo estos campos son válidos en el frontmatter:

```yaml
---
name: skill-name
description: "Descripción de la skill (max 200 chars)"
dependencies: "opcional - requisitos de software"
---
```

**Campos NO válidos:** `version`, `category`, `tags`, `mcp-tools`, `author`, etc.

## Requisitos Técnicos

| Requisito | Valor |
|-----------|-------|
| Path separator | Forward slash (`/`) |
| Folder name | Debe coincidir con `name` en YAML |
| SKILL.md | Requerido en raíz de la carpeta |
| Max description | 200 caracteres |

## Regenerar ZIPs

```bash
cd my-claude-agents
node scripts/create-skill-zips.mjs
```

## Notas

- Las skills son **privadas** a tu cuenta de Claude
- Puedes activar/desactivar skills según necesites
- Las skills MCP-Enhanced funcionan mejor con los MCP tools instalados

## Instalación de MCP Tools (Opcional)

```bash
npx @j0kz/mcp-agents@latest
```

---

**Total:** 29 skills | **Tamaño:** ~316 KB
