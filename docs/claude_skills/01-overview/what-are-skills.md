# What Are Claude Skills?

**Skills are dynamic instruction packages that extend Claude's capabilities for specialized tasks through modular, reusable knowledge bundles.**

---

## Core Concept

Claude Skills are **organized folders of instructions, scripts, and resources** that Claude discovers and loads dynamically to perform better at specific tasks. They function as **"onboarding guides"** that teach Claude specialized workflows and domain expertise.

### Not Just Prompts

Unlike one-off prompts sent in individual conversations, skills are:

| Traditional Prompts      | Skills                                           |
| ------------------------ | ------------------------------------------------ |
| Written per conversation | Reusable across all conversations                |
| Lost after session ends  | Persistent and versioned                         |
| Static and unchanging    | Can bundle executable code                       |
| Consume full context     | Progressive disclosure (only load what's needed) |
| Limited to text          | Can include scripts, templates, data             |

---

## Anatomy of a Skill

### Minimal Structure

Every skill must have a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: task-automation
description: Automates repetitive tasks using scripts and workflows. Use when processing multiple files or running scheduled operations.
---

# Task Automation

Execute automated workflows by:

1. Identify the repetitive pattern
2. Select appropriate script from bundled resources
3. Run with validated parameters
4. Verify outputs and handle errors
```

### Full Structure (Production-Grade)

```
skill-name/
├── SKILL.md                    # Required: Core instructions
├── scripts/                    # Optional: Executable helpers
│   ├── validate.py
│   ├── process.sh
│   └── transform.js
├── references/                 # Optional: Detailed documentation
│   ├── API_REFERENCE.md
│   ├── EXAMPLES.md
│   └── ADVANCED.md
└── assets/                     # Optional: Templates and data
    ├── template.json
    ├── schema.yaml
    └── sample-data.csv
```

---

## How Skills Work

### 1. Discovery Phase

When a conversation starts, Claude reads the **metadata** from all available skills:

```yaml
---
name: pdf-processing
description: Extracts text and tables from PDFs, fills forms, merges documents. Use when working with PDF files or document extraction.
---
```

This minimal metadata (~100 tokens per skill) helps Claude understand what skills are available **without loading full content**.

### 2. Activation Phase

When Claude determines a skill is relevant to the user's request:

1. **Loads SKILL.md** - The full instructions file (<5,000 tokens typical)
2. **Reads context** - Understands current task requirements
3. **Applies instructions** - Follows the procedural guidance

### 3. Resource Access Phase

If the skill references additional resources, Claude:

1. **Reads files on-demand** - Uses bash to access filesystem
2. **Executes scripts** - Runs code with output-only consumption
3. **Applies templates** - Uses bundled assets as starting points

**Key Insight:** Resources remain on the filesystem until needed, enabling skills to bundle "effectively unbounded" supplementary content.

---

## Progressive Disclosure Architecture

Skills use a **three-tier information hierarchy** to optimize context usage:

```
┌─────────────────────────────────────────┐
│  TIER 1: Metadata (Always Loaded)      │
│  • YAML frontmatter (name, description)│
│  • ~100 tokens per skill               │
│  • Helps Claude decide when to use it  │
└─────────────────────────────────────────┘
            ↓ (skill is relevant)
┌─────────────────────────────────────────┐
│  TIER 2: Instructions (On-Demand)      │
│  • SKILL.md markdown body              │
│  • <5,000 tokens typical               │
│  • Procedural knowledge and workflows  │
└─────────────────────────────────────────┘
            ↓ (need details/tools)
┌─────────────────────────────────────────┐
│  TIER 3: Resources (Filesystem Access) │
│  • Scripts execute via bash            │
│  • References read only when cited     │
│  • 0 tokens until accessed             │
└─────────────────────────────────────────┘
```

**Example Scenario:**

```
User: "Extract data from this PDF"
Claude:
  1. Sees pdf-processing skill metadata (Tier 1)
  2. Loads SKILL.md for extraction workflow (Tier 2)
  3. Runs scripts/extract_tables.py if needed (Tier 3)
  4. References API_REFERENCE.md for edge cases (Tier 3)
```

---

## Key Benefits

### 1. Specialization

Transform general-purpose Claude into domain-specific experts:

- Financial modeling specialist
- Brand guideline enforcer
- API integration expert
- Testing automation wizard

### 2. Reusability

Create once, use everywhere:

- Same skill works across all conversations
- Share with team members or community
- Version and update centrally
- No copy-pasting instructions

### 3. Composition

Combine multiple skills for complex workflows:

- `brand-guidelines` + `pptx` = On-brand presentations
- `api-integration` + `data-validation` = Robust API clients
- `testing-framework` + `ci-cd-workflow` = Complete QA automation

### 4. Efficiency

Optimize context window usage:

- Metadata always loaded: ~100 tokens/skill
- Instructions load only when needed: <5k tokens
- Resources accessed via filesystem: 0 tokens
- **Result:** Bundle extensive knowledge without context bloat

---

## Use Cases

### Enterprise & Organizations

**Brand Consistency:**

```yaml
name: acme-brand-guidelines
description: Enforces Acme Corp visual identity standards including colors (#FF6B35 primary), typography (Poppins headings), and design patterns. Use when creating marketing materials, presentations, or public-facing content.
```

**Internal Communications:**

```yaml
name: internal-comms-templates
description: Professional email and announcement templates following company tone (friendly, concise, action-oriented). Use when drafting internal communications, team updates, or policy announcements.
```

### Development & Technical

**API Integration:**

```yaml
name: stripe-api-workflows
description: Implements Stripe payment workflows including customer creation, subscription management, and webhook handling. Use when integrating payment processing or managing billing operations.
```

**Testing Automation:**

```yaml
name: playwright-ui-testing
description: Creates Playwright test scripts for web applications with selector strategies and assertion patterns. Use when writing UI tests or debugging test failures.
```

### Creative & Design

**Generative Art:**

```yaml
name: algorithmic-art-p5js
description: Generates interactive p5.js art using particle systems, seeded randomness, and parameter-driven aesthetics. Use when creating generative visualizations or interactive experiences.
```

**Design Systems:**

```yaml
name: tailwind-component-builder
description: Constructs React components using Tailwind CSS with shadcn/ui patterns and accessibility best practices. Use when building UI components or design systems.
```

### Meta & Automation

**Skill Creation:**

```yaml
name: skill-creator
description: Guides the creation of new Claude Skills following best practices including progressive disclosure, context efficiency, and proper metadata formatting. Use when building custom skills or teaching others to create skills.
```

---

## Skills vs Traditional Solutions

### Compared to Custom Agents

| Custom Agents               | Skills                    |
| --------------------------- | ------------------------- |
| Purpose-built, single-use   | Modular, composable       |
| Require separate deployment | Work with existing Claude |
| Fixed behavior              | Adaptable to context      |
| Siloed knowledge            | Shared across workflows   |

**When to use skills:** Most domain-specific tasks
**When to use custom agents:** Highly specialized, standalone applications

### Compared to Fine-Tuning

| Fine-Tuning              | Skills                       |
| ------------------------ | ---------------------------- |
| Requires training data   | Just write instructions      |
| Time-consuming to update | Edit markdown file           |
| Opaque behavior changes  | Transparent instruction sets |
| Model-specific           | Works across Claude versions |

**When to use skills:** Dynamic knowledge, frequently changing workflows
**When to use fine-tuning:** Fundamental behavior shifts, tone/style adaptation

### Compared to RAG (Retrieval-Augmented Generation)

| RAG                            | Skills                          |
| ------------------------------ | ------------------------------- |
| Best for large knowledge bases | Best for procedural workflows   |
| Retrieves relevant passages    | Loads complete instruction sets |
| Good for facts and reference   | Good for processes and actions  |
| Requires vector database       | Uses filesystem                 |

**When to use skills:** Workflow automation, procedural guidance
**When to use RAG:** Large document corpuses, fact retrieval

---

## Real-World Example: PDF Processing Skill

### The Problem

Users repeatedly ask Claude to:

- Extract text from PDFs
- Fill PDF forms with data
- Merge multiple PDFs
- Extract tables to CSV

Each time requires explaining:

- Which libraries to use
- How to handle errors
- Output format preferences
- Validation requirements

### The Solution: A Skill

**File Structure:**

```
pdf-processing/
├── SKILL.md              # Core workflow instructions
├── scripts/
│   ├── extract_text.py   # Robust extraction with PyPDF2
│   ├── fill_form.py      # Form field population
│   └── merge_pdfs.py     # Document combination
└── references/
    ├── FORMS.md          # Form-filling guide
    └── API_REF.md        # PyPDF2 API reference
```

**SKILL.md (Abbreviated):**

```markdown
---
name: pdf-processing
description: Extracts text and tables from PDFs, fills forms, merges documents. Use when working with PDF files or document extraction.
---

# PDF Processing

## Core Workflows

### Text Extraction

1. Validate PDF is readable (not encrypted)
2. Run `scripts/extract_text.py <input.pdf>`
3. Parse output for structured data if needed
4. Handle errors gracefully (corrupted PDFs)

### Form Filling

See references/FORMS.md for detailed field mapping.
Run `scripts/fill_form.py <template.pdf> <data.json>`

### Merging Documents

Validate all PDFs have compatible versions.
Run `scripts/merge_pdfs.py <pdf1> <pdf2> ... <output>`
```

**Result:**

- User: "Extract tables from this PDF"
- Claude: _Loads skill → Runs extract_text.py → Returns structured data_
- No need to re-explain the process each time
- Consistent, validated approach
- Reusable across all PDF tasks

---

## Platform Availability

### Claude Code (VSCode Extension)

```bash
/plugin marketplace add anthropics/skills
```

Access to all public skills in the marketplace.

### Claude.ai (Web Interface)

Available to **paid subscribers** (Pro, Team, Enterprise).
Skills automatically available in conversations.

### Claude API (Programmatic)

Requires beta headers:

```python
import anthropic

client = anthropic.Anthropic(
    api_key="your-key",
)

response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    headers={
        "anthropic-beta": "code-execution-2025-08-25,files-api-2025-04-14,skills-2025-10-02"
    },
    messages=[{"role": "user", "content": "Use the pdf skill to extract text"}]
)
```

---

## Key Takeaways

1. **Skills are instruction packages** - Not prompts, not agents, but structured procedural knowledge
2. **Progressive disclosure** - Load only what's needed via 3-tier architecture
3. **Reusable and composable** - Create once, use everywhere, combine freely
4. **Context-efficient** - Minimal token usage via filesystem access
5. **Agent-centric design** - Focus on workflows, not API endpoints

---

## Next Steps

- **Understand the architecture:** [Architecture Deep Dive](architecture.md)
- **Compare with tools:** [Skills vs Tools](skills-vs-tools.md)
- **Build your first skill:** [Quickstart Guide](../02-getting-started/quickstart.md)

---

**Related Documentation:**

- [Skill Structure](../03-skill-structure/anatomy.md)
- [Best Practices](../04-best-practices/progressive-disclosure.md)
- [Development Workflow](../06-development-workflow/creation-process.md)
