# Phase 1: Model Construction Template

Use this template to build the explicit problem model before reasoning.

## Template Structure

```xml
<problem_model task="[brief task description]">
  
  <entities>
    <!-- List all objects/agents involved -->
    <entity name="[unique_id]" type="[category]">
      <attribute name="[attr]" value="[initial_value]"/>
    </entity>
  </entities>
  
  <state_variables>
    <!-- Properties that can change during execution -->
    <variable name="[var_name]" domain="[type/range]" initial="[value]"/>
  </state_variables>
  
  <actions>
    <!-- Available operations -->
    <action name="[action_name]">
      <parameters>[param1, param2]</parameters>
      <preconditions>
        <condition>[state requirement]</condition>
      </preconditions>
      <effects>
        <effect>[state_var] := [new_value]</effect>
      </effects>
    </action>
  </actions>
  
  <constraints>
    <!-- Invariants that must NEVER be violated -->
    <invariant id="C1">[constraint description]</invariant>
  </constraints>
  
  <goal>
    <!-- Success criteria -->
    <condition>[what must be true at end]</condition>
  </goal>
  
</problem_model>
```

## Construction Checklist

Before proceeding to Phase 2, verify:

- [ ] Every entity mentioned in actions is defined in `<entities>`
- [ ] Every state variable in preconditions/effects is in `<state_variables>`
- [ ] Every action has at least one precondition (even if trivial)
- [ ] Every constraint is testable (can determine true/false)
- [ ] Initial state is complete (no undefined values)
- [ ] Goal conditions reference defined state variables

## Domain Extraction Questions

When analyzing a problem, ask:

1. **What are the things?** → Entities
2. **What changes?** → State variables
3. **What can I do?** → Actions
4. **What must always be true?** → Constraints
5. **What am I trying to achieve?** → Goal

## Markdown Alternative

For simpler problems, use markdown tables:

```markdown
## Entities
| ID | Type | Initial State |
|----|------|---------------|
| product_A | SKU | stock=100, price=5000 |

## State Variables
| Variable | Domain | Initial |
|----------|--------|---------|
| stock_A | integer ≥ 0 | 100 |

## Actions
| Action | Preconditions | Effects |
|--------|---------------|---------|
| sell(product, qty) | stock[product] ≥ qty | stock[product] -= qty |

## Constraints
- C1: stock[*] ≥ 0 (never negative inventory)
- C2: price[*] > cost[*] * 1.05 (minimum 5% margin)

## Goal
- All orders fulfilled
- No constraint violations
```

## Anti-Patterns

**❌ Vague entities:**
```
entity: "the products" 
```

**✓ Specific entities:**
```
entity: product_SKU123 type=physical_good stock=50
```

**❌ Implicit constraints:**
```
"make sure we don't run out"
```

**✓ Explicit constraints:**
```
INVARIANT: stock[product] >= safety_stock[product]
```

**❌ Undefined effects:**
```
action: process_order → "updates inventory"
```

**✓ Defined effects:**
```
action: process_order(sku, qty)
  effects: inventory[sku] := inventory[sku] - qty
           revenue := revenue + (price[sku] * qty)
```
