# Domain: Scheduling & Calendar

Pre-defined patterns for time-based planning, appointments, resource scheduling, and task sequencing.

## Common Entity Types

```xml
<entity_types>
  <type name="TimeSlot">
    <attributes>
      slot_id, start_time, end_time, duration_minutes
    </attributes>
  </type>
  
  <type name="Resource">
    <attributes>
      resource_id, type, availability_schedule, capacity
    </attributes>
    <examples>room, person, equipment, vehicle</examples>
  </type>
  
  <type name="Task">
    <attributes>
      task_id, duration, priority, deadline, dependencies
    </attributes>
  </type>
  
  <type name="Appointment">
    <attributes>
      appt_id, resource, time_slot, participants, status
    </attributes>
  </type>
</entity_types>
```

## Common State Variables

| Variable | Domain | Description |
|----------|--------|-------------|
| `schedule[resource, time]` | task_id or null | What's assigned when |
| `available[resource, time]` | boolean | Is resource free? |
| `task_status[task]` | enum | pending, scheduled, in_progress, completed |
| `completion_time[task]` | datetime or null | When task finished |
| `utilization[resource]` | percentage | Scheduled time / available time |

## Common Actions

### Scheduling Actions

```xml
<action name="schedule_task">
  <parameters>task_id, resource_id, start_time</parameters>
  <preconditions>
    available[resource_id, start_time : start_time + duration[task_id]] == true
    all dependencies[task_id] have status == "completed"
    start_time + duration[task_id] <= deadline[task_id]
  </preconditions>
  <effects>
    schedule[resource_id, start_time : end_time] := task_id
    available[resource_id, start_time : end_time] := false
    task_status[task_id] := "scheduled"
  </effects>
</action>

<action name="reschedule_task">
  <parameters>task_id, new_start_time</parameters>
  <preconditions>
    task_status[task_id] == "scheduled"
    new slot is available
    new_start_time + duration <= deadline
  </preconditions>
  <effects>
    free old slot
    assign new slot
  </effects>
</action>

<action name="cancel_task">
  <parameters>task_id</parameters>
  <preconditions>
    task_status[task_id] in ["pending", "scheduled"]
  </preconditions>
  <effects>
    if scheduled: free assigned slot
    task_status[task_id] := "cancelled"
    dependent tasks must be rescheduled or cancelled
  </effects>
</action>

<action name="complete_task">
  <parameters>task_id</parameters>
  <preconditions>
    task_status[task_id] == "in_progress"
  </preconditions>
  <effects>
    task_status[task_id] := "completed"
    completion_time[task_id] := now()
    unlock dependent tasks
  </effects>
</action>
```

### Time Calculation Actions

```xml
<action name="find_next_available">
  <parameters>resource_id, duration, after_time</parameters>
  <returns>earliest start_time where resource is free for duration</returns>
</action>

<action name="check_conflicts">
  <parameters>resource_id, start_time, end_time</parameters>
  <returns>list of conflicting task_ids</returns>
</action>
```

## Common Constraints

```xml
<constraints>
  <!-- Time -->
  <invariant id="TIME-1">No overlapping tasks on same resource</invariant>
  <invariant id="TIME-2">task start_time >= max(completion_time of dependencies)</invariant>
  <invariant id="TIME-3">task end_time <= deadline (if deadline exists)</invariant>
  
  <!-- Capacity -->
  <invariant id="CAP-1">concurrent_tasks[resource] <= capacity[resource]</invariant>
  <invariant id="CAP-2">daily_hours[resource] <= max_hours_per_day</invariant>
  
  <!-- Dependencies -->
  <invariant id="DEP-1">Cannot schedule task before its dependencies complete</invariant>
  <invariant id="DEP-2">Circular dependencies are invalid</invariant>
  
  <!-- Business Rules -->
  <invariant id="BUS-1">No scheduling outside business hours (if applicable)</invariant>
  <invariant id="BUS-2">Minimum gap between consecutive tasks (if required)</invariant>
</constraints>
```

## Dependency Graph Pattern

For tasks with dependencies:

```xml
<problem_model task="project_scheduling">
  <entities>
    <entity name="task_A" type="Task" duration="2h" dependencies="[]"/>
    <entity name="task_B" type="Task" duration="3h" dependencies="[A]"/>
    <entity name="task_C" type="Task" duration="1h" dependencies="[A]"/>
    <entity name="task_D" type="Task" duration="2h" dependencies="[B, C]"/>
    <entity name="dev_1" type="Resource" capacity="1"/>
  </entities>
  
  <state_variables>
    <variable name="status_A" initial="pending"/>
    <variable name="status_B" initial="pending"/>
    <variable name="status_C" initial="pending"/>
    <variable name="status_D" initial="pending"/>
    <variable name="current_time" initial="09:00"/>
  </state_variables>
  
  <constraints>
    <invariant>B.start >= A.end</invariant>
    <invariant>C.start >= A.end</invariant>
    <invariant>D.start >= max(B.end, C.end)</invariant>
  </constraints>
  
  <goal>
    <condition>all tasks completed</condition>
    <optimize>minimize total_time (makespan)</optimize>
  </goal>
</problem_model>
```

## Critical Path Calculation

When optimizing schedules:

1. **Forward pass**: Calculate earliest start/end times
2. **Backward pass**: Calculate latest start/end times from deadline
3. **Critical path**: Tasks where earliest == latest (no slack)
4. **Focus**: Prioritize critical path tasks; others have flexibility

## Common Failure Modes

1. **Double booking**: Scheduling overlapping tasks on same resource
2. **Dependency violation**: Starting task before dependencies complete
3. **Deadline miss**: Not accounting for task duration when checking deadline
4. **Phantom availability**: Not updating availability after scheduling
5. **Cascade failure**: Cancelling task without handling dependents
