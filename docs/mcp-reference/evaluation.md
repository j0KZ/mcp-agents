# MCP Server Evaluation Guide

> **Source:** Adapted from [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) (Apache 2.0)

## Overview

This document provides guidance on creating comprehensive evaluations for MCP servers. Evaluations test whether LLMs can effectively use your MCP server to answer realistic, complex questions using only the tools provided.

---

## Quick Reference

### Evaluation Requirements
- Create 10 human-readable questions
- Questions must be READ-ONLY, INDEPENDENT, NON-DESTRUCTIVE
- Each question requires multiple tool calls (potentially dozens)
- Answers must be single, verifiable values
- Answers must be STABLE (won't change over time)

### Output Format
```xml
<evaluation>
   <qa_pair>
      <question>Your question here</question>
      <answer>Single verifiable answer</answer>
   </qa_pair>
</evaluation>
```

---

## Purpose of Evaluations

The measure of quality of an MCP server is NOT how well or comprehensively the server implements tools, but how well these implementations (input/output schemas, docstrings/descriptions, functionality) enable LLMs with no other context and access ONLY to the MCP servers to answer realistic and difficult questions.

## Core Requirements

1. **Questions MUST be independent** - Each question should NOT depend on the answer to any other question

2. **Questions MUST require ONLY NON-DESTRUCTIVE AND IDEMPOTENT tool use** - Should not instruct or require modifying state

3. **Questions must be REALISTIC, CLEAR, CONCISE, and COMPLEX** - Must require multiple (potentially dozens of) tools or steps

4. **Questions must require deep exploration** - Consider multi-hop questions requiring sequential tool calls

5. **Questions must not be solvable with straightforward keyword search** - Use synonyms, related concepts, or paraphrases

6. **Questions must be designed so the answer DOES NOT CHANGE** - Do not ask questions that rely on dynamic "current state"

## Answer Guidelines

1. **Answers must be VERIFIABLE via direct string comparison**
   - Specify output format in the QUESTION if needed
   - Examples: "Use YYYY/MM/DD.", "Respond True or False."

2. **Answers should prefer HUMAN-READABLE formats**
   - Examples: names, datetime, file names, URLs, yes/no, true/false

3. **Answers must be STABLE/STATIONARY** - Rely on context unlikely to change

4. **Answers must be DIVERSE** - Various modalities: user IDs, names, timestamps, etc.

5. **Answers must NOT be complex structures** - Not lists of values or complex objects

## Good Question Examples

### Multi-hop question (GitHub MCP)
```xml
<qa_pair>
   <question>Find the repository that was archived in Q3 2023 and had previously been the most forked project. What was the primary programming language?</question>
   <answer>Python</answer>
</qa_pair>
```

### Context understanding (Project Management MCP)
```xml
<qa_pair>
   <question>Locate the initiative focused on improving customer onboarding completed in late 2023. What was the project lead's role title?</question>
   <answer>Product Manager</answer>
</qa_pair>
```

### Complex aggregation (Issue Tracker MCP)
```xml
<qa_pair>
   <question>Among critical bugs reported in January 2024, which assignee resolved the highest percentage within 48 hours? Provide their username.</question>
   <answer>alex_eng</answer>
</qa_pair>
```

## Poor Question Examples

### Answer changes over time
```xml
<!-- BAD: Count will change as issues are created/closed -->
<qa_pair>
   <question>How many open issues are currently assigned?</question>
   <answer>47</answer>
</qa_pair>
```

### Too easy with keyword search
```xml
<!-- BAD: Direct title match, no exploration needed -->
<qa_pair>
   <question>Find the PR with title "Add authentication feature"</question>
   <answer>developer123</answer>
</qa_pair>
```

### Ambiguous answer format
```xml
<!-- BAD: List order can vary, hard to verify -->
<qa_pair>
   <question>List all Python repositories</question>
   <answer>repo1, repo2, repo3</answer>
</qa_pair>
```

## Evaluation Process

### Step 1: Documentation Inspection
Read the documentation of the target API to understand available endpoints and functionality.

### Step 2: Tool Inspection
List the tools available in the MCP server. Understand input/output schemas without calling tools.

### Step 3: Read-Only Content Inspection
USE the MCP server tools with READ-ONLY operations to identify specific content for creating questions.

### Step 4: Task Generation
Create 10 human-readable questions following all guidelines above.

## Running Evaluations

### Local STDIO Server
```bash
python scripts/evaluation.py \
  -t stdio \
  -c python \
  -a my_mcp_server.py \
  evaluation.xml
```

### SSE Server
```bash
python scripts/evaluation.py \
  -t sse \
  -u https://example.com/mcp \
  -H "Authorization: Bearer token123" \
  evaluation.xml
```

## Output

The evaluation script generates a report including:
- **Summary Statistics**: Accuracy, average duration, tool calls
- **Per-Task Results**: Expected vs actual answers, pass/fail status

## Tips for Quality Evaluations

1. **Think Hard and Plan Ahead** before generating tasks
2. **Parallelize Where Possible** to speed up the process
3. **Focus on Realistic Use Cases** that humans would want to accomplish
4. **Create Challenging Questions** that test the limits
5. **Ensure Stability** by using historical data
6. **Verify Answers** by solving questions yourself
7. **Iterate and Refine** based on what you learn
