#!/usr/bin/env python3
"""
Model-First Reasoning: Model Validator

Validates problem models for completeness and consistency.
Accepts XML or JSON format.

Usage:
    python validate_model.py model.xml
    python validate_model.py model.json
    python validate_model.py --stdin < model.xml
"""

import sys
import json
import re
from dataclasses import dataclass, field
from typing import Optional
from pathlib import Path

try:
    import xml.etree.ElementTree as ET
    HAS_XML = True
except ImportError:
    HAS_XML = False


@dataclass
class ValidationResult:
    valid: bool = True
    errors: list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    
    def add_error(self, msg: str):
        self.errors.append(f"ERROR: {msg}")
        self.valid = False
    
    def add_warning(self, msg: str):
        self.warnings.append(f"WARNING: {msg}")
    
    def report(self) -> str:
        lines = []
        if self.valid:
            lines.append("✓ Model is valid")
        else:
            lines.append("✗ Model has errors")
        
        for err in self.errors:
            lines.append(f"  {err}")
        for warn in self.warnings:
            lines.append(f"  {warn}")
        
        return "\n".join(lines)


def extract_references(text: str) -> set:
    """Extract variable/entity references from a string."""
    # Match patterns like: var_name, entity.attr, action(param)
    refs = set()
    # Simple variable names
    refs.update(re.findall(r'\b([a-z_][a-z0-9_]*)\b', text.lower()))
    # Bracketed references like stock[sku]
    refs.update(re.findall(r'(\w+)\[', text))
    return refs


def validate_xml_model(xml_string: str) -> ValidationResult:
    """Validate an XML problem model."""
    result = ValidationResult()
    
    if not HAS_XML:
        result.add_error("XML parsing not available")
        return result
    
    try:
        root = ET.fromstring(xml_string)
    except ET.ParseError as e:
        result.add_error(f"Invalid XML: {e}")
        return result
    
    # Collect defined names
    entities = set()
    state_vars = set()
    actions = set()
    constraints = set()
    
    # Check entities
    entities_elem = root.find('.//entities')
    if entities_elem is None:
        result.add_warning("No <entities> section found")
    else:
        for entity in entities_elem.findall('entity'):
            name = entity.get('name')
            if not name:
                result.add_error("Entity missing 'name' attribute")
            else:
                if name in entities:
                    result.add_error(f"Duplicate entity name: {name}")
                entities.add(name)
    
    # Check state variables
    state_elem = root.find('.//state_variables')
    if state_elem is None:
        result.add_warning("No <state_variables> section found")
    else:
        for var in state_elem.findall('variable'):
            name = var.get('name')
            if not name:
                result.add_error("Variable missing 'name' attribute")
            else:
                if name in state_vars:
                    result.add_error(f"Duplicate state variable: {name}")
                state_vars.add(name)
            
            if var.get('initial') is None and var.get('domain') is None:
                result.add_warning(f"Variable '{name}' has no initial value or domain")
    
    # Check actions
    actions_elem = root.find('.//actions')
    if actions_elem is None:
        result.add_warning("No <actions> section found")
    else:
        for action in actions_elem.findall('action'):
            name = action.get('name')
            if not name:
                result.add_error("Action missing 'name' attribute")
            else:
                actions.add(name)
            
            # Check preconditions exist
            preconds = action.find('preconditions')
            if preconds is None or len(preconds) == 0:
                result.add_warning(f"Action '{name}' has no preconditions (consider adding at least one)")
            
            # Check effects exist
            effects = action.find('effects')
            if effects is None or len(effects) == 0:
                result.add_warning(f"Action '{name}' has no effects defined")
    
    # Check constraints
    constraints_elem = root.find('.//constraints')
    if constraints_elem is None:
        result.add_warning("No <constraints> section found")
    else:
        for inv in constraints_elem.findall('invariant'):
            inv_id = inv.get('id')
            if inv_id:
                constraints.add(inv_id)
            if not inv.text or not inv.text.strip():
                result.add_error(f"Constraint {inv_id or '(unnamed)'} has no content")
    
    # Check goal
    goal_elem = root.find('.//goal')
    if goal_elem is None:
        result.add_warning("No <goal> section found")
    
    # Summary
    if not entities:
        result.add_error("No entities defined")
    if not state_vars:
        result.add_error("No state variables defined")
    if not actions:
        result.add_error("No actions defined")
    
    return result


def validate_json_model(json_string: str) -> ValidationResult:
    """Validate a JSON problem model."""
    result = ValidationResult()
    
    try:
        model = json.loads(json_string)
    except json.JSONDecodeError as e:
        result.add_error(f"Invalid JSON: {e}")
        return result
    
    if not isinstance(model, dict):
        result.add_error("Model must be a JSON object")
        return result
    
    # Check required sections
    entities = model.get('entities', [])
    state_vars = model.get('state_variables', [])
    actions = model.get('actions', [])
    constraints = model.get('constraints', [])
    
    if not entities:
        result.add_error("No entities defined")
    if not state_vars:
        result.add_error("No state_variables defined")
    if not actions:
        result.add_error("No actions defined")
    if not constraints:
        result.add_warning("No constraints defined")
    
    # Validate entities
    entity_names = set()
    for e in entities:
        name = e.get('name') if isinstance(e, dict) else None
        if not name:
            result.add_error("Entity missing 'name' field")
        elif name in entity_names:
            result.add_error(f"Duplicate entity: {name}")
        else:
            entity_names.add(name)
    
    # Validate state variables
    var_names = set()
    for v in state_vars:
        name = v.get('name') if isinstance(v, dict) else None
        if not name:
            result.add_error("State variable missing 'name' field")
        elif name in var_names:
            result.add_error(f"Duplicate state variable: {name}")
        else:
            var_names.add(name)
    
    # Validate actions
    for a in actions:
        name = a.get('name') if isinstance(a, dict) else None
        if not name:
            result.add_error("Action missing 'name' field")
        if isinstance(a, dict):
            if not a.get('preconditions'):
                result.add_warning(f"Action '{name}' has no preconditions")
            if not a.get('effects'):
                result.add_warning(f"Action '{name}' has no effects")
    
    # Check goal
    if 'goal' not in model:
        result.add_warning("No goal defined")
    
    return result


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    if sys.argv[1] == '--stdin':
        content = sys.stdin.read()
        # Try to detect format
        content_stripped = content.strip()
        if content_stripped.startswith('<'):
            result = validate_xml_model(content)
        elif content_stripped.startswith('{'):
            result = validate_json_model(content)
        else:
            print("ERROR: Could not detect format (expected XML or JSON)")
            sys.exit(1)
    else:
        filepath = Path(sys.argv[1])
        if not filepath.exists():
            print(f"ERROR: File not found: {filepath}")
            sys.exit(1)
        
        content = filepath.read_text()
        
        if filepath.suffix.lower() == '.xml':
            result = validate_xml_model(content)
        elif filepath.suffix.lower() == '.json':
            result = validate_json_model(content)
        else:
            # Try to detect
            if content.strip().startswith('<'):
                result = validate_xml_model(content)
            else:
                result = validate_json_model(content)
    
    print(result.report())
    sys.exit(0 if result.valid else 1)


if __name__ == '__main__':
    main()
