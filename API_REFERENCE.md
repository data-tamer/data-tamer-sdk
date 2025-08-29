# Data Tamer SDK API Reference

Complete API reference for the Data Tamer TypeScript SDK v2.0.0.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Authentication](#authentication)
- [Core Modules](#core-modules)
  - [Authentication (auth)](#authentication-auth)
  - [Workspaces (workspaces/organizations)](#workspaces-workspacesorganizations)
  - [Topics (topics/projects)](#topics-topicsprojects)
  - [Datasources (datasources)](#datasources-datasources)
  - [Tamed Data (tamedData)](#tamed-data-tameddata)
  - [Conversations (conversations)](#conversations-conversations)
  - [Billing (billing)](#billing-billing)
  - [Users (users)](#users-users)
  - [Real-time (realtime)](#real-time-realtime)
  - [Notifications (notifications)](#notifications-notifications)
  - [Integrations (integrations)](#integrations-integrations)
  - [Templates (templates)](#templates-templates)
- [Types & Interfaces](#types--interfaces)
- [Error Handling](#error-handling)

## Installation & Setup

```bash
npm install @datatamer/data-tamer-sdk
```

```typescript
import DataTamerSDK from '@datatamer/data-tamer-sdk';

const sdk = new DataTamerSDK({
  baseUrl: 'https://app.datatamer.ai/api',
  apiKey: 'your-api-token', // Required
  timeout: 30000 // Optional (default: 30000ms)
});
```

## Authentication

The SDK supports API token authentication. Get your API token from your account settings.

```typescript
// Create SDK instance
const sdk = new DataTamerSDK({
  baseUrl: 'https://app.datatamer.ai/api',
  apiKey: 'your-api-token'
});

// Verify authentication
const user = await sdk.users.getCurrentUser();
console.log(`Authenticated as: ${user.email}`);
```

## Core Modules

---

### Authentication (auth)

Handles OAuth, account creation, and external platform integrations.

#### `getGoogleAuthUrl(request?: GoogleAuthUrlRequest): Promise<GoogleAuthUrlResponse>`

Generate Google OAuth authorization URL.

**Parameters:**
- `request` (optional): `{ redirectUrl?: string }`

**Returns:** `{ authUrl: string }`

```typescript
const authResponse = await sdk.auth.getGoogleAuthUrl({
  redirectUrl: 'https://yourapp.com/callback'
});
console.log('OAuth URL:', authResponse.authUrl);
```

#### `handleGoogleCallback(request: GoogleCallbackRequest): Promise<GoogleTokenResponse>`

Handle Google OAuth callback.

**Parameters:**
- `request`: `{ code: string; redirect_uri?: string }`

**Returns:** `{ access_token: string; refresh_token?: string; expires_in: number; token_type: string }`

```typescript
const tokens = await sdk.auth.handleGoogleCallback({
  code: 'auth-code-from-google',
  redirect_uri: 'https://yourapp.com/callback'
});
```

#### `refreshGoogleToken(request: GoogleRefreshRequest): Promise<GoogleTokenResponse>`

Refresh Google OAuth access token.

**Parameters:**
- `request`: `{ refresh_token: string }`

```typescript
const newTokens = await sdk.auth.refreshGoogleToken({
  refresh_token: 'stored-refresh-token'
});
```

#### `getAuthProvider(): Promise<AuthProviderResponse>`

Check if user authenticated via social login.

**Returns:** `{ provider: 'google' | 'github' | 'email' | 'unknown' }`

```typescript
const provider = await sdk.auth.getAuthProvider();
console.log('Auth provider:', provider.provider);
```

#### `createAccount(data): Promise<AccountCreationResponse>`

Create account with default workspace.

**Parameters:**
- `data`: 
  ```typescript
  {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    workspaceName: string;
    workspaceDescription?: string;
  }
  ```

```typescript
const account = await sdk.auth.createAccount({
  email: 'user@company.com',
  password: 'secure-password',
  firstName: 'John',
  lastName: 'Doe',
  workspaceName: 'My Company'
});
```

#### `createExternalAccount(request: CreateExternalAccountRequest): Promise<CreateExternalAccountResponse>`

Create user account from external platform (requires API key).

**Parameters:**
- `request`: 
  ```typescript
  {
    email: string;
    firstName: string;
    lastName: string;
    workspaceName: string;
    workspaceDescription?: string;
    externalPlatform: string;
    externalUserId: string;
    metadata?: Record<string, any>;
  }
  ```

```typescript
const externalAccount = await sdk.auth.createExternalAccount({
  email: 'user@external.com',
  firstName: 'Jane',
  lastName: 'Smith',
  workspaceName: 'External Workspace',
  externalPlatform: 'custom-platform',
  externalUserId: 'ext-user-123'
});
```

---

### Workspaces (workspaces/organizations)

Manage workspaces, users, roles, and billing. Both `workspaces` and `organizations` modules provide identical functionality.

#### `listWorkspaces(): Promise<Organization[]>`

List all workspaces for the current user.

```typescript
const workspaces = await sdk.workspaces.listWorkspaces();
// or
const workspaces = await sdk.organizations.listWorkspaces();

workspaces.forEach(workspace => {
  console.log(`${workspace.name} (${workspace.id})`);
});
```

#### `createWorkspace(data: CreateOrganizationRequest): Promise<WorkspaceCreationResponse>`

Create a new workspace.

**Parameters:**
- `data`: `{ name: string; description: string }`

```typescript
const newWorkspace = await sdk.workspaces.createWorkspace({
  name: 'Data Science Team',
  description: 'Workspace for data science projects'
});
```

#### `getWorkspace(organizationId: string): Promise<OrganizationWithUsers>`

Get workspace details by ID.

```typescript
const workspace = await sdk.workspaces.getWorkspace('workspace-id');
console.log(`Workspace: ${workspace.name}`);
console.log(`Users: ${workspace.users.length}`);
```

#### `deleteWorkspace(organizationId: string): Promise<void>`

Delete a workspace (admin only).

```typescript
await sdk.workspaces.deleteWorkspace('workspace-id');
```

#### `getWorkspaceDashboard(organizationId: string): Promise<OrganizationDashboard>`

Get workspace dashboard data.

**Returns:**
```typescript
{
  totalProjects: number;
  totalDatasources: number;
  totalConversations: number;
  usageChart: Array<{ date: string; value: number }>;
  projectsChart: Array<{ name: string; count: number }>;
}
```

```typescript
const dashboard = await sdk.workspaces.getWorkspaceDashboard('workspace-id');
console.log(`Projects: ${dashboard.totalProjects}`);
console.log(`Datasources: ${dashboard.totalDatasources}`);
```

#### `addUserToWorkspace(workspaceId: string, userEmail: string): Promise<AddUserResponse>`

Add user to workspace (admin only).

```typescript
const result = await sdk.workspaces.addUserToWorkspace(
  'workspace-id',
  'newuser@company.com'
);
console.log(result.message);
```

#### `removeUserFromWorkspace(workspaceId: string, roleId: string): Promise<void>`

Remove user from workspace (admin only).

```typescript
await sdk.workspaces.removeUserFromWorkspace('workspace-id', 'role-id');
```

#### `changeUserRoleInWorkspace(workspaceId: string, userId: string, newRole: 'admin' | 'user'): Promise<{message: string}>`

Change user role in workspace (admin only).

```typescript
await sdk.workspaces.changeUserRoleInWorkspace(
  'workspace-id',
  'user-id',
  'admin'
);
```

#### `isWorkspaceAdmin(workspaceId: string): Promise<{isAdmin: boolean}>`

Check if current user is admin of workspace.

```typescript
const { isAdmin } = await sdk.workspaces.isWorkspaceAdmin('workspace-id');
console.log('Is admin:', isAdmin);
```

#### `regenerateWorkspaceApiKey(workspaceId: string): Promise<{apiKey: string}>`

Regenerate workspace API key (admin only).

```typescript
const { apiKey } = await sdk.workspaces.regenerateWorkspaceApiKey('workspace-id');
console.log('New API key:', apiKey.substring(0, 10) + '...');
```

#### `getPendingWorkspaceInvitations(workspaceId: string): Promise<any[]>`

Get pending workspace invitations.

```typescript
const invitations = await sdk.workspaces.getPendingWorkspaceInvitations('workspace-id');
```

#### `revokeWorkspaceInvitation(invitationId: string): Promise<void>`

Revoke workspace invitation (admin only).

```typescript
await sdk.workspaces.revokeWorkspaceInvitation('invitation-id');
```

#### `topUpCredits(workspaceId: string, amount: number, currency?: string): Promise<{paymentUrl: string}>`

Top up workspace credits.

```typescript
const { paymentUrl } = await sdk.workspaces.topUpCredits('workspace-id', 100, 'USD');
window.open(paymentUrl, '_blank');
```

#### `topUpTokens(workspaceId: string, tokenAmount: number): Promise<{paymentUrl: string}>`

Top up workspace tokens.

```typescript
const { paymentUrl } = await sdk.workspaces.topUpTokens('workspace-id', 1000);
```

#### `getBillingHistory(workspaceId: string): Promise<BillingHistory[]>`

Get billing history for workspace.

```typescript
const history = await sdk.workspaces.getBillingHistory('workspace-id');
history.forEach(item => {
  console.log(`${item.amount} ${item.currency} - ${item.description}`);
});
```

---

### Topics (topics/projects)

Manage topics (projects), users, and actions. Both `topics` and `projects` modules provide identical functionality.

#### `listTopics(workspaceId: string): Promise<Project[]>`

List all topics for a workspace.

```typescript
const topics = await sdk.topics.listTopics('workspace-id');
// or
const topics = await sdk.projects.listTopics('workspace-id');

topics.forEach(topic => {
  console.log(`${topic.name}: ${topic.description}`);
});
```

#### `createTopic(data: CreateProjectRequest): Promise<Project>`

Create a new topic.

**Parameters:**
- `data`: `{ name: string; description: string; organizationId: string }`

```typescript
const newTopic = await sdk.topics.createTopic({
  name: 'Customer Analytics',
  description: 'Analyze customer behavior data',
  organizationId: 'workspace-id'
});
```

#### `getTopic(topicId: string): Promise<Project>`

Get topic details by ID.

```typescript
const topic = await sdk.topics.getTopic('topic-id');
console.log(`Topic: ${topic.name}`);
console.log(`Created: ${topic.createdAt}`);
```

#### `updateTopic(topicId: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project>`

Update topic details.

```typescript
const updatedTopic = await sdk.topics.updateTopic('topic-id', {
  name: 'Updated Topic Name',
  description: 'New description'
});
```

#### `deleteTopic(topicId: string): Promise<void>`

Delete a topic.

```typescript
await sdk.topics.deleteTopic('topic-id');
```

#### `chatInTopic(topicId: string, message: string, context?: Record<string, any>): Promise<ChatResponse>`

Send a chat message in topic context.

**Returns:**
```typescript
{
  conversationId: string;
  messageId: string;
  response: string;
}
```

```typescript
const chatResponse = await sdk.topics.chatInTopic(
  'topic-id',
  'Analyze the sales data for Q4',
  { context: 'sales_analysis' }
);
console.log('AI Response:', chatResponse.response);
```

#### `listTopicUsers(topicId: string): Promise<ProjectUser[]>`

List users in a topic.

```typescript
const users = await sdk.topics.listTopicUsers('topic-id');
users.forEach(user => {
  console.log(`${user.user.firstName} ${user.user.lastName} (${user.role})`);
});
```

#### `addUserToTopic(topicId: string, userEmail: string, role?: 'admin' | 'member'): Promise<AddUserToTopicResponse>`

Add user to topic.

```typescript
const result = await sdk.topics.addUserToTopic(
  'topic-id',
  'analyst@company.com',
  'member'
);
console.log(result.message);
```

#### `removeUserFromTopic(topicId: string, userId: string): Promise<void>`

Remove user from topic.

```typescript
await sdk.topics.removeUserFromTopic('topic-id', 'user-id');
```

#### `listTopicActions(topicId: string): Promise<ProjectAction[]>`

List topic actions.

```typescript
const actions = await sdk.topics.listTopicActions('topic-id');
actions.forEach(action => {
  console.log(`${action.name}: ${action.actionType}`);
});
```

#### `addTopicAction(topicId: string, action: ProjectActionRequest): Promise<ProjectAction>`

Add a new topic action.

**Parameters:**
- `action`: 
  ```typescript
  {
    name: string;
    description: string;
    actionType: string;
    parameters: Record<string, any>;
  }
  ```

```typescript
const action = await sdk.topics.addTopicAction('topic-id', {
  name: 'Data Validation',
  description: 'Validate data quality',
  actionType: 'validation',
  parameters: {
    threshold: 0.95,
    fields: ['email', 'phone']
  }
});
```

#### `deleteTopicAction(actionId: string): Promise<void>`

Delete a topic action.

```typescript
await sdk.topics.deleteTopicAction('action-id');
```

#### `getTopicStats(topicId: string): Promise<TopicStats>`

Get topic statistics.

**Returns:**
```typescript
{
  totalUsers: number;
  totalActions: number;
  totalTamedData: number;
  lastActivity: string;
}
```

```typescript
const stats = await sdk.topics.getTopicStats('topic-id');
console.log(`Users: ${stats.totalUsers}, Actions: ${stats.totalActions}`);
```

#### `hasTopicAdminAccess(topicId: string): Promise<boolean>`

Check if current user has admin access to topic.

```typescript
const hasAccess = await sdk.topics.hasTopicAdminAccess('topic-id');
console.log('Has admin access:', hasAccess);
```

---

### Datasources (datasources)

Manage data sources and connections.

#### `listForWorkspace(workspaceId: string): Promise<Datasource[]>`

List all datasources for a workspace.

```typescript
const datasources = await sdk.datasources.listForWorkspace('workspace-id');
datasources.forEach(ds => {
  console.log(`${ds.name} (${ds.datasourceType}): ${ds.status}`);
});
```

#### `getDatasource(datasourceId: string): Promise<Datasource>`

Get datasource details by ID.

```typescript
const datasource = await sdk.datasources.getDatasource('datasource-id');
console.log(`Datasource: ${datasource.name}`);
console.log(`Status: ${datasource.status}`);
```

#### `create(data: CreateDatasourceRequest): Promise<Datasource>`

Create a new datasource.

**Parameters:**
- `data`: 
  ```typescript
  {
    name: string;
    description: string;
    organizationId: string;
    datasourceType: DatasourceType; // 'SQL' | 'CSV' | 'JSON' | 'API' | 'STREAM' | 'GIT'
    configuration: Record<string, any>;
  }
  ```

```typescript
// SQL datasource
const sqlDatasource = await sdk.datasources.create({
  name: 'Customer Database',
  description: 'Main customer data',
  organizationId: 'workspace-id',
  datasourceType: 'SQL',
  configuration: {
    host: 'db.company.com',
    port: 5432,
    database: 'customers',
    username: 'readonly',
    password: 'secret',
    ssl: true
  }
});

// Stream datasource
const streamDatasource = await sdk.datasources.create({
  name: 'IoT Sensor Data',
  description: 'Real-time sensor data stream',
  organizationId: 'workspace-id',
  datasourceType: 'STREAM',
  configuration: {
    streamConfig: {
      format: 'json',
      encoding: 'utf8',
      batchSize: 100,
      flushInterval: 5000
    }
  }
});
```

#### `update(datasourceId: string, updates: {name?: string; description?: string}): Promise<Datasource>`

Update datasource details.

```typescript
const updated = await sdk.datasources.update('datasource-id', {
  name: 'Updated Datasource Name',
  description: 'New description'
});
```

#### `deleteDatasource(datasourceId: string): Promise<void>`

Delete a datasource (soft delete).

```typescript
await sdk.datasources.deleteDatasource('datasource-id');
```

#### `getByTopic(topicId: string): Promise<Datasource[]>`

Get datasources for a specific topic.

```typescript
const datasources = await sdk.datasources.getByTopic('topic-id');
```

#### `getHistory(datasourceId: string): Promise<DatasourceHistory[]>`

Get datasource processing history.

```typescript
const history = await sdk.datasources.getHistory('datasource-id');
history.forEach(entry => {
  console.log(`${entry.timestamp}: ${entry.status} - ${entry.message}`);
});
```

#### `rebuild(datasourceId: string): Promise<{message: string; status: DatasourceStatus}>`

Rebuild/reprocess a datasource.

```typescript
const result = await sdk.datasources.rebuild('datasource-id');
console.log(`Rebuild initiated: ${result.message}`);
```

#### `stop(datasourceId: string): Promise<{message: string; status: DatasourceStatus}>`

Stop datasource processing.

```typescript
const result = await sdk.datasources.stop('datasource-id');
console.log(`Processing stopped: ${result.message}`);
```

#### `stream(datasourceId: string, data: StreamDataRequest): Promise<{message: string}>`

Stream data from a STREAM type datasource.

**Parameters:**
- `data`: 
  ```typescript
  {
    content: any;
    metadata?: Record<string, any>;
    timestamp?: string;
  }
  ```

```typescript
const result = await sdk.datasources.stream('stream-datasource-id', {
  content: {
    temperature: 25.5,
    humidity: 60,
    location: 'Office-A'
  },
  metadata: {
    sensor_id: 'temp-001',
    building: 'HQ'
  },
  timestamp: new Date().toISOString()
});
```

#### `testSqlConnection(connectionConfig): Promise<SqlConnectionTestResult>`

Test SQL connection for SQL datasources.

**Parameters:**
- `connectionConfig`: 
  ```typescript
  {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
  }
  ```

```typescript
const testResult = await sdk.datasources.testSqlConnection({
  host: 'db.company.com',
  port: 5432,
  database: 'testdb',
  username: 'testuser',
  password: 'testpass'
});

if (testResult.success) {
  console.log('Connection successful!');
} else {
  console.error('Connection failed:', testResult.error);
}
```

#### `testGitConnection(gitConfig): Promise<GitConnectionTestResult>`

Test Git connection for GIT datasources.

**Parameters:**
- `gitConfig`: 
  ```typescript
  {
    repositoryUrl: string;
    branch?: string;
    username?: string;
    accessToken?: string;
    provider?: 'github' | 'gitlab' | 'bitbucket';
  }
  ```

```typescript
const testResult = await sdk.datasources.testGitConnection({
  repositoryUrl: 'https://github.com/company/data-repo',
  branch: 'main',
  accessToken: 'github-token'
});

if (testResult.success) {
  console.log('Available branches:', testResult.branches);
}
```

#### `getWildData(): Promise<any[]>`

Get wildcard/demo data (for testing).

```typescript
const demoData = await sdk.datasources.getWildData();
console.log('Demo data records:', demoData.length);
```

#### `downloadFile(datasourceId: string): Promise<{downloadUrl: string; expiresAt: string}>`

Download datasource file.

```typescript
const { downloadUrl, expiresAt } = await sdk.datasources.downloadFile('datasource-id');
console.log(`Download URL expires at: ${expiresAt}`);
window.open(downloadUrl, '_blank');
```

#### `getByType(workspaceId: string, type: DatasourceType): Promise<Datasource[]>`

Get datasources by type.

```typescript
const sqlDatasources = await sdk.datasources.getByType('workspace-id', 'SQL');
const streamDatasources = await sdk.datasources.getByType('workspace-id', 'STREAM');
```

#### `getByStatus(workspaceId: string, status: DatasourceStatus): Promise<Datasource[]>`

Get datasources by status.

```typescript
const activeDatasources = await sdk.datasources.getByStatus('workspace-id', 'ACTIVE');
const errorDatasources = await sdk.datasources.getByStatus('workspace-id', 'ERROR');
```

#### `getActive(workspaceId: string): Promise<Datasource[]>`

Get active datasources.

```typescript
const active = await sdk.datasources.getActive('workspace-id');
```

#### `waitForStatus(datasourceId: string, targetStatus: DatasourceStatus, timeoutMs?: number, pollIntervalMs?: number): Promise<Datasource>`

Wait for datasource to reach a specific status.

```typescript
// Wait for datasource to become active (60 second timeout)
const activeDatasource = await sdk.datasources.waitForStatus(
  'datasource-id', 
  'ACTIVE',
  60000  // timeout: 60 seconds
);
console.log('Datasource is now active!');
```

#### `validateConfiguration(type: DatasourceType, config: Record<string, any>): {isValid: boolean; errors: string[]}`

Validate datasource configuration based on type.

```typescript
const validation = sdk.datasources.validateConfiguration('SQL', {
  host: 'db.company.com',
  port: 5432,
  database: 'customers'
  // missing username and password
});

if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

---

### Tamed Data (tamedData)

Manage processed data and API keys for streaming.

#### `create(data: CreateTamedDataRequest): Promise<TamedData>`

Create new tamed data.

**Parameters:**
- `data`: 
  ```typescript
  {
    name: string;
    description: string;
    projectId: string;
    datasourceId: string;
    dataType: string;
    configuration?: Record<string, any>;
  }
  ```

```typescript
const tamedData = await sdk.tamedData.create({
  name: 'Processed Customer Data',
  description: 'Cleaned and validated customer data',
  projectId: 'topic-id',
  datasourceId: 'datasource-id',
  dataType: 'tabular',
  configuration: {
    format: 'parquet',
    compression: 'snappy'
  }
});
```

#### `createWithWires(data: CreateTamedDataRequest, wires: WireDefinition[]): Promise<{tamedData: TamedData; wires: Wire[]}>`

Create tamed data with wire connections.

**Parameters:**
- `wires`: Array of wire definitions:
  ```typescript
  {
    originTable: string;
    originField: string;
    destinationTable: string;
    destinationField: string;
    transformationType?: string;
    transformationConfig?: Record<string, any>;
  }[]
  ```

```typescript
const result = await sdk.tamedData.createWithWires({
  name: 'Connected Customer Data',
  description: 'Customer data with order relationships',
  projectId: 'topic-id',
  datasourceId: 'datasource-id',
  dataType: 'relational'
}, [
  {
    originTable: 'customers',
    originField: 'id',
    destinationTable: 'orders',
    destinationField: 'customer_id'
  },
  {
    originTable: 'orders',
    originField: 'product_id',
    destinationTable: 'products',
    destinationField: 'id'
  }
]);
```

#### `getTamedData(tamedDataId: string): Promise<TamedData>`

Get tamed data by ID.

```typescript
const tamedData = await sdk.tamedData.getTamedData('tamed-data-id');
console.log(`Tamed Data: ${tamedData.name} (${tamedData.status})`);
```

#### `update(tamedDataId: string, updates: {name?: string; description?: string}): Promise<TamedData>`

Update tamed data.

```typescript
const updated = await sdk.tamedData.update('tamed-data-id', {
  name: 'Updated Tamed Data Name'
});
```

#### `deleteTamedData(tamedDataId: string): Promise<void>`

Delete tamed data.

```typescript
await sdk.tamedData.deleteTamedData('tamed-data-id');
```

#### `getByTopic(topicId: string): Promise<TamedData[]>`

Get tamed data for a topic.

```typescript
const tamedDataList = await sdk.tamedData.getByTopic('topic-id');
tamedDataList.forEach(td => {
  console.log(`${td.name}: ${td.dataType} (${td.status})`);
});
```

## API Key Management

#### `getApiKey(tamedDataId: string): Promise<{apiKey: string}>`

Get API key for tamed data.

```typescript
const { apiKey } = await sdk.tamedData.getApiKey('tamed-data-id');
console.log('API Key:', apiKey.substring(0, 10) + '...');
```

#### `generateApiKey(tamedDataId: string): Promise<{apiKey: string}>`

Generate new API key for tamed data.

```typescript
const { apiKey } = await sdk.tamedData.generateApiKey('tamed-data-id');
console.log('New API Key generated');
```

#### `regenerateApiKey(tamedDataId: string): Promise<{apiKey: string}>`

Regenerate existing API key for tamed data.

```typescript
const { apiKey } = await sdk.tamedData.regenerateApiKey('tamed-data-id');
console.log('API Key regenerated');
```

## Stream API Integration

#### `getStreamData(tamedDataId: string, apiKey: string): Promise<{tamedData: TamedData; streamData: StreamData[]}>`

Get stream data from tamed data (requires API key).

```typescript
const streamData = await sdk.tamedData.getStreamData('tamed-data-id', 'stream-api-key');
console.log(`Retrieved ${streamData.streamData.length} stream records`);
```

#### `sendToStream(tamedDataId: string, apiKey: string, data: StreamDataRequest): Promise<{success: boolean; messageId?: string}>`

Send data to stream (requires API key).

**Parameters:**
- `data`: 
  ```typescript
  {
    content: any;
    metadata?: Record<string, any>;
    timestamp?: string;
  }
  ```

```typescript
const result = await sdk.tamedData.sendToStream(
  'tamed-data-id',
  'stream-api-key',
  {
    content: {
      user_id: 12345,
      action: 'purchase',
      item: 'widget-pro',
      amount: 29.99
    },
    metadata: {
      source: 'web-app',
      session_id: 'sess-abc123'
    }
  }
);

if (result.success) {
  console.log('Data sent successfully, Message ID:', result.messageId);
}
```

#### `searchRag(tamedDataId: string, apiKey: string, searchParams: RagSearchRequest): Promise<RagSearchResponse>` 🆕

**BREAKING CHANGE in v2.0.0**: Renamed from `searchStream()` to `searchRag()`.

Search stream data using RAG (Retrieval-Augmented Generation).

**Parameters:**
- `searchParams`: 
  ```typescript
  {
    question: string;        // Required - natural language query
    limit?: number;          // Optional - max results (default: 10)
    offset?: number;         // Optional - pagination offset
    user_id?: string;        // Optional - user tracking
  }
  ```

**Returns:**
```typescript
{
  message_id: string;        // For tracking async searches
  success: boolean;          // Operation success status
  results?: any[];           // Search results (when available)
  error?: string;            // Error message (if failed)
}
```

```typescript
// Natural language search queries
const searchResults = await sdk.tamedData.searchRag(
  'tamed-data-id',
  'stream-api-key',
  {
    question: 'Find all purchase transactions above $100 from the last 24 hours',
    limit: 20,
    user_id: 'analyst-123'
  }
);

console.log(`Search ID: ${searchResults.message_id}`);
if (searchResults.success && searchResults.results) {
  console.log(`Found ${searchResults.results.length} results`);
  searchResults.results.forEach((result, index) => {
    console.log(`${index + 1}. ${JSON.stringify(result.content)}`);
  });
}
```

## Utility Methods

#### `getByStatus(topicId: string, status: 'ACTIVE' | 'INACTIVE' | 'PROCESSING'): Promise<TamedData[]>`

Get tamed data by status.

```typescript
const active = await sdk.tamedData.getByStatus('topic-id', 'ACTIVE');
const processing = await sdk.tamedData.getByStatus('topic-id', 'PROCESSING');
```

#### `getActive(topicId: string): Promise<TamedData[]>`

Get active tamed data for a topic.

```typescript
const activeTamedData = await sdk.tamedData.getActive('topic-id');
```

#### `getByDataType(topicId: string, dataType: string): Promise<TamedData[]>`

Get tamed data by data type.

```typescript
const tabularData = await sdk.tamedData.getByDataType('topic-id', 'tabular');
const streamData = await sdk.tamedData.getByDataType('topic-id', 'stream');
```

#### `exists(tamedDataId: string): Promise<boolean>`

Check if tamed data exists.

```typescript
const exists = await sdk.tamedData.exists('tamed-data-id');
console.log('Tamed data exists:', exists);
```

#### `clone(tamedDataId: string, newName: string, newDescription?: string): Promise<TamedData>`

Clone tamed data (creates a copy with new name).

```typescript
const cloned = await sdk.tamedData.clone(
  'original-tamed-data-id',
  'Cloned Customer Data',
  'Copy of the original customer data for testing'
);
```

#### `batchCreate(requests: CreateTamedDataRequest[]): Promise<TamedData[]>`

Batch create multiple tamed data entries.

```typescript
const requests = [
  {
    name: 'Sales Data Q1',
    description: 'Q1 sales analysis',
    projectId: 'topic-id',
    datasourceId: 'datasource-1',
    dataType: 'tabular'
  },
  {
    name: 'Sales Data Q2',
    description: 'Q2 sales analysis',
    projectId: 'topic-id',
    datasourceId: 'datasource-2',
    dataType: 'tabular'
  }
];

const results = await sdk.tamedData.batchCreate(requests);
console.log(`Created ${results.length} tamed data entries`);
```

#### `sendToStreamWithRetry(tamedDataId: string, apiKey: string, data: StreamDataRequest, maxRetries?: number, retryDelayMs?: number): Promise<{success: boolean; messageId?: string}>`

Stream data with automatic retries.

```typescript
const result = await sdk.tamedData.sendToStreamWithRetry(
  'tamed-data-id',
  'stream-api-key',
  { content: { important: 'data' } },
  3,    // max retries
  1000  // retry delay (ms)
);
```

---

### Conversations (conversations)

Manage AI conversations and prompts.

#### `getHistory(workspaceId: string, topicId: string): Promise<Conversation[]>`

Get conversation history for workspace and topic.

```typescript
const conversations = await sdk.conversations.getHistory('workspace-id', 'topic-id');
conversations.forEach(conv => {
  console.log(`${conv.title} (${conv.createdAt})`);
});
```

#### `getMessages(conversationId: string, offset?: number, limit?: number): Promise<ConversationMessagesResponse>`

Get messages for a conversation with pagination.

**Returns:**
```typescript
{
  messages: ConversationMessage[];
  hasMore: boolean;
  total: number;
}
```

```typescript
const { messages, hasMore, total } = await sdk.conversations.getMessages(
  'conversation-id',
  0,  // offset
  20  // limit
);

console.log(`Showing ${messages.length} of ${total} messages`);
messages.forEach(msg => {
  console.log(`${msg.role}: ${msg.content.substring(0, 100)}...`);
});
```

#### `editTitle(conversationId: string, newTitle: string): Promise<Conversation>`

Edit conversation title.

```typescript
const updated = await sdk.conversations.editTitle(
  'conversation-id',
  'Updated Analysis Discussion'
);
```

#### `deleteConversation(conversationId: string): Promise<void>`

Delete a conversation and all its messages.

```typescript
await sdk.conversations.deleteConversation('conversation-id');
```

## AI/Prompts Integration

#### `createConversation(data: CreateConversationRequest): Promise<{conversationId: string; conversation: Conversation}>`

Create a new AI conversation.

**Parameters:**
- `data`: 
  ```typescript
  {
    title?: string;
    organizationId: string;
    projectId: string;
  }
  ```

```typescript
const { conversationId, conversation } = await sdk.conversations.createConversation({
  title: 'Sales Data Analysis',
  organizationId: 'workspace-id',
  projectId: 'topic-id'
});
```

#### `submitPrompt(data: SendPromptRequest): Promise<AIResponse>`

Submit a prompt to AI and get response.

**Parameters:**
- `data`: 
  ```typescript
  {
    conversationId: string;
    message: string;
    context?: Record<string, any>;
  }
  ```

```typescript
const aiResponse = await sdk.conversations.submitPrompt({
  conversationId: 'conversation-id',
  message: 'What are the top 3 sales trends from the last quarter?',
  context: {
    data_source: 'sales_db',
    time_period: 'Q4_2023'
  }
});

console.log('AI Response:', aiResponse.content);
```

#### `getResponse(conversationId: string): Promise<AIResponse>`

Get AI response (for polling-based implementations).

```typescript
const response = await sdk.conversations.getResponse('conversation-id');
if (response.isComplete) {
  console.log('Final response:', response.content);
}
```

#### `stopProcessing(conversationId: string): Promise<{success: boolean; message: string}>`

Stop AI processing.

```typescript
const result = await sdk.conversations.stopProcessing('conversation-id');
console.log(result.message);
```

## High-level Convenience Methods

#### `startConversation(workspaceId: string, topicId: string, initialMessage: string, title?: string): Promise<{conversation: Conversation; response: AIResponse}>`

Start a new conversation with an initial message.

```typescript
const { conversation, response } = await sdk.conversations.startConversation(
  'workspace-id',
  'topic-id',
  'Analyze the customer churn data and provide insights',
  'Customer Churn Analysis'
);

console.log('Conversation started:', conversation.title);
console.log('Initial AI response:', response.content);
```

#### `continueConversation(conversationId: string, message: string, context?: Record<string, any>): Promise<AIResponse>`

Continue an existing conversation.

```typescript
const response = await sdk.conversations.continueConversation(
  'conversation-id',
  'What are the main factors contributing to churn?'
);
```

#### `getFullConversation(conversationId: string): Promise<{conversation: Conversation; messages: ConversationMessage[]}>`

Get full conversation thread (all messages).

```typescript
const { conversation, messages } = await sdk.conversations.getFullConversation('conversation-id');

console.log(`Conversation: ${conversation.title}`);
console.log(`Total messages: ${messages.length}`);

// Display conversation history
messages.forEach((msg, index) => {
  console.log(`${index + 1}. ${msg.role}: ${msg.content}`);
});
```

#### `search(workspaceId: string, topicId: string, query: string): Promise<Conversation[]>`

Search conversations by title or content.

```typescript
const results = await sdk.conversations.search(
  'workspace-id',
  'topic-id',
  'customer analysis'
);

results.forEach(conv => {
  console.log(`Found: ${conv.title}`);
});
```

#### `archiveOldConversations(workspaceId: string, topicId: string, daysOld?: number): Promise<{archived: number; conversations: Conversation[]}>`

Archive old conversations (mark as archived).

```typescript
const { archived, conversations } = await sdk.conversations.archiveOldConversations(
  'workspace-id',
  'topic-id',
  30  // archive conversations older than 30 days
);

console.log(`Archived ${archived} conversations`);
```

#### `getStats(workspaceId: string, topicId: string): Promise<ConversationStats>`

Get conversation statistics.

**Returns:**
```typescript
{
  totalConversations: number;
  activeConversations: number;
  archivedConversations: number;
  totalMessages: number;
  averageMessagesPerConversation: number;
}
```

```typescript
const stats = await sdk.conversations.getStats('workspace-id', 'topic-id');
console.log(`Total: ${stats.totalConversations}, Active: ${stats.activeConversations}`);
console.log(`Avg messages per conversation: ${stats.averageMessagesPerConversation}`);
```

---

### Billing (billing)

Manage subscriptions and billing.

#### `getHistoryForWorkspace(workspaceId: string): Promise<BillingHistory[]>`

Get billing history for workspace.

```typescript
const history = await sdk.billing.getHistoryForWorkspace('workspace-id');
history.forEach(item => {
  console.log(`${item.createdAt}: ${item.amount} ${item.currency} - ${item.description}`);
});
```

## Stripe Subscriptions

#### `getSubscription(): Promise<Subscription>`

Get current subscription details.

```typescript
const subscription = await sdk.billing.getSubscription();
console.log(`Status: ${subscription.status}`);
console.log(`Current period ends: ${subscription.currentPeriodEnd}`);
```

#### `createSubscription(planId: string, workspaceId: string): Promise<SubscriptionCreationResponse>`

Create a new subscription.

```typescript
const result = await sdk.billing.createSubscription('pro-plan', 'workspace-id');
if (result.checkoutUrl) {
  window.open(result.checkoutUrl, '_blank');
}
```

#### `cancelSubscriptionAtPeriodEnd(subscriptionId: string): Promise<{subscription: Subscription; message: string}>`

Cancel subscription at the end of current period.

```typescript
const result = await sdk.billing.cancelSubscriptionAtPeriodEnd('subscription-id');
console.log(result.message);
```

#### `resumeSubscription(subscriptionId: string): Promise<{subscription: Subscription; message: string}>`

Resume a cancelled subscription.

```typescript
const result = await sdk.billing.resumeSubscription('subscription-id');
console.log(result.message);
```

#### `createTokenCheckout(workspaceId: string, tokenPackageId: string, quantity?: number): Promise<{checkoutUrl: string; sessionId: string}>`

Create checkout session for token purchase.

```typescript
const { checkoutUrl, sessionId } = await sdk.billing.createTokenCheckout(
  'workspace-id',
  'token-pack-1000',
  2  // quantity
);

window.open(checkoutUrl, '_blank');
```

#### `createAlternativeSubscription(workspaceId: string, planId: string): Promise<AlternativeSubscriptionResponse>`

Create alternative subscription (different endpoint).

```typescript
const subscription = await sdk.billing.createAlternativeSubscription(
  'workspace-id',
  'enterprise-plan'
);
```

## Utility Methods

#### `getSubscriptionStatus(): Promise<SubscriptionStatus>`

Get subscription status.

**Returns:**
```typescript
{
  hasActiveSubscription: boolean;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}
```

```typescript
const status = await sdk.billing.getSubscriptionStatus();
console.log(`Has active subscription: ${status.hasActiveSubscription}`);
if (status.cancelAtPeriodEnd) {
  console.log(`Will cancel on: ${status.currentPeriodEnd}`);
}
```

#### `getRecentActivity(workspaceId: string, days?: number): Promise<BillingHistory[]>`

Get recent billing activity.

```typescript
const recentActivity = await sdk.billing.getRecentActivity('workspace-id', 7); // last 7 days
recentActivity.forEach(item => {
  console.log(`${item.createdAt}: ${item.description} - ${item.status}`);
});
```

#### `getTotalSpending(workspaceId: string, startDate?: string, endDate?: string): Promise<SpendingSummary>`

Calculate total spending.

**Returns:**
```typescript
{
  totalAmount: number;
  currency: string;
  transactionCount: number;
  byStatus: Record<string, { amount: number; count: number }>;
}
```

```typescript
const spending = await sdk.billing.getTotalSpending(
  'workspace-id',
  '2024-01-01',  // start date
  '2024-12-31'   // end date
);

console.log(`Total spent: ${spending.totalAmount} ${spending.currency}`);
console.log(`Transactions: ${spending.transactionCount}`);
console.log('By status:', spending.byStatus);
```

#### `getMonthlySpending(workspaceId: string, year?: number, month?: number): Promise<MonthlySpendingSummary>`

Get monthly spending summary.

**Returns:**
```typescript
{
  totalAmount: number;
  currency: string;
  transactionCount: number;
  dailyBreakdown: Array<{
    date: string;
    amount: number;
    transactionCount: number;
  }>;
}
```

```typescript
const monthlySpending = await sdk.billing.getMonthlySpending(
  'workspace-id',
  2024,  // year
  3      // March
);

console.log(`March 2024: ${monthlySpending.totalAmount} ${monthlySpending.currency}`);
monthlySpending.dailyBreakdown.forEach(day => {
  console.log(`${day.date}: ${day.amount} (${day.transactionCount} transactions)`);
});
```

#### `needsAttention(): Promise<{needsAttention: boolean; issues: string[]; subscription?: Subscription}>`

Check if subscription needs attention (expired, past due, etc.).

```typescript
const attention = await sdk.billing.needsAttention();
if (attention.needsAttention) {
  console.log('Billing issues:');
  attention.issues.forEach(issue => {
    console.log(`- ${issue}`);
  });
}
```

---

### Users (users)

Manage user accounts and API tokens.

#### `getCurrentUser(): Promise<User>`

Get current user information.

```typescript
const user = await sdk.users.getCurrentUser();
console.log(`${user.firstName} ${user.lastName} (${user.email})`);
console.log(`Active: ${user.isActive}`);
```

#### `updateProfile(data: {firstName: string; lastName: string}): Promise<User>`

Update user profile information.

```typescript
const updated = await sdk.users.updateProfile({
  firstName: 'John',
  lastName: 'Smith'
});
```

#### `changePassword(password: string): Promise<{user: User}>`

Change user password.

```typescript
const result = await sdk.users.changePassword('new-secure-password');
console.log('Password changed for:', result.user.email);
```

#### `removeFirstLoginFlag(userId: string): Promise<{message: string}>`

Remove first login flag.

```typescript
const result = await sdk.users.removeFirstLoginFlag('user-id');
console.log(result.message);
```

## API Token Management

#### `listApiTokens(): Promise<ApiToken[]>`

List all API tokens for the current user.

```typescript
const tokens = await sdk.users.listApiTokens();
tokens.forEach(token => {
  console.log(`${token.name} (ID: ${token.id})`);
  console.log(`Created: ${token.created_at}`);
  console.log(`Last used: ${token.last_used_at || 'Never'}`);
});
```

#### `createApiToken(request: CreateApiTokenRequest): Promise<CreateApiTokenResponse>`

Create a new API token.

**Parameters:**
- `request`: `{ name: string }`

**Returns:** Token with the actual token string (only returned once).

```typescript
const token = await sdk.users.createApiToken({
  name: 'Data Analysis Token'
});

console.log(`Token created: ${token.name}`);
console.log(`Token: ${token.token}`); // Store this securely!
console.log(`Token ID: ${token.id}`);
```

#### `deleteApiToken(tokenId: string): Promise<{success: boolean}>`

Delete an API token by ID.

```typescript
const result = await sdk.users.deleteApiToken('token-id');
if (result.success) {
  console.log('Token deleted successfully');
}
```

## Admin-only Endpoints

#### `listInactiveUsers(): Promise<User[]>`

List all inactive users (Admin only).

```typescript
const inactiveUsers = await sdk.users.listInactiveUsers();
console.log(`Found ${inactiveUsers.length} inactive users`);
```

#### `activateUser(userId: string): Promise<{message: string}>`

Activate an inactive user (Admin only).

```typescript
const result = await sdk.users.activateUser('user-id');
console.log(result.message);
```

#### `updateUserEmail(userId: string, email: string): Promise<User>`

Update user email (Admin only).

```typescript
const updated = await sdk.users.updateUserEmail('user-id', 'newemail@company.com');
console.log(`Email updated to: ${updated.email}`);
```

---

### Real-time (realtime)

Connect to server-sent events for real-time updates.

#### `connect(options?: RealtimeOptions, handlers?: RealtimeEventHandlers): Promise<void>`

Connect to Server-Sent Events stream.

**Parameters:**
- `options`: 
  ```typescript
  {
    reconnect?: boolean;          // Auto-reconnect on disconnect (default: true)
    reconnectInterval?: number;   // Reconnect interval in ms (default: 3000)
    maxReconnectAttempts?: number; // Max reconnect attempts (default: 5)
  }
  ```
- `handlers`: 
  ```typescript
  {
    onMessage?: (data: any) => void;
    onOpen?: () => void;
    onError?: (error: Event | Error) => void;
    onClose?: () => void;
    onReconnect?: (attempt: number) => void;
    onReconnectFailed?: () => void;
  }
  ```

```typescript
await sdk.realtime.connect({
  reconnect: true,
  maxReconnectAttempts: 10,
  reconnectInterval: 5000
}, {
  onMessage: (data) => {
    console.log('Real-time event:', data);
  },
  onOpen: () => {
    console.log('Connected to real-time stream');
  },
  onError: (error) => {
    console.error('Connection error:', error);
  },
  onReconnect: (attempt) => {
    console.log(`Reconnecting... attempt ${attempt}`);
  }
});
```

#### `subscribe(eventType: string, handler: (data: any) => void): () => void`

Subscribe to specific event types.

**Returns:** Unsubscribe function

```typescript
const unsubscribe = sdk.realtime.subscribe('datasource_update', (update) => {
  console.log('Datasource updated:', update);
});

// Later, unsubscribe
unsubscribe();
```

#### `disconnect(): void`

Disconnect from SSE stream.

```typescript
sdk.realtime.disconnect();
```

#### `getConnectionState(): {connected: boolean; readyState: number | null; reconnectAttempts: number}`

Get connection status.

```typescript
const state = sdk.realtime.getConnectionState();
console.log(`Connected: ${state.connected}`);
console.log(`Ready State: ${state.readyState}`);
console.log(`Reconnect Attempts: ${state.reconnectAttempts}`);
```

#### `isConnectedToStream(): boolean`

Check if currently connected.

```typescript
if (sdk.realtime.isConnectedToStream()) {
  console.log('Real-time connection is active');
}
```

## High-level Convenience Methods

#### `onNotifications(handler: (notification: any) => void): () => void`

Simple notification subscription.

```typescript
const unsubscribe = sdk.realtime.onNotifications((notification) => {
  console.log('New notification:', notification.title);
  console.log('Message:', notification.message);
});
```

#### `onDatasourceUpdates(handler: (update: any) => void): () => void`

Subscribe to datasource updates.

```typescript
const unsubscribe = sdk.realtime.onDatasourceUpdates((update) => {
  console.log(`Datasource ${update.id} status: ${update.status}`);
});
```

#### `onTopicUpdates(handler: (update: any) => void): () => void`

Subscribe to topic updates.

```typescript
const unsubscribe = sdk.realtime.onTopicUpdates((update) => {
  console.log('Topic updated:', update);
});
```

#### `onAIResponses(handler: (response: any) => void): () => void`

Subscribe to AI responses.

```typescript
const unsubscribe = sdk.realtime.onAIResponses((response) => {
  console.log('AI response received:', response.content);
});
```

#### `onAllEvents(filter: (eventType: string, data: any) => boolean, handler: (eventType: string, data: any) => void): () => void`

Subscribe to all events with filtering.

```typescript
const unsubscribe = sdk.realtime.onAllEvents(
  (eventType, data) => eventType.includes('error'), // Filter for error events
  (eventType, data) => {
    console.error(`Error event (${eventType}):`, data);
  }
);
```

#### `enableAutoReconnect(initialInterval?: number, maxInterval?: number, maxAttempts?: number): void`

Auto-reconnect with exponential backoff.

```typescript
sdk.realtime.enableAutoReconnect(
  1000,   // initial interval: 1 second
  30000,  // max interval: 30 seconds
  10      // max attempts: 10
);
```

### Complete Real-time Example

```typescript
// Connect to real-time events
await sdk.realtime.connect({
  reconnect: true,
  maxReconnectAttempts: 5
}, {
  onOpen: () => console.log('🟢 Real-time connected'),
  onError: (error) => console.error('🔴 Real-time error:', error),
  onClose: () => console.log('🔵 Real-time disconnected')
});

// Subscribe to different event types
const unsubscribeNotifications = sdk.realtime.onNotifications((notification) => {
  showToast(notification.title, notification.message);
});

const unsubscribeDatasources = sdk.realtime.onDatasourceUpdates((update) => {
  updateDatasourceStatus(update.id, update.status);
});

const unsubscribeAI = sdk.realtime.onAIResponses((response) => {
  displayAIResponse(response.conversationId, response.content);
});

// Clean up when component unmounts
window.addEventListener('beforeunload', () => {
  unsubscribeNotifications();
  unsubscribeDatasources();
  unsubscribeAI();
  sdk.realtime.disconnect();
});
```

---

### Notifications (notifications)

Manage user notifications.

#### `list(): Promise<Notification[]>`

List all notifications for the current user.

```typescript
const notifications = await sdk.notifications.list();
notifications.forEach(notification => {
  console.log(`${notification.type}: ${notification.title}`);
  console.log(`Message: ${notification.message}`);
  console.log(`Read: ${notification.isRead}`);
});
```

#### `create(data: CreateNotificationRequest): Promise<any>`

Create a new notification.

**Parameters:**
- `data`: 
  ```typescript
  {
    key: string;
    message: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    userId?: string;
    organization?: string;
    project?: string;
  }
  ```

```typescript
const notification = await sdk.notifications.create({
  key: 'datasource-completed',
  message: 'Your datasource processing has completed successfully',
  severity: 'success',
  organization: 'workspace-id'
});
```

#### `markAsRead(userNotificationId: string): Promise<ReadNotificationResponse>`

Mark notification as read.

```typescript
const result = await sdk.notifications.markAsRead('user-notification-id');
console.log('Notification marked as read:', result.is_read);
```

#### `markAllAsRead(): Promise<void>`

Mark all notifications as read.

```typescript
await sdk.notifications.markAllAsRead();
console.log('All notifications marked as read');
```

---

### Integrations (integrations)

Email and third-party integrations.

#### `sendEmail(request: SendEmailRequest): Promise<SendEmailResponse>`

Send an email.

**Parameters:**
- `request`: 
  ```typescript
  {
    to: string;
    subject: string;
    html: string;
  }
  ```

```typescript
const result = await sdk.integrations.sendEmail({
  to: 'user@company.com',
  subject: 'Your Data Processing is Complete',
  html: `
    <h2>Processing Complete</h2>
    <p>Your data has been successfully processed and is ready for analysis.</p>
    <p><a href="https://app.datatamer.ai/workspace/${workspaceId}">View Results</a></p>
  `
});

console.log('Email sent:', result.messageId);
```

#### `downloadFromGoogleDrive(request: GoogleDriveDownloadRequest): Promise<Blob>`

Download file from Google Drive.

**Parameters:**
- `request`: 
  ```typescript
  {
    fileId: string;
    mimeType: string;
  }
  ```

```typescript
const fileBlob = await sdk.integrations.downloadFromGoogleDrive({
  fileId: 'google-drive-file-id',
  mimeType: 'text/csv'
});

// Create download link
const url = URL.createObjectURL(fileBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'downloaded-file.csv';
link.click();
```

---

### Templates (templates)

Manage AI templates (Admin only).

#### `list(): Promise<Template[]>`

List all templates (Super admin only).

```typescript
const templates = await sdk.templates.list();
templates.forEach(template => {
  console.log(`${template.name} (${template.templateType})`);
  console.log(`Active: ${template.isActive}`);
});
```

#### `create(data: CreateTemplateRequest): Promise<Template[]>`

Create a new template (Super admin only).

**Parameters:**
- `data`: 
  ```typescript
  {
    type: string;
    template_name: string;
    template: string;
  }
  ```

```typescript
const templates = await sdk.templates.create({
  type: 'analysis',
  template_name: 'Sales Analysis Template',
  template: 'Analyze the following sales data and provide insights: {{data}}'
});
```

#### `update(templateId: string, template: string): Promise<Template[]>`

Update an existing template (Super admin only).

```typescript
const updated = await sdk.templates.update(
  'template-id',
  'Updated template content with new instructions: {{data}}'
);
```

#### `deleteTemplate(templateId: string): Promise<Template[]>`

Delete a template (Super admin only).

```typescript
const remaining = await sdk.templates.deleteTemplate('template-id');
console.log(`${remaining.length} templates remaining`);
```

#### `setActive(templateId: string): Promise<Template[]>`

Set a template as active (Super admin only).

```typescript
const templates = await sdk.templates.setActive('template-id');
const activeTemplate = templates.find(t => t.isActive);
console.log('Active template:', activeTemplate?.name);
```

---

## Types & Interfaces

### Core Types

```typescript
// Authentication
interface AuthConfig {
  baseUrl: string;
  sessionToken?: string;
  apiKey?: string;
  timeout?: number;
}

// User
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isFirstLogin?: boolean;
}

// Organization/Workspace
interface Organization {
  id: string;
  name: string;
  description: string;
  owner: string;
  apiKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Project/Topic
interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  owner: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  tamedDataCount?: number;
}

// Datasource
interface Datasource {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  owner: string;
  datasourceType: DatasourceType;
  status: DatasourceStatus;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

type DatasourceType = 'SQL' | 'CSV' | 'JSON' | 'API' | 'STREAM' | 'GIT';
type DatasourceStatus = 'ACTIVE' | 'INACTIVE' | 'PROCESSING' | 'ERROR' | 'DELETED';

// Tamed Data
interface TamedData {
  id: string;
  name: string;
  description: string;
  projectId: string;
  datasourceId: string;
  dataType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROCESSING';
  configuration: Record<string, any>;
  apiKey?: string;
  createdAt: string;
  updatedAt: string;
  datasource?: Datasource;
}

// Conversation
interface Conversation {
  id: string;
  title: string;
  organizationId: string;
  projectId: string;
  userId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Billing
interface BillingHistory {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  organizationId?: string;
  stripeSubscriptionId?: string;
  planId?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'PAST_DUE' | 'TRIALING' | 'UNPAID';
  cancelAtPeriodEnd: boolean;
  cancelAt?: string;
  currentPeriodEnd: string;
  currentPeriodStart: string;
  product?: {
    id: string;
    name: string;
    description: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Notification
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  userId?: string;
  organizationId?: string;
  projectId?: string;
  isRead: boolean;
  createdAt: string;
}

// API Token
interface ApiToken {
  id: string;
  name: string;
  last_used_at?: string;
  created_at: string;
}

interface CreateApiTokenResponse extends ApiToken {
  token: string; // Only returned once during creation
}
```

### Request Types

```typescript
// Create requests
interface CreateOrganizationRequest {
  name: string;
  description: string;
}

interface CreateProjectRequest {
  name: string;
  description: string;
  organizationId: string;
}

interface CreateDatasourceRequest {
  name: string;
  description: string;
  organizationId: string;
  datasourceType: DatasourceType;
  configuration: Record<string, any>;
}

interface CreateTamedDataRequest {
  name: string;
  description: string;
  projectId: string;
  datasourceId: string;
  dataType: string;
  configuration?: Record<string, any>;
}

interface CreateConversationRequest {
  title?: string;
  organizationId: string;
  projectId: string;
}

interface SendPromptRequest {
  conversationId: string;
  message: string;
  context?: Record<string, any>;
}

interface CreateApiTokenRequest {
  name: string;
}

// Email
interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
}

// Stream data
interface StreamData {
  content: any;
  metadata?: Record<string, any>;
  timestamp: string;
}
```

---

## Error Handling

The SDK throws `DataTamerError` instances with detailed information:

```typescript
import { DataTamerError } from '@datatamer/data-tamer-sdk';

try {
  await sdk.workspaces.createWorkspace({ name: '', description: '' });
} catch (error) {
  if (error instanceof DataTamerError) {
    console.error(`API Error (${error.status}): ${error.message}`);
    console.error('Details:', error.details);
    
    // Handle specific error codes
    switch (error.status) {
      case 401:
        console.error('Authentication failed - check your API key');
        break;
      case 403:
        console.error('Access forbidden - insufficient permissions');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 429:
        console.error('Rate limit exceeded - please slow down');
        break;
      case 500:
        console.error('Server error - please try again later');
        break;
      default:
        console.error('Unexpected error occurred');
    }
  } else {
    console.error('Non-API error:', error);
  }
}
```

### Common Error Scenarios

```typescript
// Validation errors
try {
  await sdk.datasources.create({
    name: '',  // Empty name will cause validation error
    description: 'Test',
    organizationId: 'workspace-id',
    datasourceType: 'SQL',
    configuration: {}  // Missing required SQL config
  });
} catch (error) {
  if (error instanceof DataTamerError && error.status === 400) {
    console.error('Validation errors:', error.details);
  }
}

// Not found errors
try {
  await sdk.topics.getTopic('non-existent-id');
} catch (error) {
  if (error instanceof DataTamerError && error.status === 404) {
    console.error('Topic not found');
  }
}

// Permission errors
try {
  await sdk.workspaces.deleteWorkspace('workspace-id');
} catch (error) {
  if (error instanceof DataTamerError && error.status === 403) {
    console.error('Admin permission required');
  }
}
```

---

## Migration Guide (v1.x → v2.0.0)

### Breaking Changes

#### Method Rename: `searchStream()` → `searchRag()` 🆕

The most significant change in v2.0.0 is the renaming of the stream search method to better reflect its RAG capabilities.

**Old (v1.x):**
```typescript
const results = await sdk.tamedData.searchStream(tamedDataId, apiKey, {
  query: 'temperature > 25',
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-02T00:00:00Z',
  limit: 100
});
// results.results, results.total, results.hasMore
```

**New (v2.0.0):**
```typescript
const results = await sdk.tamedData.searchRag(tamedDataId, apiKey, {
  question: 'Find temperature readings above 25 degrees from January 1st to January 2nd',
  limit: 100
});
// results.message_id, results.success, results.results, results.error
```

#### Parameter Changes

| Old Parameter | New Parameter | Notes |
|---------------|---------------|-------|
| `query` | `question` | Now accepts natural language queries |
| `startTime` | *removed* | Use natural language in question |
| `endTime` | *removed* | Use natural language in question |
| `limit` | `limit` | *unchanged* |
| `offset` | `offset` | *unchanged* |
| *n/a* | `user_id` | *new* - optional user tracking |

#### Return Type Changes

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `results` | `results` | *unchanged* |
| `total` | *removed* | Use pagination with limit/offset |
| `hasMore` | *removed* | Use pagination with limit/offset |
| *n/a* | `message_id` | *new* - for tracking async searches |
| *n/a* | `success` | *new* - operation success status |
| *n/a* | `error` | *new* - error message if failed |

### Migration Steps

1. **Update method calls:**
   ```bash
   # Find and replace in your codebase
   searchStream → searchRag
   ```

2. **Update parameter objects:**
   ```typescript
   // Before
   { query: "temperature > 25", startTime: "...", endTime: "..." }
   
   // After  
   { question: "Find temperature readings above 25 degrees from yesterday" }
   ```

3. **Update result handling:**
   ```typescript
   // Before
   if (results.hasMore) {
     // Fetch more with offset
   }
   
   // After
   if (results.success && results.results) {
     // Handle successful results
   }
   ```

4. **Test thoroughly:**
   - Natural language queries may return different results than structured queries
   - Update your tests to use the new method signature
   - Verify pagination logic with new response format

---

## Complete Usage Examples

### Basic Workflow Example

```typescript
import DataTamerSDK from '@datatamer/data-tamer-sdk';

async function basicWorkflow() {
  // 1. Initialize SDK
  const sdk = new DataTamerSDK({
    baseUrl: 'https://app.datatamer.ai/api',
    apiKey: process.env.DATATAMER_API_TOKEN
  });

  // 2. Verify authentication
  const user = await sdk.users.getCurrentUser();
  console.log(`Authenticated as: ${user.email}`);

  // 3. List workspaces
  const workspaces = await sdk.workspaces.listWorkspaces();
  const workspace = workspaces[0];

  // 4. Create a topic
  const topic = await sdk.topics.createTopic({
    name: 'Customer Analysis',
    description: 'Analyzing customer behavior',
    organizationId: workspace.id
  });

  // 5. Add a datasource
  const datasource = await sdk.datasources.create({
    name: 'Customer Database',
    description: 'Main customer database',
    organizationId: workspace.id,
    datasourceType: 'SQL',
    configuration: {
      host: 'db.company.com',
      port: 5432,
      database: 'customers',
      username: 'readonly',
      password: process.env.DB_PASSWORD
    }
  });

  // 6. Create tamed data
  const tamedData = await sdk.tamedData.create({
    name: 'Clean Customer Data',
    description: 'Processed and cleaned customer data',
    projectId: topic.id,
    datasourceId: datasource.id,
    dataType: 'tabular'
  });

  // 7. Start AI conversation
  const { conversation, response } = await sdk.conversations.startConversation(
    workspace.id,
    topic.id,
    'Analyze customer demographics and provide insights',
    'Customer Demographics Analysis'
  );

  console.log('AI Response:', response.content);
}
```

### Real-time Dashboard Example

```typescript
import DataTamerSDK from '@datatamer/data-tamer-sdk';

class RealtimeDashboard {
  private sdk: DataTamerSDK;
  private unsubscribers: Array<() => void> = [];

  constructor(apiKey: string) {
    this.sdk = new DataTamerSDK({
      baseUrl: 'https://app.datatamer.ai/api',
      apiKey
    });
  }

  async initialize() {
    // Connect to real-time events
    await this.sdk.realtime.connect({
      reconnect: true,
      maxReconnectAttempts: 10
    }, {
      onOpen: () => console.log('🟢 Real-time connected'),
      onError: (error) => console.error('🔴 Connection error:', error),
      onReconnect: (attempt) => console.log(`🔄 Reconnecting... (${attempt})`)
    });

    // Subscribe to notifications
    const unsubNotifications = this.sdk.realtime.onNotifications((notification) => {
      this.showNotification(notification);
    });
    this.unsubscribers.push(unsubNotifications);

    // Subscribe to datasource updates
    const unsubDatasources = this.sdk.realtime.onDatasourceUpdates((update) => {
      this.updateDatasourceStatus(update);
    });
    this.unsubscribers.push(unsubDatasources);

    // Subscribe to AI responses
    const unsubAI = this.sdk.realtime.onAIResponses((response) => {
      this.displayAIResponse(response);
    });
    this.unsubscribers.push(unsubAI);

    console.log('Dashboard initialized with real-time updates');
  }

  private showNotification(notification: any) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${notification.type.toLowerCase()}`;
    toast.innerHTML = `
      <h4>${notification.title}</h4>
      <p>${notification.message}</p>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
  }

  private updateDatasourceStatus(update: any) {
    const statusElement = document.getElementById(`datasource-${update.id}`);
    if (statusElement) {
      statusElement.textContent = update.status;
      statusElement.className = `status status-${update.status.toLowerCase()}`;
    }
  }

  private displayAIResponse(response: any) {
    const chatContainer = document.getElementById('ai-chat');
    if (chatContainer) {
      const messageDiv = document.createElement('div');
      messageDiv.innerHTML = `
        <div class="ai-message">
          <div class="message-content">${response.content}</div>
          <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
      `;
      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  async cleanup() {
    // Unsubscribe from all events
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    
    // Disconnect from real-time
    this.sdk.realtime.disconnect();
    
    console.log('Dashboard cleaned up');
  }
}

// Usage
const dashboard = new RealtimeDashboard(process.env.DATATAMER_API_TOKEN);
await dashboard.initialize();

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
  dashboard.cleanup();
});
```

### Stream Data Processing Example

```typescript
import DataTamerSDK from '@datatamer/data-tamer-sdk';

async function streamDataExample() {
  const sdk = new DataTamerSDK({
    baseUrl: 'https://app.datatamer.ai/api',
    apiKey: process.env.DATATAMER_API_TOKEN
  });

  // Get workspace and topic
  const workspaces = await sdk.workspaces.listWorkspaces();
  const workspace = workspaces[0];
  
  const topics = await sdk.topics.listTopics(workspace.id);
  const topic = topics[0];

  // Create stream datasource
  const streamDatasource = await sdk.datasources.create({
    name: 'IoT Sensor Stream',
    description: 'Real-time IoT sensor data',
    organizationId: workspace.id,
    datasourceType: 'STREAM',
    configuration: {
      streamConfig: {
        format: 'json',
        encoding: 'utf8',
        batchSize: 100,
        flushInterval: 5000
      }
    }
  });

  // Create tamed data for the stream
  const tamedData = await sdk.tamedData.create({
    name: 'IoT Sensor Data',
    description: 'Processed IoT sensor readings',
    projectId: topic.id,
    datasourceId: streamDatasource.id,
    dataType: 'stream'
  });

  // Generate API key for stream access
  const { apiKey } = await sdk.tamedData.generateApiKey(tamedData.id);
  console.log('Stream API key generated');

  // Simulate sending data to stream
  const sensorData = [
    {
      content: {
        sensor_id: 'temp-001',
        temperature: 23.5,
        humidity: 45.2,
        location: 'Office A',
        timestamp: new Date().toISOString()
      },
      metadata: {
        building: 'HQ',
        floor: 2,
        room: 'A205'
      }
    },
    {
      content: {
        sensor_id: 'temp-002',
        temperature: 26.1,
        humidity: 52.8,
        location: 'Conference Room',
        timestamp: new Date().toISOString()
      },
      metadata: {
        building: 'HQ',
        floor: 1,
        room: 'CR-101'
      }
    }
  ];

  // Send data to stream with retry
  for (const data of sensorData) {
    try {
      const result = await sdk.tamedData.sendToStreamWithRetry(
        tamedData.id,
        apiKey,
        data,
        3,  // max retries
        1000 // retry delay
      );
      
      if (result.success) {
        console.log(`✅ Data sent: ${data.content.sensor_id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send data: ${error.message}`);
    }
  }

  // Wait for data to be processed
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Search the stream data using RAG
  const searchQueries = [
    'Find temperature readings above 25 degrees',
    'Show me all sensor data from Office A',
    'What sensors are reporting high humidity?'
  ];

  for (const question of searchQueries) {
    try {
      const results = await sdk.tamedData.searchRag(tamedData.id, apiKey, {
        question,
        limit: 10
      });

      console.log(`🔍 Search: "${question}"`);
      console.log(`   Message ID: ${results.message_id}`);
      console.log(`   Success: ${results.success}`);
      
      if (results.results && results.results.length > 0) {
        console.log(`   Found ${results.results.length} results`);
        results.results.forEach((result, index) => {
          const content = result.content;
          console.log(`   ${index + 1}. ${content.sensor_id}: ${content.temperature}°C`);
        });
      } else {
        console.log('   No results found');
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Search failed: ${error.message}`);
    }
  }

  // Get stream data summary
  const streamSummary = await sdk.tamedData.getStreamData(tamedData.id, apiKey);
  console.log(`📊 Total stream records: ${streamSummary.streamData.length}`);
}
```

---

For more examples and detailed usage patterns, see the `/examples` directory in the SDK repository.

## Support

- **API Documentation**: https://app.datatamer.ai/api-docs
- **GitHub Repository**: https://github.com/data-tamer/data-tamer-sdk
- **Issues**: https://github.com/data-tamer/data-tamer-sdk/issues
- **Documentation**: https://docs.datatamer.com

---

*SDK Version: 2.0.0 | Last Updated: 2024*