# Phase 2: Reasoning Over Model

Execute the plan using ONLY the constructed model. Every action must be validated against the model before execution.

## Execution Template

```markdown
## Initial State
[Copy state from model - this is your starting point]

---

## Step 1: [action_name(parameters)]

**Precondition Check:**
- [precondition_1]: ✓ satisfied (current: [value], required: [condition])
- [precondition_2]: ✓ satisfied

**Execute Effects:**
- [state_var_1] := [old_value] → [new_value]
- [state_var_2] := [old_value] → [new_value]

**Constraint Verification:**
- C1 ([description]): ✓ holds ([current_value] satisfies [condition])
- C2 ([description]): ✓ holds

**State After Step 1:**
| Variable | Value |
|----------|-------|
| var_1 | new_value_1 |
| var_2 | new_value_2 |

---

## Step 2: [action_name(parameters)]
[repeat structure]

---

## Final State
[Complete state after all steps]

## Goal Verification
- [goal_condition_1]: ✓ achieved
- [goal_condition_2]: ✓ achieved

## Plan Summary
1. [action_1] 
2. [action_2]
...
```

## Conflict Handling

If a precondition fails:

```markdown
## Step N: [action_name(parameters)]

**Precondition Check:**
- [precondition_1]: ✓ satisfied
- [precondition_2]: ✗ FAILED (current: [value], required: [condition])

**BLOCKED**: Cannot execute this action.

**Options:**
1. Find alternative action that achieves same goal
2. Execute prerequisite actions first to satisfy precondition
3. Revise plan if goal is unreachable

**Resolution:** [chosen path]
```

If a constraint would be violated:

```markdown
## Step N: [action_name(parameters)]

**Precondition Check:** ✓ all satisfied

**Effect Preview:**
- [state_var] would become [new_value]

**Constraint Check:**
- C1: ✓ would hold
- C2: ✗ WOULD VIOLATE ([new_value] breaks [constraint])

**REJECTED**: This action violates constraint C2.

**Alternatives:**
1. [different action that doesn't violate]
2. [modified parameters]
3. [prerequisite to make it safe]
```

## Reasoning Discipline

### DO:
- Reference model explicitly for every check
- Show your math (if stock=50 and qty=30, then 50-30=20)
- Update state table after each step
- Verify ALL constraints, not just obvious ones

### DON'T:
- Assume preconditions are met without checking
- Skip constraint verification "because it's obvious"
- Reference information not in the model
- Batch multiple actions without intermediate state checks

## Backtracking

If you reach a dead end:

```markdown
## Backtrack Point

**Current State:** [state at dead end]
**Problem:** [why we're stuck]
**Backtracking to:** Step [N]

**Revised State:** [state at backtrack point]
**New Approach:** [what we'll try instead]
```

## Completion Criteria

Plan is complete when:
1. All goal conditions are satisfied
2. Final state violates no constraints
3. Every step was validated against the model

## Compact Format (for simple plans)

When model is small and plan is short:

```
Initial: {stock_A: 100, cash: 5000}

S1: sell(A, 20) 
    pre: stock_A(100) ≥ 20 ✓
    eff: stock_A := 80, cash := 5000 + 400 = 5400
    C1(stock≥0): 80≥0 ✓

S2: restock(A, 50)
    pre: cash(5400) ≥ cost(2500) ✓
    eff: stock_A := 130, cash := 2900
    C1: 130≥0 ✓, C2(cash≥0): 2900≥0 ✓

Final: {stock_A: 130, cash: 2900}
Goal: stock_A > 100 ✓
```
