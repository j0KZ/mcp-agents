# Domain: Resource Allocation

Pre-defined patterns for distributing limited resources across competing demands, budget allocation, and capacity planning.

## Common Entity Types

```xml
<entity_types>
  <type name="Resource">
    <attributes>
      resource_id, type, total_capacity, unit, replenishment_rate
    </attributes>
    <examples>budget, compute, storage, bandwidth, headcount, materials</examples>
  </type>
  
  <type name="Consumer">
    <attributes>
      consumer_id, priority, min_allocation, max_allocation, demand
    </attributes>
    <examples>project, department, customer, process</examples>
  </type>
  
  <type name="Allocation">
    <attributes>
      allocation_id, resource, consumer, amount, period, status
    </attributes>
  </type>
  
  <type name="Pool">
    <attributes>
      pool_id, resources[], consumers[], policy
    </attributes>
  </type>
</entity_types>
```

## Common State Variables

| Variable | Domain | Description |
|----------|--------|-------------|
| `total[resource]` | decimal ≥ 0 | Total available capacity |
| `allocated[resource]` | decimal ≥ 0 | Currently assigned |
| `available[resource]` | computed | total - allocated |
| `allocation[resource, consumer]` | decimal ≥ 0 | Amount assigned to consumer |
| `utilization[resource]` | percentage | allocated / total |
| `satisfaction[consumer]` | percentage | allocation / demand |

## Common Actions

### Allocation Actions

```xml
<action name="allocate">
  <parameters>resource_id, consumer_id, amount</parameters>
  <preconditions>
    available[resource_id] >= amount
    amount >= min_allocation[consumer_id] (if minimum exists)
    amount <= max_allocation[consumer_id] (if maximum exists)
  </preconditions>
  <effects>
    allocation[resource_id, consumer_id] += amount
    allocated[resource_id] += amount
    available[resource_id] -= amount
  </effects>
</action>

<action name="deallocate">
  <parameters>resource_id, consumer_id, amount</parameters>
  <preconditions>
    allocation[resource_id, consumer_id] >= amount
  </preconditions>
  <effects>
    allocation[resource_id, consumer_id] -= amount
    allocated[resource_id] -= amount
    available[resource_id] += amount
  </effects>
</action>

<action name="reallocate">
  <parameters>resource_id, from_consumer, to_consumer, amount</parameters>
  <preconditions>
    allocation[resource_id, from_consumer] >= amount
    resulting allocation respects to_consumer limits
  </preconditions>
  <effects>
    allocation[resource_id, from_consumer] -= amount
    allocation[resource_id, to_consumer] += amount
  </effects>
</action>

<action name="reserve">
  <parameters>resource_id, amount, purpose</parameters>
  <preconditions>
    available[resource_id] >= amount
  </preconditions>
  <effects>
    reserved[resource_id] += amount
    available[resource_id] -= amount
  </effects>
</action>
```

### Pool Management

```xml
<action name="create_pool">
  <parameters>resources[], consumers[], policy</parameters>
  <effects>
    new pool created with shared resources
    policy determines allocation rules
  </effects>
</action>

<action name="expand_capacity">
  <parameters>resource_id, additional_amount, cost</parameters>
  <preconditions>
    budget >= cost (if budget constrained)
  </preconditions>
  <effects>
    total[resource_id] += additional_amount
    available[resource_id] += additional_amount
    if budgeted: budget -= cost
  </effects>
</action>
```

## Common Constraints

```xml
<constraints>
  <!-- Capacity -->
  <invariant id="CAP-1">allocated[resource] <= total[resource]</invariant>
  <invariant id="CAP-2">allocation[resource, consumer] >= 0</invariant>
  <invariant id="CAP-3">sum(allocation[resource, *]) == allocated[resource]</invariant>
  
  <!-- Fairness -->
  <invariant id="FAIR-1">allocation >= min_allocation (if guaranteed)</invariant>
  <invariant id="FAIR-2">allocation <= max_allocation (if capped)</invariant>
  <invariant id="FAIR-3">priority_A > priority_B → satisfaction_A >= satisfaction_B (if strict priority)</invariant>
  
  <!-- Business -->
  <invariant id="BUS-1">reserved[resource] <= reserve_limit (don't hoard)</invariant>
  <invariant id="BUS-2">utilization[resource] >= min_utilization (avoid waste)</invariant>
  
  <!-- Budget -->
  <invariant id="BUD-1">total_cost <= budget</invariant>
  <invariant id="BUD-2">allocation_cost[consumer] <= consumer_budget</invariant>
</constraints>
```

## Allocation Strategies

### Priority-Based

```xml
<policy name="priority_allocation">
  <steps>
    1. Sort consumers by priority (descending)
    2. For each consumer in order:
       a. Calculate demand
       b. Allocate min(demand, available, max_allocation)
       c. Update available
    3. If resources remain: second pass for additional allocation
  </steps>
</policy>
```

### Proportional

```xml
<policy name="proportional_allocation">
  <steps>
    1. Calculate total_demand = sum(demand[*])
    2. For each consumer:
       allocation = (demand / total_demand) * total_available
       adjusted for min/max constraints
    3. Iterate if constraints caused under/over allocation
  </steps>
</policy>
```

### Budget Optimization

```xml
<problem_model task="budget_allocation">
  <entities>
    <entity name="budget" type="Resource" total="1000000"/>
    <entity name="project_A" type="Consumer" priority="high" min="100000" roi="1.5"/>
    <entity name="project_B" type="Consumer" priority="medium" min="50000" roi="2.0"/>
    <entity name="project_C" type="Consumer" priority="low" min="0" roi="1.2"/>
  </entities>
  
  <state_variables>
    <variable name="alloc_A" domain="[100000, 500000]"/>
    <variable name="alloc_B" domain="[50000, 300000]"/>
    <variable name="alloc_C" domain="[0, 200000]"/>
  </state_variables>
  
  <constraints>
    <invariant>alloc_A + alloc_B + alloc_C <= 1000000</invariant>
    <invariant>alloc_A >= 100000</invariant>  <!-- min guarantee -->
    <invariant>alloc_B >= 50000</invariant>
  </constraints>
  
  <goal>
    <optimize>maximize sum(alloc_i * roi_i)</optimize>
  </goal>
</problem_model>
```

## Conflict Resolution

When demand exceeds supply:

```xml
<conflict_resolution>
  <strategy name="priority_cutoff">
    Satisfy high priority fully, then medium, then low with remainder
  </strategy>
  
  <strategy name="proportional_reduction">
    Reduce all allocations proportionally until sum <= available
  </strategy>
  
  <strategy name="min_guarantee_first">
    1. Allocate min_allocation to all
    2. Distribute remainder by priority/demand
  </strategy>
  
  <strategy name="auction">
    Consumers bid for resources; highest value use wins
  </strategy>
</conflict_resolution>
```

## Common Failure Modes

1. **Over-allocation**: Assigning more than available (failed capacity check)
2. **Fragmentation**: Small unusable remainders across pools
3. **Starvation**: Low-priority consumers never get resources
4. **Hoarding**: Reserved resources never used
5. **Thrashing**: Constant reallocation without stability
6. **Budget leak**: Allocations exceed cost constraints
