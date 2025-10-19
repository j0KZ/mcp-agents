# Claude Skills Architecture

**Deep dive into the progressive disclosure system, context management, and technical implementation of Claude Skills.**

---

## Progressive Disclosure: The Three-Tier System

Skills use a hierarchical loading strategy to optimize context window usage while enabling effectively unbounded bundled content.

### Tier 1: Metadata (Always Loaded)

**Purpose:** Enable skill discovery without context bloat

**Content:** YAML frontmatter only
```yaml
---
name: pdf-processing
description: Extracts text and tables from PDFs, fills forms, merges documents. Use when working with PDF files or document extraction.
---
```

**Token Cost:** ~100 tokens per skill

**Loading:** Loaded into system prompt at conversation start

**Function:** Helps Claude determine which skills are relevant to user requests without consuming significant context.

### Tier 2: Core Instructions (On-Demand)

**Purpose:** Provide procedural knowledge when skill is activated

**Content:** SKILL.md markdown body
```markdown
# PDF Processing

## Text Extraction Workflow

1. Validate PDF readability (check encryption)
2. Execute `scripts/extract_text.py <input.pdf>`
3. Parse output for structured data
4. Handle errors gracefully
...
```

**Token Cost:** <5,000 tokens (target <500 lines total)

**Loading:** Loaded via filesystem read when Claude determines skill is relevant

**Function:** Teaches Claude the specific workflows, patterns, and procedures for the domain.

### Tier 3: Resources (Filesystem Access)

**Purpose:** Provide detailed references and executable code without context consumption

**Content:**
- Scripts (Python, JavaScript, bash)
- Reference documentation (API specs, schemas)
- Templates and assets (JSON, CSV, images)
- Advanced examples

**Token Cost:** 0 until accessed

**Loading:** Read on-demand via bash commands when explicitly referenced

**Function:** Enable unbounded supplementary content through filesystem access.

---

## Loading Sequence Example

### Scenario: User Requests PDF Processing

```
Step 1: Conversation Start
┌────────────────────────────────┐
│ System Prompt                  │
│ + Metadata from ALL skills     │
│                                │
│ pdf-processing: "Extracts..."  │  ← ~100 tokens
│ xlsx-generation: "Creates..."  │  ← ~100 tokens
│ api-integration: "Builds..."   │  ← ~100 tokens
│ ... (all installed skills)    │
└────────────────────────────────┘
Total Cost: ~100 tokens × number of skills
```

```
Step 2: User Message
User: "Extract tables from this PDF and save to Excel"

Claude: Analyzes request against skill metadata
  → pdf-processing matches ("Extracts... from PDFs")
  → xlsx-generation matches ("Creates... Excel")
  → Loads both skills
```

```
Step 3: Load SKILL.md Files
┌────────────────────────────────┐
│ Claude's Working Context       │
├────────────────────────────────┤
│ System Prompt          (base)  │
│ Skill Metadata         (~1k)   │
│ pdf-processing SKILL.md (~2k)  │  ← Loaded now
│ xlsx-generation SKILL.md (~3k) │  ← Loaded now
│ User Message           (~50)   │
│ Available: 194k tokens         │
└────────────────────────────────┘
```

```
Step 4: Execute Workflow (Access Resources)
Claude reads pdf-processing SKILL.md:
  "For table extraction, run scripts/extract_tables.py"

Claude executes via bash tool:
  $ python pdf-processing/scripts/extract_tables.py input.pdf

Script Output (only this consumed to context):
  ┌────────────────────────────┐
  │ Table 1: Sales Data        │
  │ - 5 columns, 120 rows      │
  │ - Headers: Date, Product...│
  │                            │
  │ Table 2: Summary Stats     │
  │ - 3 columns, 5 rows        │
  └────────────────────────────┘

Token Cost of Resource: ~200 (output only, not script code)
```

```
Step 5: Follow xlsx-generation Workflow
Claude reads xlsx-generation SKILL.md:
  "Create workbook with separate sheets per table"

Uses bundled template:
  $ cat xlsx-generation/assets/table_template.json

Executes generation with extracted data
Returns completed Excel file
```

**Total Context Usage:**
- Base system prompt: ~5,000 tokens
- Skill metadata (10 skills): ~1,000 tokens
- Two SKILL.md files: ~5,000 tokens
- User message: ~50 tokens
- Script outputs: ~500 tokens
- **Total: ~11,550 tokens** (out of 200k available)

**Key Insight:** Despite bundling extensive scripts, templates, and reference docs across both skills, actual context consumption is minimal because resources remain on filesystem until needed.

---

## Context Window Economics

### Traditional Approach (Embedding Everything)

```markdown
User prompt with all instructions:

# PDF Processing Instructions
[1,000 lines of detailed guidance]

# Error Handling
[500 lines of edge cases]

# API Reference
[2,000 lines of documentation]

# Excel Generation Instructions
[1,500 lines of procedures]

# Example Code
[3,000 lines of samples]

Total: ~8,000 lines × ~4 tokens/line = ~32,000 tokens
Per conversation!
```

**Problems:**
- Consumes 16% of 200k context window immediately
- Same instructions repeated every conversation
- Can't include extensive examples (too many tokens)
- Difficult to maintain and update
- No reusability across sessions

### Skills Approach (Progressive Disclosure)

```markdown
Metadata (always loaded):
  pdf-processing: "Extracts..." (~100 tokens)
  xlsx-generation: "Creates..." (~100 tokens)

Instructions (loaded when relevant):
  pdf-processing/SKILL.md (~2,000 tokens)
  xlsx-generation/SKILL.md (~3,000 tokens)

Resources (0 tokens until accessed):
  pdf-processing/references/ERROR_HANDLING.md
  pdf-processing/references/API_REFERENCE.md
  pdf-processing/scripts/extract_tables.py
  xlsx-generation/assets/table_template.json
  xlsx-generation/references/ADVANCED_FORMATTING.md

Typical Usage: ~5,500 tokens total
```

**Benefits:**
- Consumes <3% of context window
- Reusable across all conversations
- Can bundle unlimited reference material
- Easy to maintain (edit markdown files)
- Composable (combine multiple skills)

---

## Filesystem Access Pattern

### How Claude Accesses Resources

Skills leverage Claude's code execution environment, which provides filesystem access:

```bash
# Claude can use bash tool to read skill files
cat pdf-processing/references/API_REFERENCE.md

# Execute scripts and consume only output
python pdf-processing/scripts/extract_tables.py input.pdf

# Load templates as needed
jq '.' xlsx-generation/assets/table_template.json
```

**Key Mechanism:** Only command *output* enters context, not file contents or script code (unless explicitly read).

### Example: Large Reference Document

```markdown
Skill has 50-page API reference:
  pdf-processing/references/API_REFERENCE.md (100,000 tokens if loaded)

Claude's approach:
  1. SKILL.md mentions: "For field mapping, see references/API_REFERENCE.md section 'Form Fields'"
  2. Claude uses grep: `grep -A 20 "Form Fields" references/API_REFERENCE.md`
  3. Only matching section (500 tokens) enters context
  4. Remaining 99,500 tokens never loaded
```

**Result:** Skills can bundle massive reference materials (API docs, examples, datasets) without context penalties.

---

## Activation Logic

### How Claude Decides to Load a Skill

**Step 1: Semantic Matching**

Claude compares user request against skill descriptions:

```
User: "Build a financial dashboard with charts"

Skills Evaluated:
  pdf-processing: "Extracts text... from PDFs"
    → Relevance: Low (not PDF-related)

  xlsx-generation: "Creates Excel workbooks with formulas, charts..."
    → Relevance: High (charts, workbooks match)

  brand-guidelines: "Enforces visual identity standards..."
    → Relevance: Medium (visual standards might apply)
```

**Step 2: Context Analysis**

Claude considers conversation history:

```
Previous message: "Use our company colors from the brand guide"

Skills Loaded:
  xlsx-generation (charts needed)
  brand-guidelines (colors referenced)
```

**Step 3: Dependency Detection**

Some skills reference others:

```markdown
# In xlsx-generation/SKILL.md
For branded styling, load brand-guidelines skill to get:
  - Primary colors
  - Font selections
  - Logo placement rules
```

Claude automatically loads dependent skills.

### Activation Examples

**Single Skill:**
```
User: "Extract text from this PDF"
Loaded: pdf-processing only
```

**Multiple Skills (Composition):**
```
User: "Create branded PowerPoint from this data"
Loaded: pptx-generation + brand-guidelines
```

**Nested Skills:**
```
User: "Build API client following our standards"
Loaded:
  - api-integration (primary skill)
  - code-style-guide (referenced by api-integration)
  - testing-framework (referenced by api-integration)
```

---

## Skill Composition Architecture

### How Skills Work Together

```
┌──────────────────────────────────────────┐
│  User Request                             │
│  "Create branded presentation from CSV"   │
└──────────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Claude Orchestration │
    └─────────────────────┘
              ↓
  ┌───────────┬───────────┬────────────┐
  ↓           ↓           ↓            ↓
┌────────┐ ┌────────┐ ┌──────────┐ ┌──────┐
│ CSV    │ │ Data   │ │ PowerPoint│ │ Brand│
│ Parser │ │ Viz    │ │ Builder   │ │ Guide│
└────────┘ └────────┘ └──────────┘ └──────┘
    ↓           ↓           ↓            ↓
    └───────────┴───────────┴────────────┘
                    ↓
          Final Presentation
```

**Workflow:**
1. **csv-parser** skill extracts and validates data
2. **data-viz** skill determines appropriate chart types
3. **pptx-builder** skill creates slides with charts
4. **brand-guidelines** skill ensures colors, fonts match standards

Each skill contributes specialized knowledge; Claude orchestrates the complete workflow.

### Real-World Example: Financial Report Generation

```markdown
User: "Generate Q3 financial report following company standards"

Skills Activated:
  1. financial-modeling
     - Load quarterly-report template
     - Calculate standard metrics (revenue, margins, YoY growth)
     - Apply accounting rules

  2. data-visualization
     - Select chart types (revenue: line, expenses: stacked bar)
     - Apply financial-specific formatting (currency, percentages)

  3. xlsx-generation
     - Create multi-sheet workbook
     - Build pivot tables
     - Add charts with data ranges

  4. brand-guidelines
     - Apply company color palette
     - Use approved fonts
     - Include logo placement

  5. compliance-checker
     - Validate required disclosures present
     - Check data sensitivity markings
     - Ensure audit trail included

Claude orchestrates all five skills to produce compliant, branded report.
```

---

## Caching and Performance

### Skill Metadata Caching

Skill metadata is included in system prompt, which is eligible for Claude's prompt caching:

```
First request:
  System Prompt + Skill Metadata (uncached)
  → Full token consumption

Subsequent requests (within cache window):
  System Prompt + Skill Metadata (cached)
  → Reduced latency, lower cost
```

### SKILL.md Caching

Once loaded, SKILL.md files can be cached across turns:

```
Turn 1: User requests PDF processing
  → Load pdf-processing/SKILL.md (uncached)

Turn 2: User requests another PDF operation
  → pdf-processing/SKILL.md (cached)
  → Faster response, lower cost
```

### Resource Optimization

Scripts and references accessed via filesystem don't enter context, so no caching needed—they're already maximally efficient.

---

## Security Considerations

### Skill Validation

Since skills can bundle executable code:

1. **Trust Model:** Only install skills from verified sources
2. **Sandboxing:** Code executes in Claude's isolated environment
3. **Review:** Always inspect SKILL.md and scripts before installation

### Filesystem Isolation

Skills can only access their own directories:

```bash
# Allowed
cat pdf-processing/scripts/extract.py

# Blocked
cat ../../sensitive-data/credentials.json
```

Claude's execution environment enforces path restrictions.

### Instruction Injection Prevention

Skills are loaded into Claude's context, not user input:

- Skills can't be hijacked by user messages
- Clear separation between user intent and skill instructions
- Claude distinguishes between skill guidance and user requests

---

## Technical Implementation (API)

### Required Headers

```python
import anthropic

client = anthropic.Anthropic(api_key="your-key")

response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    headers={
        "anthropic-beta": "code-execution-2025-08-25,files-api-2025-04-14,skills-2025-10-02"
    },
    messages=[...]
)
```

**Beta Features:**
- `code-execution-2025-08-25` - Enable bash/python execution (required for skills)
- `files-api-2025-04-14` - Enable file generation and download
- `skills-2025-10-02` - Enable skills feature

### File Generation Workflow

```python
# Skill creates file during execution
response = client.messages.create(...)

# Response includes file_id
for block in response.content:
    if block.type == "file":
        file_id = block.file_id

        # Download via Files API
        content = client.beta.files.download(file_id=file_id)

        # Save locally
        with open("output.xlsx", "wb") as f:
            f.write(content.read())
```

---

## Key Architectural Principles

### 1. Progressive Disclosure
Load information hierarchically—metadata always, instructions when relevant, resources as needed.

### 2. Filesystem as Storage
Leverage filesystem for unbounded content; only outputs consume context.

### 3. Composability
Design skills to work independently and in combination.

### 4. Context Efficiency
Challenge every token—"Does Claude really need this?"

### 5. Tool Orchestration
Skills guide tool usage; tools execute actions.

---

## Next Steps

- **Create your first skill:** [Quickstart Guide](../02-getting-started/quickstart.md)
- **Understand best practices:** [Progressive Disclosure](../04-best-practices/progressive-disclosure.md)
- **See composition in action:** [Multi-Skill Composition](../07-advanced-topics/multi-skill-composition.md)

---

**Related Documentation:**
- [What Are Skills?](what-are-skills.md)
- [Skills vs Tools](skills-vs-tools.md)
- [Context Efficiency](../04-best-practices/context-efficiency.md)
