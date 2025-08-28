# Data Tamer Dashboard SDK

A comprehensive TypeScript SDK for the Data Tamer Dashboard API, providing easy access to all platform features including workspaces, topics, datasources, tamed data, AI conversations, billing, and real-time events.

## Installation

```bash
npm install @datatamer/data-tamer-sdk
```

## Quick Start

```typescript
import DataTamerSDK from '@datatamer/data-tamer-sdk';

// Initialize the SDK
const sdk = new DataTamerSDK({
  baseUrl: 'https://app.datatamer.ai/api',
  apiKey: 'your-api-token', // Use API token for authentication
  timeout: 30000
});

// Use the SDK
async function example() {
  // List workspaces (new module name)
  const workspaces = await sdk.workspaces.listWorkspaces();
  
  // Create a topic (new module name)
  const topic = await sdk.topics.createTopic({
    name: 'My Topic',
    description: 'A sample topic',
    organizationId: workspaces[0].id
  });
  
  // Start real-time connection
  await sdk.realtime.connect({}, {
    onMessage: (data) => console.log('Real-time event:', data),
    onOpen: () => console.log('Connected to real-time stream')
  });
}
```

## Authentication

The SDK supports two authentication methods:

### API Token (Recommended)
Create an API token in your account settings and use it for authentication:

```typescript
const sdk = new DataTamerSDK({
  baseUrl: 'https://app.datatamer.ai/api',
  apiKey: 'your-api-token' // Get this from your account settings
});
```

### Session Token (Browser sessions)
For browser-based applications using session cookies:

```typescript
const sdk = new DataTamerSDK({
  baseUrl: 'https://app.datatamer.ai/api',
  sessionToken: 'your-session-token'
});
```

## Module Naming

The SDK provides both legacy and new module names for better semantic clarity:

- **Legacy**: `sdk.organizations` → **New**: `sdk.workspaces`
- **Legacy**: `sdk.projects` → **New**: `sdk.topics`

Both naming conventions work and provide identical functionality. The legacy names are maintained for backward compatibility.

```typescript
// New naming (recommended)
const workspaces = await sdk.workspaces.listWorkspaces();
const topics = await sdk.topics.listTopics(workspaceId);

// Legacy naming (still works)
const workspaces = await sdk.organizations.listWorkspaces();
const topics = await sdk.projects.listTopics(workspaceId);
```

## Modules

### Workspaces

Manage workspaces, users, roles, and billing.

```typescript
// List workspaces (using new module name)
const workspaces = await sdk.workspaces.listWorkspaces();

// Legacy support (still works)
const workspaces_legacy = await sdk.organizations.listWorkspaces();

// Create workspace
const newWorkspace = await sdk.workspaces.createWorkspace({
  name: 'My Company',
  description: 'Company workspace'
});

// Get dashboard data
const dashboard = await sdk.workspaces.getWorkspaceDashboard(workspaceId);

// Add user to workspace
await sdk.workspaces.addUserToWorkspace(workspaceId, 'user@example.com');

// Change user role
await sdk.workspaces.changeUserRoleInWorkspace(workspaceId, userId, 'admin');

// Manage billing
const billing = await sdk.workspaces.getBillingHistory(workspaceId);
await sdk.workspaces.topUpCredits(workspaceId, 100);
```

### Topics

Manage topics, users, and actions.

```typescript
// List topics (using new module name)
const topics = await sdk.topics.listTopics(workspaceId);

// Legacy support (still works)
const topics_legacy = await sdk.projects.listTopics(workspaceId);

// Create topic
const topic = await sdk.topics.createTopic({
  name: 'Data Analysis Topic',
  description: 'Analyzing customer data',
  organizationId: workspaceId
});

// Topic chat
const chatResponse = await sdk.topics.chatInTopic(
  topicId, 
  'Help me analyze this data',
  { context: 'customer_data' }
);

// Manage topic users
const users = await sdk.topics.listTopicUsers(topicId);
await sdk.topics.addUserToTopic(topicId, 'analyst@company.com', 'member');

// Topic actions
const actions = await sdk.topics.listTopicActions(topicId);
await sdk.topics.addTopicAction(topicId, {
  name: 'Data Validation',
  description: 'Validate data quality',
  actionType: 'validation',
  parameters: { threshold: 0.95 }
});
```

### Datasources

Manage data sources and connections.

```typescript
// List datasources
const datasources = await sdk.datasources.listForWorkspace(workspaceId);

// Create SQL datasource
const sqlDatasource = await sdk.datasources.create({
  name: 'Customer Database',
  description: 'Main customer data',
  organizationId: workspaceId,
  datasourceType: 'SQL',
  configuration: {
    host: 'db.company.com',
    port: 5432,
    database: 'customers',
    username: 'readonly',
    password: 'secret'
  }
});

// Test connections
const sqlTest = await sdk.datasources.testSqlConnection({
  host: 'db.company.com',
  port: 5432,
  database: 'customers',
  username: 'readonly',
  password: 'secret'
});

const gitTest = await sdk.datasources.testGitConnection({
  repositoryUrl: 'https://github.com/company/data-repo',
  branch: 'main',
  accessToken: 'github-token'
});

// Process datasources
await sdk.datasources.rebuild(datasourceId);
await sdk.datasources.stop(datasourceId);

// Stream data
await sdk.datasources.stream(datasourceId, {
  content: { temperature: 25.5, humidity: 60 },
  metadata: { sensor: 'office-1' },
  timestamp: new Date().toISOString()
});
```

### Tamed Data

Manage processed data and API keys.

```typescript
// Create tamed data
const tamedData = await sdk.tamedData.create({
  name: 'Processed Customer Data',
  description: 'Cleaned and validated customer data',
  projectId: topicId,
  datasourceId: datasourceId,
  dataType: 'tabular',
  configuration: { format: 'parquet' }
});

// Create with wire connections
const tamedDataWithWires = await sdk.tamedData.createWithWires({
  name: 'Connected Data',
  description: 'Data with relationships',
  projectId: topicId,
  datasourceId: datasourceId,
  dataType: 'relational'
}, [
  {
    originTable: 'customers',
    originField: 'id',
    destinationTable: 'orders',
    destinationField: 'customer_id'
  }
]);

// API key management
const apiKey = await sdk.tamedData.generateApiKey(tamedDataId);

// Stream API integration
const streamData = await sdk.tamedData.getStreamData(tamedDataId, apiKey.apiKey);
await sdk.tamedData.sendToStream(tamedDataId, apiKey.apiKey, {
  content: { processed: true, records: 1000 },
  metadata: { batch: '2024-01-01' }
});

// Search stream data
const searchResults = await sdk.tamedData.searchStream(tamedDataId, apiKey.apiKey, {
  query: 'processed:true',
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-02T00:00:00Z',
  limit: 100
});
```

### AI Conversations

Manage AI conversations and prompts.

```typescript
// Start new conversation
const { conversation, response } = await sdk.conversations.startConversation(
  workspaceId,
  topicId,
  'Analyze the customer churn data and provide insights',
  'Customer Churn Analysis'
);

// Continue conversation
const nextResponse = await sdk.conversations.continueConversation(
  conversation.id,
  'What are the main factors contributing to churn?'
);

// Get conversation history
const history = await sdk.conversations.getHistory(workspaceId, topicId);

// Get full conversation
const fullConversation = await sdk.conversations.getFullConversation(conversationId);

// Conversation management
await sdk.conversations.editTitle(conversationId, 'Updated Analysis');
const stats = await sdk.conversations.getStats(workspaceId, topicId);
```

### Billing

Manage subscriptions and billing.

```typescript
// Get subscription status
const subscription = await sdk.billing.getSubscription();
const status = await sdk.billing.getSubscriptionStatus();

// Create subscription
const newSub = await sdk.billing.createSubscription('pro-plan', workspaceId);

// Manage subscription
await sdk.billing.cancelSubscriptionAtPeriodEnd(subscriptionId);
await sdk.billing.resumeSubscription(subscriptionId);

// Token checkout
const checkout = await sdk.billing.createTokenCheckout(workspaceId, 'token-pack-100');

// Billing analytics
const spending = await sdk.billing.getTotalSpending(workspaceId);
const monthly = await sdk.billing.getMonthlySpending(workspaceId, 2024, 1);
const attention = await sdk.billing.needsAttention();
```

### Real-time Events

Connect to server-sent events for real-time updates.

```typescript
// Basic connection
await sdk.realtime.connect({
  reconnect: true,
  maxReconnectAttempts: 5,
  reconnectInterval: 3000
}, {
  onMessage: (data) => console.log('Event:', data),
  onOpen: () => console.log('Connected'),
  onError: (error) => console.error('Error:', error)
});

// Subscribe to specific events
const unsubscribe = sdk.realtime.onNotifications((notification) => {
  console.log('New notification:', notification);
});

// Datasource updates
sdk.realtime.onDatasourceUpdates((update) => {
  console.log('Datasource updated:', update);
});

// AI responses
sdk.realtime.onAIResponses((response) => {
  console.log('AI response:', response);
});

// Filter all events
const unsubscribeAll = sdk.realtime.onAllEvents(
  (eventType, data) => eventType.includes('error'),
  (eventType, data) => console.log('Error event:', eventType, data)
);

// Auto-reconnect with exponential backoff
sdk.realtime.enableAutoReconnect(1000, 30000, 10);

// Cleanup
unsubscribe();
sdk.realtime.disconnect();
```

## Error Handling

The SDK throws `DataTamerError` instances with detailed information:

```typescript
import { DataTamerError } from '@datatamer/data-tamer-sdk';

try {
  await sdk.organizations.createWorkspace({ name: '', description: '' });
} catch (error) {
  if (error instanceof DataTamerError) {
    console.error(`API Error (${error.status}): ${error.message}`);
    console.error('Details:', error.details);
  }
}
```

## Configuration Options

```typescript
const sdk = new DataTamerSDK({
  baseUrl: 'https://app.datatamer.ai/api', // Required
  apiKey: 'your-api-token',                 // API token (recommended)
  sessionToken: 'session-token',            // Session token (optional)
  timeout: 30000                            // Optional (default: 30000ms)
});
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { 
  Organization, 
  Project, 
  Datasource, 
  TamedData,
  Conversation,
  DataTamerError 
} from '@datatamer/data-tamer-sdk';

// All API responses are properly typed
const workspaces: Organization[] = await sdk.organizations.listWorkspaces();
const topic: Project = await sdk.projects.getTopic(topicId);
```

## Advanced Usage

### Batch Operations

```typescript
// Create multiple datasources
const datasources = [
  { name: 'DB1', description: 'Database 1', /* ... */ },
  { name: 'DB2', description: 'Database 2', /* ... */ }
];

const results = await Promise.all(
  datasources.map(ds => sdk.datasources.create(ds))
);
```

### Waiting for Status Changes

```typescript
// Wait for datasource to be active
const activeDatasource = await sdk.datasources.waitForStatus(
  datasourceId, 
  'ACTIVE', 
  60000 // 60 second timeout
);
```

### Streaming with Retries

```typescript
// Send stream data with automatic retries
await sdk.tamedData.sendToStreamWithRetry(
  tamedDataId,
  apiKey,
  { content: data },
  3,    // max retries
  1000  // retry delay
);
```

### Health Monitoring

```typescript
// Check SDK health
const health = await sdk.healthCheck();
console.log('SDK Status:', health.status);
console.log('Service Status:', health.services);
```

## Examples

See the `/examples` directory for complete working examples:

- [Basic Usage](examples/basic-usage.js)
- [Data Pipeline](examples/data-pipeline.js)
- [Real-time Dashboard](examples/realtime-dashboard.js)
- [AI Assistant](examples/ai-assistant.js)

## Support

For support, please check:

1. [API Documentation](https://your-instance.com/api-docs)
2. [GitHub Issues](https://github.com/your-org/data-tamer-sdk/issues)
3. [Documentation](https://docs.datatamer.com)

## License

MIT License - see [LICENSE](LICENSE) for details.