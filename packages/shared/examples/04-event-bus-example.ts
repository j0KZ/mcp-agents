/**
 * Example 4: Using MCPEventBus for real-time communication between tools
 *
 * This example demonstrates how MCPs can communicate through events,
 * allowing loosely coupled integrations.
 */

import { MCPEventBus } from '../src/integration/index.js';
import { FileWatcher } from '../src/fs/index.js';
import { EVENT_TYPE } from '../src/constants/index.js';

// Simulate MCP tools
class ArchitectureAnalyzer {
  constructor(private eventBus: MCPEventBus) {
    // Listen for file changes
    this.eventBus.on(EVENT_TYPE.FILE_CHANGED, this.handleFileChange.bind(this));
  }

  private handleFileChange(data: any) {
    console.log('🏗️  Architecture Analyzer: File changed, analyzing impact...');
    console.log(`   File: ${data.filePath}`);

    // Analyze and emit results
    this.eventBus.emit(EVENT_TYPE.ANALYSIS_COMPLETED, {
      tool: 'architecture-analyzer',
      filePath: data.filePath,
      impact: 'medium',
      affectedModules: ['auth', 'api'],
    });
  }
}

class SmartReviewer {
  constructor(private eventBus: MCPEventBus) {
    // Listen for analysis completion
    this.eventBus.on(EVENT_TYPE.ANALYSIS_COMPLETED, this.handleAnalysisComplete.bind(this));
  }

  private handleAnalysisComplete(data: any) {
    if (data.tool === 'architecture-analyzer') {
      console.log('🔍 Smart Reviewer: Architecture analyzed, reviewing code quality...');

      // Review and emit results
      this.eventBus.emit(EVENT_TYPE.ANALYSIS_COMPLETED, {
        tool: 'smart-reviewer',
        filePath: data.filePath,
        issues: [{ severity: 'medium', message: 'Consider extracting function' }],
      });
    }
  }
}

class TestGenerator {
  constructor(private eventBus: MCPEventBus) {
    // Listen for code review completion
    this.eventBus.on(EVENT_TYPE.ANALYSIS_COMPLETED, this.handleReviewComplete.bind(this));
  }

  private handleReviewComplete(data: any) {
    if (data.tool === 'smart-reviewer' && data.issues.length > 0) {
      console.log('🧪 Test Generator: Issues found, generating tests...');

      // Generate tests
      this.eventBus.emit('tests:generated', {
        filePath: data.filePath,
        testCount: data.issues.length * 2,
      });
    }
  }
}

class NotificationService {
  constructor(private eventBus: MCPEventBus) {
    // Listen to all events
    this.eventBus.on(EVENT_TYPE.ANALYSIS_COMPLETED, this.notify.bind(this));
    this.eventBus.on('tests:generated', this.notify.bind(this));
  }

  private notify(data: any) {
    console.log('📢 Notification:', JSON.stringify(data, null, 2));
  }
}

async function demonstrateEventBus() {
  console.log('🎯 Event Bus Integration Demo\n');

  const eventBus = new MCPEventBus();

  // Initialize tools
  const architectureAnalyzer = new ArchitectureAnalyzer(eventBus);
  const smartReviewer = new SmartReviewer(eventBus);
  const testGenerator = new TestGenerator(eventBus);
  const notificationService = new NotificationService(eventBus);

  console.log('✅ All tools initialized and listening\n');

  // Simulate file change
  console.log('📝 Simulating file change...\n');
  eventBus.emit(EVENT_TYPE.FILE_CHANGED, {
    filePath: './src/auth/login.ts',
    changeType: 'modified',
  });

  // Wait for async processing
  await new Promise(resolve => setTimeout(resolve, 100));

  // Event bus statistics
  console.log('\n📊 Event Bus Statistics:');
  console.log(`  file:changed listeners: ${eventBus.listenerCount(EVENT_TYPE.FILE_CHANGED)}`);
  console.log(
    `  analysis:completed listeners: ${eventBus.listenerCount(EVENT_TYPE.ANALYSIS_COMPLETED)}`
  );
  console.log(`  tests:generated listeners: ${eventBus.listenerCount('tests:generated')}`);

  // Demonstrate one-time listener
  console.log('\n\n🎯 Demonstrating one-time listener:');
  eventBus.once('special:event', data => {
    console.log('✨ One-time handler executed:', data);
  });

  eventBus.emit('special:event', { message: 'First emit' });
  console.log('  Listener count after first emit:', eventBus.listenerCount('special:event'));

  eventBus.emit('special:event', { message: 'Second emit (ignored)' });
  console.log('  Listener count after second emit:', eventBus.listenerCount('special:event'));

  // Real-world example: File watching with event bus
  console.log('\n\n👀 Real-world example: File watching integration');
  const fileWatcher = new FileWatcher(500); // 500ms debounce

  const unwatch = fileWatcher.watch(
    './packages/smart-reviewer/src',
    (event, filename) => {
      eventBus.emit(EVENT_TYPE.FILE_CHANGED, {
        event,
        filePath: filename,
        timestamp: new Date().toISOString(),
      });
    },
    { recursive: true }
  );

  console.log('✅ File watcher connected to event bus');
  console.log('   Watching: ./packages/smart-reviewer/src');
  console.log('   Changes will trigger the entire analysis pipeline');

  // Cleanup
  setTimeout(() => {
    unwatch();
    console.log('\n🧹 Cleanup completed');
  }, 1000);
}

// Run example
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEventBus()
    .then(() => console.log('\n✅ Event bus demonstration completed'))
    .catch(err => console.error('❌ Demo failed:', err));
}
