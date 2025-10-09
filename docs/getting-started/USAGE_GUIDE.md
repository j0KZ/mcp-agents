# MCP Agents Usage Guide

## Quick Start

### 1. Installation

```bash
# Install the orchestrator (includes all learning capabilities)
npx @j0kz/mcp-agents@latest
```

Or install specific tools:

```bash
npm install -g @j0kz/smart-reviewer
npm install -g @j0kz/test-generator
npm install -g @j0kz/security-scanner
# ... etc
```

### 2. Configure in Claude Desktop

Add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "npx",
      "args": ["-y", "@j0kz/orchestrator-mcp"]
    },
    "reviewer": {
      "command": "npx",
      "args": ["-y", "@j0kz/smart-reviewer"]
    },
    "test-gen": {
      "command": "npx",
      "args": ["-y", "@j0kz/test-generator"]
    },
    "security": {
      "command": "npx",
      "args": ["-y", "@j0kz/security-scanner"]
    }
  }
}
```

### 3. Restart Claude Desktop

The tools will now be available in your Claude Code conversations.

---

## Using Phase 3: Intelligent Orchestration

### Simple Task (Claude handles coordination automatically)

Just ask Claude:

```
"Review my codebase, generate tests for untested files,
and scan for security issues"
```

**What happens behind the scenes:**

1. **Orchestrator analyzes** your request
2. **Creates intelligent plan** with 3 stages:
   - Stage 1: Smart Reviewer analyzes code
   - Stage 2: Test Generator (parallel with Security Scanner)
   - Stage 3: Final report synthesis
3. **Executes with retry/fallback** built-in
4. **Returns coordinated results**

### Advanced Orchestration (Explicit Control)

```javascript
// In your Node.js code
import { IntelligentOrchestrator } from '@j0kz/orchestrator-mcp';

const orchestrator = new IntelligentOrchestrator();

const result = await orchestrator.execute({
  task: {
    type: 'code-quality',
    description: 'Full quality audit',
    requirements: {
      mustInclude: ['security', 'testing', 'architecture'],
      priority: 'quality',
      timeConstraint: 300000 // 5 minutes
    }
  }
});

console.log(result.plan); // See the execution plan
console.log(result.results); // Get coordinated results
```

### Consensus Between Tools

When tools disagree, the system reaches intelligent consensus:

```
Claude: "Should this function be async?"

Smart Reviewer: "No - only 1 I/O operation"
Refactor Assistant: "Yes - future scalability"
Architecture Analyzer: "No - adds unnecessary complexity"

→ Consensus Engine applies WEIGHTED_MAJORITY strategy
→ Trust scores: Reviewer(0.9), Refactor(0.85), Arch(0.88)
→ Result: "No, keep synchronous" (higher trust + 2 vs 1 vote)
```

---

## Using Phase 4: Learning & Prediction

### Automatic Learning (Always On)

The system learns from **every decision** automatically:

```
You: "Fix this security issue"

→ System applies fix
→ Monitors if you keep or reject it
→ Measures actual impact (bugs reduced? performance?)
→ Learns for next time

After 100 similar decisions:
→ Accuracy improves from 70% → 85%
→ Suggestions become more aligned with your preferences
```

### Production Monitoring

Track real-world outcomes:

```javascript
import { ProductionMonitor } from '@j0kz/shared/learning';

const monitor = new ProductionMonitor();

// Start monitoring (runs every minute)
await monitor.startMonitoring();

// Check what it's learning
const insights = await monitor.getInsights();

console.log(insights.acceptanceRate); // 78% of suggestions accepted
console.log(insights.topImprovements); // "Security fixes: -40% vulnerabilities"
console.log(insights.rejectionPatterns); // "Users reject 'extract function' for <10 lines"
```

### Predictive Analysis

**Get future predictions:**

```
You: "Predict issues in my codebase"

→ System analyzes:
  - Historical bug patterns
  - Performance trends
  - Security vulnerabilities
  - Technical debt accumulation

→ Returns:
  IMMEDIATE (today):
    - auth.ts line 234: 87% probability of null pointer bug
    - Fix now: Add null check

  THIS WEEK:
    - database.ts: Query time trending up 15%/day
    - Add caching layer before users complain

  THIS MONTH:
    - React 18.3 security patch coming
    - Upgrade before it's critical

  STRATEGIC (3 months):
    - Microservices architecture needed
    - Monolith complexity approaching critical threshold
```

**In code:**

```javascript
import { PredictiveAnalyzer } from '@j0kz/shared/learning';

const analyzer = new PredictiveAnalyzer();

const predictions = await analyzer.predictFuture({
  path: './src',
  lookAheadDays: 30
});

// Prevent issues before they happen
for (const bug of predictions.likelyBugs) {
  if (bug.probability > 0.8) {
    console.log(`HIGH RISK: ${bug.location} - ${bug.issue}`);
    // Auto-fix or alert team
  }
}
```

### Self-Improvement (Autonomous)

The system improves itself **every hour** automatically:

```javascript
import { SelfImprovingSystem } from '@j0kz/shared/learning';

const system = new SelfImprovingSystem();

// Start autonomous improvement loop
await system.startImprovement();

// Check what it's learning
const evolution = await system.getEvolution();

console.log(evolution.improvements);
// [
//   { hypothesis: "Increase learning rate 0.01→0.015",
//     result: "+8% accuracy", applied: true },
//   { hypothesis: "Add confidence threshold 0.7",
//     result: "+12% acceptance", applied: true },
//   { hypothesis: "Enable ensemble voting",
//     result: "-3% performance", applied: false, rolledBack: true }
// ]
```

**It's automatic** - just let it run and it gets better every day.

---

## Real-World Examples

### Example 1: New Feature Development

```
You: "I'm building a payment processing feature"

→ Orchestrator creates plan:
  1. Architecture Analyzer: Check existing payment patterns
  2. Security Scanner: Identify PCI-DSS requirements
  3. Smart Reviewer: Review similar code for best practices
  4. Test Generator: Create security + edge case tests
  5. Doc Generator: Create API documentation

→ Predictive Analyzer warns:
  "90% of payment features have race conditions in transaction handling"
  "Recommend: Add distributed locks before implementing"

→ You implement with guidance
→ System learns your payment code patterns
→ Next payment feature: even better suggestions
```

### Example 2: Bug Investigation

```
You: "Users reporting intermittent 500 errors"

→ Smart Reviewer: Analyzes error-prone patterns
→ Security Scanner: Checks for injection vulnerabilities
→ Architecture Analyzer: Maps request flow dependencies

→ Consensus Engine combines findings:
  "3 tools agree: Race condition in cache invalidation"
  "Evidence: 87% confidence from production logs pattern"

→ Predictive Analyzer:
  "Similar pattern detected in auth.ts - fix there too"
  "If unfixed, 73% probability of customer escalation this week"

→ You fix both
→ System learns this pattern
→ Future race conditions: detected instantly
```

### Example 3: Code Review Automation

```
You: "Review this PR before merge"

→ Multi-tool analysis:
  - Smart Reviewer: Code quality (complexity, duplicates)
  - Test Generator: Coverage gaps + generate missing tests
  - Security Scanner: Vulnerabilities + secrets
  - Architecture Analyzer: Dependency violations

→ Learning Engine checks history:
  "Last 5 PRs with similar pattern: 40% caused production bugs"
  "Common issue: Missing error handling in async functions"

→ Suggestions tailored to YOUR codebase patterns
→ After you merge: monitors production impact
→ Learns what "good" looks like for your team
```

### Example 4: Refactoring Guidance

```
You: "This file is too complex, help me refactor"

→ Refactor Assistant analyzes
→ Specialization System assigns task:
  "Refactor Assistant certified in 'Code Simplification' (Level 8)"
  "91% success rate on complexity reduction tasks"

→ Suggests 3 approaches with confidence:
  1. Extract 4 functions (82% confidence) ← RECOMMENDED
  2. Apply Strategy pattern (67% confidence)
  3. Split into 2 files (54% confidence)

→ You choose option 1
→ System applies, monitors result
→ Complexity reduced 45% (better than 32% average)
→ Learns: "Extract functions works best for this codebase"
```

---

## Configuration Options

### Orchestrator Settings

```json
{
  "orchestrator": {
    "maxParallelTools": 4,
    "retryAttempts": 3,
    "timeoutMs": 300000,
    "consensusStrategy": "weighted-majority",
    "learningEnabled": true
  }
}
```

### Learning Settings

```json
{
  "learning": {
    "enableAutoLearning": true,
    "retrainInterval": 100,
    "predictionEnabled": true,
    "selfImprovement": true,
    "improvementIntervalHours": 1
  }
}
```

### Monitoring Settings

```json
{
  "monitoring": {
    "trackProduction": true,
    "monitorIntervalMs": 60000,
    "minImpactThreshold": 0.1,
    "feedbackEnabled": true
  }
}
```

---

## Tips for Best Results

### 1. Let It Learn
- **First 100 decisions:** System is learning your preferences
- **After 500 decisions:** Accuracy typically hits 85%+
- **After 1000 decisions:** System understands your codebase deeply

### 2. Provide Feedback
```
Bad: Ignore suggestions you don't like
Good: Reject them (system learns what you DON'T want)

Bad: Accept mediocre suggestions
Good: Only accept great ones (raises the bar)
```

### 3. Trust Predictions
- **80%+ probability:** Usually accurate, act on it
- **60-80%:** Worth investigating
- **<60%:** Monitor but don't act yet

### 4. Review Evolution
```bash
# Check what the system has learned
npx @j0kz/orchestrator-mcp --show-learning

# See improvement history
npx @j0kz/orchestrator-mcp --show-evolution

# View current specializations
npx @j0kz/orchestrator-mcp --show-skills
```

### 5. Use Consensus for Important Decisions
```
You: "Should I refactor this critical module?"

→ Request consensus from all tools
→ Require unanimous or Byzantine strategy
→ Get high-confidence answer before proceeding
```

---

## Monitoring Your System

### Check Learning Progress

```javascript
import { LearningEngine } from '@j0kz/shared/learning';

const engine = LearningEngine.getInstance();
const stats = engine.getStats();

console.log(`Total decisions: ${stats.totalDecisions}`);
console.log(`Model accuracy: ${stats.accuracy}%`);
console.log(`Patterns discovered: ${stats.patterns.length}`);
console.log(`Active strategies: ${stats.activeStrategies}`);
```

### View Predictions Dashboard

```bash
# Generate predictions report
npx @j0kz/orchestrator-mcp predict --output report.md

# Watch for high-priority predictions
npx @j0kz/orchestrator-mcp predict --watch --threshold 0.8
```

### Monitor Self-Improvement

```bash
# See recent improvements
npx @j0kz/orchestrator-mcp evolution --recent

# View A/B test results
npx @j0kz/orchestrator-mcp evolution --experiments
```

---

## Troubleshooting

### "Tools not appearing in Claude"
1. Check config file location: `%APPDATA%\Claude\claude_desktop_config.json`
2. Verify JSON syntax (use JSONLint)
3. Restart Claude Desktop completely
4. Check Claude logs: `%APPDATA%\Claude\logs\`

### "Learning seems stuck at low accuracy"
- Need more decisions (target: 100+ for initial learning)
- Check if feedback loop is working: `engine.getStats()`
- Verify production monitoring is enabled

### "Predictions seem random"
- Need historical data (target: 50+ similar decisions)
- Check pattern significance: should be >0.8
- May need to retrain: `analyzer.retrain()`

### "Self-improvement not happening"
- Check if improvement loop is running: `system.getStatus()`
- Verify interval (default: 1 hour)
- Check for errors in improvement log

---

## Next Steps

1. **Install** the tools via Claude Desktop config
2. **Use** them in conversations - orchestration is automatic
3. **Let it learn** - quality improves over time
4. **Check predictions** - prevent issues before they happen
5. **Monitor evolution** - see how it improves itself

The system gets smarter every single day. The more you use it, the better it gets.

**Need help?** Open an issue at https://github.com/j0KZ/my-claude-agents/issues
