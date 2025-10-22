# Skills vs Tools: Understanding the Distinction

**Skills and tools serve different purposes in Claude's ecosystem. Understanding the distinction is critical for effective implementation.**

---

## Core Distinction

### Tools: Actions Claude Can Take

**Tools** are specific capabilities that enable Claude to **perform actions**:

- Execute code (Python, JavaScript, bash)
- Fetch web content
- Read and write files
- Query databases
- Call APIs
- Run system commands

**Example Tools:**

- `bash` - Execute shell commands
- `python` - Run Python code
- `web_fetch` - Retrieve web pages
- `file_read` - Access filesystem
- `api_call` - HTTP requests

**Key Characteristic:** Tools are **what Claude can do**.

### Skills: Knowledge About How to Use Tools

**Skills** are instruction packages that teach Claude **when and how** to use tools effectively:

- Procedural workflows
- Domain expertise
- Best practices
- Error handling patterns
- Validation requirements
- Output formatting preferences

**Example Skills:**

- `pdf-processing` - How to extract, merge, fill PDFs using file and code tools
- `api-integration` - How to design robust API workflows using HTTP tools
- `brand-guidelines` - How to apply visual identity using design tools
- `testing-automation` - How to write effective tests using code tools

**Key Characteristic:** Skills are **how and when Claude uses tools**.

---

## Analogy: Carpenter and Toolbox

Think of Claude as a skilled carpenter:

### Tools = Physical Tools

- **Hammer** (bash command execution)
- **Saw** (file reading/writing)
- **Drill** (code execution)
- **Measuring tape** (data validation)

The carpenter _has_ these tools but needs to know:

- Which tool for which job?
- In what order?
- With what technique?
- How to handle errors?

### Skills = Craft Knowledge

- **"Building a Deck" Skill:**
  ```
  1. Measure and mark posts (use measuring tape)
  2. Dig post holes (use drill)
  3. Set posts in concrete (specific technique)
  4. Attach joists with proper spacing
  5. Lay decking boards with expansion gaps
  6. Validate structural integrity
  ```

The skill tells the carpenter **which tools to use, when, and how** to build a specific thing correctly.

---

## Concrete Examples

### Example 1: PDF Form Filling

#### Without a Skill (Just Tools)

```
User: "Fill this PDF form with customer data"

Claude (with tools only):
  • Has: bash, python, file_read, file_write tools
  • Doesn't know:
    - Which PDF library is reliable?
    - How to handle encrypted PDFs?
    - What output format to use?
    - How to validate field mapping?
    - Error handling patterns?

  Result: Suboptimal approach, inconsistent results
```

#### With a Skill

```
User: "Fill this PDF form with customer data"

Claude (with pdf-processing skill):
  • Loads pdf-processing skill instructions
  • Follows established workflow:
    1. Validate PDF is readable
    2. Map JSON fields to PDF form fields
    3. Use scripts/fill_form.py (tested, reliable)
    4. Verify all required fields populated
    5. Return summary with field count

  Result: Consistent, validated, high-quality output
```

**The Skill Provides:**

- Tested code (scripts/fill_form.py)
- Error handling patterns
- Field mapping guidance (references/FORMS.md)
- Validation requirements
- Output format standards

### Example 2: API Integration

#### Tool-Only Approach

```python
# Claude with API tools but no skill
import requests

# Makes request, but:
# - No rate limiting
# - No retry logic
# - No error categorization
# - No response validation
# - No idempotency handling

response = requests.post("https://api.example.com/users", json=data)
```

#### Skill-Guided Approach

```python
# Claude with api-integration skill

# Skill teaches:
# 1. Validate input first
validate_user_data(data)

# 2. Check for existing resource (idempotency)
existing = check_existing_user(data['email'])

# 3. Use retry logic with exponential backoff
response = api_call_with_retry(
    endpoint="/users",
    method="POST",
    data=data,
    max_retries=3
)

# 4. Categorize errors and handle appropriately
if response.status == 409:
    return merge_with_existing(existing, data)
elif response.status >= 500:
    queue_for_retry(data)

# 5. Return human-readable summary
return format_user_summary(response.data)
```

**The Skill Provides:**

- Validated helper functions (scripts/api_helpers.py)
- Error categorization logic
- Idempotency patterns
- Human-readable output formatting
- Edge case handling

---

## Relationship Between Skills and Tools

### Skills Orchestrate Tools

```
┌──────────────────────────────────┐
│         Skill Layer              │
│  (Procedural Knowledge)          │
│                                  │
│  • When to use tools             │
│  • In what sequence              │
│  • With what parameters          │
│  • How to validate results       │
└──────────────────────────────────┘
              ↓
  Instructs and coordinates
              ↓
┌──────────────────────────────────┐
│         Tool Layer               │
│  (Action Capabilities)           │
│                                  │
│  bash  │ python │ file_read │   │
│  http  │ db_query │ etc...  │   │
└──────────────────────────────────┘
```

**Example Workflow:**

```
User: "Build a financial dashboard from this CSV"

Skill: xlsx (Excel generation skill)
  ↓ instructs
Tool: file_read (load CSV)
  ↓ then
Tool: python (process data, calculate metrics)
  ↓ then
Tool: code_execution (generate Excel file with charts)
  ↓ then
Tool: file_write (save workbook)

Result: Professional dashboard with pivot tables, charts, formatting
```

### Skills Reference External Resources

Tools can't bundle knowledge, but skills can:

```
skill-name/
├── SKILL.md                  ← Instructions (orchestration logic)
├── scripts/
│   └── helper.py             ← Pre-written, tested code
├── references/
│   └── API_REFERENCE.md      ← Detailed documentation
└── assets/
    └── template.json         ← Starting templates
```

When Claude uses the skill:

1. Loads SKILL.md (instructions)
2. Executes scripts/helper.py via **python tool**
3. Reads API_REFERENCE.md via **file_read tool**
4. Applies template.json via **json parsing tool**

**Skills package the knowledge, tools execute the actions.**

---

## When to Use Skills vs Tools

### Use Tools Directly When:

✅ **One-off, simple tasks**

```
User: "Show me the files in the current directory"
Claude: [Uses bash tool directly: `ls -la`]
```

✅ **Exploratory analysis**

```
User: "What's in this JSON file?"
Claude: [Uses file_read tool: reads and parses]
```

✅ **No established workflow exists**

```
User: "Try parsing this unusual data format"
Claude: [Experiments with tools to find approach]
```

### Use Skills When:

✅ **Repeatable workflows**

```
User: "Generate weekly sales report" [5th time]
Claude: [Loads sales-reporting skill → consistent process]
```

✅ **Complex, multi-step processes**

```
User: "Build React component with accessibility"
Claude: [Loads component-builder skill → validated patterns]
```

✅ **Domain-specific expertise required**

```
User: "Create HIPAA-compliant data export"
Claude: [Loads healthcare-compliance skill → regulations]
```

✅ **Quality/consistency critical**

```
User: "Apply brand guidelines to presentation"
Claude: [Loads brand-guidelines skill → standards enforcement]
```

---

## Skills Complement Tools, Not Replace Them

### The Symbiotic Relationship

**Tools provide capabilities** → Skills provide wisdom

| Aspect          | Tools            | Skills                                      |
| --------------- | ---------------- | ------------------------------------------- |
| **What**        | Specific actions | Workflows and processes                     |
| **How**         | Direct execution | Orchestration and guidance                  |
| **When**        | Any time         | Context-dependent activation                |
| **Why**         | Perform tasks    | Ensure quality, consistency, best practices |
| **Scope**       | Single operation | Multi-step procedures                       |
| **Knowledge**   | None (stateless) | Domain expertise, patterns, conventions     |
| **Reusability** | Always available | Load when relevant                          |

### Example: Building a REST API Client

**Tools Needed:**

- `http_request` - Make API calls
- `python` - Process responses
- `file_write` - Save outputs
- `json_parse` - Handle data

**Skill Needed:**

- `api-client-builder` skill:
  ```markdown
  1. Design client architecture (validate inputs)
  2. Implement request wrapper with retries
  3. Handle pagination (cursors vs offsets)
  4. Parse and normalize responses
  5. Cache results when idempotent
  6. Provide clear error messages
  7. Include usage examples
  ```

**Outcome:**

- **Tools** execute the HTTP requests and file operations
- **Skill** ensures the client is robust, maintainable, and follows best practices

---

## MCP Tools vs Claude Skills

### MCP Tools (This Project: @j0kz/mcp-agents)

**Model Context Protocol tools** extend Claude with custom capabilities:

```typescript
// MCP Tool: Custom action
{
  name: "analyze_code_quality",
  description: "Analyzes code complexity and suggests improvements",
  inputSchema: { ... },
  handler: async (input) => {
    // Custom logic to analyze code
    return qualityReport;
  }
}
```

**MCP tools** are like adding new tools to Claude's toolbox:

- New **actions** Claude can perform
- Custom **capabilities** specific to your domain
- **Extend** the base tool set

### Claude Skills Work WITH MCP Tools

You can create **skills that teach Claude how to use your MCP tools effectively:**

```markdown
---
name: code-quality-workflow
description: Comprehensive code review using custom MCP quality tools
---

# Code Quality Workflow

When reviewing code:

1. Run analyze_code_quality MCP tool on each file
2. Categorize issues by severity (critical, moderate, minor)
3. For critical issues, run generate_auto_fixes
4. Present findings in priority order
5. Validate fixes don't introduce regressions
```

**The skill teaches:**

- _When_ to use the analyze_code_quality MCP tool
- _How_ to interpret results
- _What_ to do with findings
- _How_ to validate fixes

---

## Key Takeaways

1. **Tools = Actions** - What Claude can do (bash, python, file ops)
2. **Skills = Knowledge** - How and when to use tools effectively
3. **Skills orchestrate tools** - Provide workflows, patterns, validation
4. **Skills bundle resources** - Scripts, docs, templates that tools execute
5. **Both are essential** - Tools provide capability, skills provide wisdom
6. **MCP tools extend capabilities** - Skills teach how to use them well

---

## Practical Decision Matrix

| Question                                  | Answer | Use                              |
| ----------------------------------------- | ------ | -------------------------------- |
| Is this a one-time exploratory task?      | Yes    | Tools directly                   |
| Will this workflow be repeated?           | Yes    | Create a skill                   |
| Do quality/consistency matter critically? | Yes    | Create a skill                   |
| Is domain expertise required?             | Yes    | Create a skill                   |
| Is this a simple, well-known operation?   | Yes    | Tools directly                   |
| Do you need to enforce standards?         | Yes    | Create a skill                   |
| Are there multiple ways to accomplish it? | Yes    | Create a skill (encode best way) |
| Do you want to share this approach?       | Yes    | Create a skill                   |

---

## Next Steps

- **Understand skills architecture:** [Architecture Deep Dive](architecture.md)
- **See skills in action:** [Examples](../08-examples/)
- **Build your first skill:** [Quickstart Guide](../02-getting-started/quickstart.md)
- **Create skills for MCP tools:** [MCP Integration](../10-mcp-integration/skills-for-mcp-tools.md)

---

**Related Documentation:**

- [What Are Skills?](what-are-skills.md)
- [Progressive Disclosure](../04-best-practices/progressive-disclosure.md)
- [Development Workflow](../06-development-workflow/creation-process.md)
