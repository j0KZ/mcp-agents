/**
 * Inter-Tool Message Bus - Phase 1.3 of Evolution Plan
 * Enables MCP tools to communicate and share insights
 */
import { EventEmitter } from 'events';
export type MessageType = 'insight' | 'request' | 'response' | 'warning' | 'broadcast';
export interface MCPMessage {
    id: string;
    from: string;
    to: string | 'broadcast';
    type: MessageType;
    subject: string;
    data: any;
    confidence: number;
    timestamp: Date;
    requiresResponse?: boolean;
    inReplyTo?: string;
}
export interface MessageHandler {
    toolId: string;
    patterns: string[];
    handler: (message: MCPMessage) => Promise<MCPMessage | void>;
}
export interface MessageStats {
    sent: number;
    received: number;
    processed: number;
    failed: number;
    averageResponseTime: number;
}
export declare class MessageBus extends EventEmitter {
    private handlers;
    private messages;
    private pendingResponses;
    private stats;
    private subscriptions;
    constructor();
    /**
     * Register a tool with the message bus
     */
    register(toolId: string, handler?: MessageHandler): void;
    /**
     * Send a message
     */
    send(message: Omit<MCPMessage, 'id' | 'timestamp'>): Promise<MCPMessage | void>;
    /**
     * Send and wait for response
     */
    request(message: Omit<MCPMessage, 'id' | 'timestamp' | 'requiresResponse'>): Promise<MCPMessage>;
    /**
     * Subscribe to messages matching patterns
     */
    subscribe(toolId: string, patterns: string[]): void;
    /**
     * Share an insight with interested tools
     */
    shareInsight(from: string, insight: {
        type: string;
        data: any;
        confidence: number;
        affects?: string[];
    }): Promise<void>;
    /**
     * Request collaboration from another tool
     */
    requestCollaboration(from: string, to: string, task: {
        type: string;
        data: any;
        urgency: 'low' | 'medium' | 'high';
    }): Promise<MCPMessage>;
    /**
     * Broadcast a message to all tools
     */
    private broadcast;
    /**
     * Deliver a message to a specific tool
     */
    private deliver;
    /**
     * Setup built-in handlers for common patterns
     */
    private setupBuiltInHandlers;
    /**
     * Get message history
     */
    getHistory(filter?: {
        from?: string;
        to?: string;
        type?: MessageType;
        since?: Date;
    }): MCPMessage[];
    /**
     * Get statistics for a tool
     */
    getStats(toolId: string): MessageStats | undefined;
    /**
     * Get all statistics
     */
    getAllStats(): Map<string, MessageStats>;
    /**
     * Clear old messages (keep last 1000)
     */
    cleanup(): void;
    /**
     * Example: Smart collaboration between tools
     */
    facilitateCollaboration(task: {
        type: string;
        input: any;
        requiredTools: string[];
    }): Promise<any>;
}
export declare function getMessageBus(): MessageBus;
/**
 * Example usage for tools to communicate:
 *
 * const bus = getMessageBus();
 *
 * // Register security scanner
 * bus.register('security-scanner', {
 *   toolId: 'security-scanner',
 *   patterns: ['code-review', 'security'],
 *   handler: async (msg) => {
 *     const vulnerabilities = await scanCode(msg.data);
 *     return {
 *       ...createResponse(msg),
 *       data: vulnerabilities
 *     };
 *   }
 * });
 *
 * // Test generator can ask for security insights
 * const insights = await bus.request({
 *   from: 'test-generator',
 *   to: 'security-scanner',
 *   type: 'request',
 *   subject: 'security-check',
 *   data: { code: sourceCode },
 *   confidence: 0.8
 * });
 */ 
//# sourceMappingURL=message-bus.d.ts.map