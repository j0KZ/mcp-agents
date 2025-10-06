/**
 * Inter-Tool Message Bus - Phase 1.3 of Evolution Plan
 * Enables MCP tools to communicate and share insights
 */

import { EventEmitter } from 'events';
import { randomUUID } from 'crypto';

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

export class MessageBus extends EventEmitter {
  private handlers: Map<string, MessageHandler[]> = new Map();
  private messages: MCPMessage[] = [];
  private pendingResponses: Map<string, (response: MCPMessage) => void> = new Map();
  private stats: Map<string, MessageStats> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();

  constructor() {
    super();
    this.setupBuiltInHandlers();
  }

  /**
   * Register a tool with the message bus
   */
  register(toolId: string, handler?: MessageHandler): void {
    if (!this.handlers.has(toolId)) {
      this.handlers.set(toolId, []);
      this.stats.set(toolId, {
        sent: 0,
        received: 0,
        processed: 0,
        failed: 0,
        averageResponseTime: 0
      });
      this.subscriptions.set(toolId, new Set());
    }

    if (handler) {
      this.handlers.get(toolId)!.push(handler);
    }

    this.emit('tool:registered', { toolId });
  }

  /**
   * Send a message
   */
  async send(message: Omit<MCPMessage, 'id' | 'timestamp'>): Promise<MCPMessage | void> {
    const fullMessage: MCPMessage = {
      ...message,
      id: randomUUID(),
      timestamp: new Date()
    };

    // Store message
    this.messages.push(fullMessage);

    // Update stats
    const fromStats = this.stats.get(message.from);
    if (fromStats) {
      fromStats.sent++;
    }

    // Emit for monitoring
    this.emit('message:sent', fullMessage);

    // Handle broadcast
    if (message.to === 'broadcast') {
      return this.broadcast(fullMessage);
    }

    // Handle direct message
    if (message.to) {
      return this.deliver(fullMessage);
    }
  }

  /**
   * Send and wait for response
   */
  async request(
    message: Omit<MCPMessage, 'id' | 'timestamp' | 'requiresResponse'>
  ): Promise<MCPMessage> {
    const fullMessage = {
      ...message,
      requiresResponse: true
    };

    return new Promise((resolve, reject) => {
      const msgId = randomUUID();
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(msgId);
        reject(new Error(`Request timeout for message ${msgId}`));
      }, 5000); // 5 second timeout

      this.pendingResponses.set(msgId, (response: MCPMessage) => {
        clearTimeout(timeout);
        this.pendingResponses.delete(msgId);
        resolve(response);
      });

      this.send({ ...fullMessage, id: msgId } as any);
    });
  }

  /**
   * Subscribe to messages matching patterns
   */
  subscribe(toolId: string, patterns: string[]): void {
    patterns.forEach(pattern => {
      const subs = this.subscriptions.get(pattern) || new Set();
      subs.add(toolId);
      this.subscriptions.set(pattern, subs);
    });
  }

  /**
   * Share an insight with interested tools
   */
  async shareInsight(
    from: string,
    insight: {
      type: string;
      data: any;
      confidence: number;
      affects?: string[];
    }
  ): Promise<void> {
    const message: Omit<MCPMessage, 'id' | 'timestamp'> = {
      from,
      to: 'broadcast',
      type: 'insight',
      subject: `Insight: ${insight.type}`,
      data: insight.data,
      confidence: insight.confidence
    };

    // Send to specific tools if mentioned
    if (insight.affects) {
      for (const tool of insight.affects) {
        await this.send({ ...message, to: tool });
      }
    } else {
      await this.send(message);
    }
  }

  /**
   * Request collaboration from another tool
   */
  async requestCollaboration(
    from: string,
    to: string,
    task: {
      type: string;
      data: any;
      urgency: 'low' | 'medium' | 'high';
    }
  ): Promise<MCPMessage> {
    const message: Omit<MCPMessage, 'id' | 'timestamp' | 'requiresResponse'> = {
      from,
      to,
      type: 'request',
      subject: `Collaboration request: ${task.type}`,
      data: task,
      confidence: 0.9
    };

    return this.request(message);
  }

  /**
   * Broadcast a message to all tools
   */
  private async broadcast(message: MCPMessage): Promise<void> {
    const tools = Array.from(this.handlers.keys()).filter(t => t !== message.from);

    const deliveries = tools.map(tool =>
      this.deliver({ ...message, to: tool })
    );

    await Promise.all(deliveries);
  }

  /**
   * Deliver a message to a specific tool
   */
  private async deliver(message: MCPMessage): Promise<MCPMessage | void> {
    const toStats = this.stats.get(message.to);
    if (toStats) {
      toStats.received++;
    }

    // Find handlers for this tool
    const toolHandlers = this.handlers.get(message.to) || [];

    // Find matching handlers
    const matchingHandlers = toolHandlers.filter(h =>
      h.patterns.some(pattern =>
        pattern === '*' ||
        message.type === pattern ||
        message.subject.includes(pattern)
      )
    );

    if (matchingHandlers.length === 0) {
      this.emit('message:unhandled', message);
      return;
    }

    const startTime = Date.now();

    try {
      // Process with all matching handlers
      const results = await Promise.all(
        matchingHandlers.map(h => h.handler(message))
      );

      // Update stats
      if (toStats) {
        toStats.processed++;
        const duration = Date.now() - startTime;
        toStats.averageResponseTime =
          (toStats.averageResponseTime * (toStats.processed - 1) + duration) /
          toStats.processed;
      }

      // Handle responses
      const response = results.find(r => r !== undefined);

      if (message.requiresResponse && response) {
        const pendingHandler = this.pendingResponses.get(message.id);
        if (pendingHandler) {
          pendingHandler(response);
        }
      }

      this.emit('message:processed', { message, response });
      return response;
    } catch (error) {
      if (toStats) {
        toStats.failed++;
      }
      this.emit('message:error', { message, error });
      throw error;
    }
  }

  /**
   * Setup built-in handlers for common patterns
   */
  private setupBuiltInHandlers(): void {
    // Health check handler
    this.handlers.set('_system', [{
      toolId: '_system',
      patterns: ['ping'],
      handler: async (msg) => ({
        id: randomUUID(),
        from: '_system',
        to: msg.from,
        type: 'response',
        subject: 'pong',
        data: { alive: true, timestamp: new Date() },
        confidence: 1,
        timestamp: new Date(),
        inReplyTo: msg.id
      })
    }]);
  }

  /**
   * Get message history
   */
  getHistory(filter?: {
    from?: string;
    to?: string;
    type?: MessageType;
    since?: Date;
  }): MCPMessage[] {
    let messages = [...this.messages];

    if (filter) {
      if (filter.from) {
        messages = messages.filter(m => m.from === filter.from);
      }
      if (filter.to) {
        messages = messages.filter(m => m.to === filter.to);
      }
      if (filter.type) {
        messages = messages.filter(m => m.type === filter.type);
      }
      if (filter.since) {
        messages = messages.filter(m => m.timestamp >= filter.since);
      }
    }

    return messages;
  }

  /**
   * Get statistics for a tool
   */
  getStats(toolId: string): MessageStats | undefined {
    return this.stats.get(toolId);
  }

  /**
   * Get all statistics
   */
  getAllStats(): Map<string, MessageStats> {
    return new Map(this.stats);
  }

  /**
   * Clear old messages (keep last 1000)
   */
  cleanup(): void {
    if (this.messages.length > 1000) {
      this.messages = this.messages.slice(-1000);
    }
  }

  /**
   * Example: Smart collaboration between tools
   */
  async facilitateCollaboration(
    task: {
      type: string;
      input: any;
      requiredTools: string[];
    }
  ): Promise<any> {
    const results: any[] = [];
    const context: any = { ...task.input };

    // Sequential collaboration with context passing
    for (const tool of task.requiredTools) {
      const message: Omit<MCPMessage, 'id' | 'timestamp' | 'requiresResponse'> = {
        from: '_orchestrator',
        to: tool,
        type: 'request',
        subject: `${task.type} - step ${results.length + 1}`,
        data: {
          task: task.type,
          input: context,
          previousResults: results
        },
        confidence: 0.9
      };

      const response = await this.request(message);

      if (response && response.data) {
        results.push({
          tool,
          result: response.data
        });

        // Update context with new information
        Object.assign(context, response.data);
      }
    }

    return {
      task: task.type,
      results,
      finalContext: context
    };
  }
}

// Singleton instance
let messageBus: MessageBus | null = null;

export function getMessageBus(): MessageBus {
  if (!messageBus) {
    messageBus = new MessageBus();
  }
  return messageBus;
}

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