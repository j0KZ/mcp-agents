/**
 * Diagram Generator Module
 * Generates ER diagrams in multiple formats (Mermaid, DBML, PlantUML)
 */
export function generateMermaidDiagram(schema, options) {
    let diagram = 'erDiagram\n';
    const tables = schema.tables || schema.collections || [];
    // Define entities
    for (const table of tables) {
        const tableName = table.name;
        diagram += `  ${tableName} {\n`;
        if (options.includeColumns) {
            const columns = table.columns || table.fields || [];
            for (const col of columns.slice(0, 10)) { // Limit to 10 columns
                const colName = col.name;
                const colType = 'type' in col ? col.type : '';
                diagram += `    ${colType} ${colName}\n`;
            }
        }
        diagram += `  }\n`;
    }
    // Add relationships
    if (options.includeRelationships) {
        for (const rel of schema.relationships || []) {
            const cardinality = rel.type === 'ONE_TO_ONE' ? '||--||' :
                rel.type === 'ONE_TO_MANY' ? '||--o{' :
                    '}o--o{';
            diagram += `  ${rel.from.table} ${cardinality} ${rel.to.table} : "${rel.name}"\n`;
        }
    }
    return diagram;
}
export function generateDBMLDiagram(schema, _options) {
    let dbml = '';
    for (const table of schema.tables || []) {
        dbml += `Table ${table.name} {\n`;
        for (const col of table.columns) {
            let line = `  ${col.name} ${col.type.toLowerCase()}`;
            if (col.primaryKey)
                line += ' [pk]';
            if (col.unique)
                line += ' [unique]';
            if (!col.nullable)
                line += ' [not null]';
            dbml += line + '\n';
        }
        dbml += '}\n\n';
    }
    // Add references
    for (const table of schema.tables || []) {
        for (const fk of table.foreignKeys || []) {
            dbml += `Ref: ${table.name}.${fk.column} > ${fk.referencedTable}.${fk.referencedColumn}\n`;
        }
    }
    return dbml;
}
export function generatePlantUMLDiagram(schema, _options) {
    let uml = '@startuml\n';
    for (const table of schema.tables || schema.collections || []) {
        uml += `entity ${table.name} {\n`;
        const columns = table.columns || table.fields || [];
        for (const col of columns) {
            const pk = 'primaryKey' in col && col.primaryKey ? ' <<PK>>' : '';
            const colType = 'type' in col ? col.type : '';
            uml += `  ${col.name} : ${colType}${pk}\n`;
        }
        uml += '}\n\n';
    }
    // Add relationships
    for (const rel of schema.relationships || []) {
        uml += `${rel.from.table} ${rel.type === 'ONE_TO_MANY' ? '||--o{' : '||--||'} ${rel.to.table}\n`;
    }
    uml += '@enduml\n';
    return uml;
}
//# sourceMappingURL=diagram-generator.js.map