/**
 * Diagram Generator Module
 * Generates ER diagrams in multiple formats (Mermaid, DBML, PlantUML)
 */
import { DatabaseSchema, ERDiagramOptions } from '../types.js';
export declare function generateMermaidDiagram(schema: DatabaseSchema, options: ERDiagramOptions): string;
export declare function generateDBMLDiagram(schema: DatabaseSchema, _options: ERDiagramOptions): string;
export declare function generatePlantUMLDiagram(schema: DatabaseSchema, _options: ERDiagramOptions): string;
//# sourceMappingURL=diagram-generator.d.ts.map