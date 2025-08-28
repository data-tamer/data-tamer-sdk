// Main SDK Client
import { BaseClient } from './client/base';
import { OrganizationsClient } from './modules/organizations';
import { ProjectsClient } from './modules/projects';
import { WorkspacesClient } from './modules/workspaces';
import { TopicsClient } from './modules/topics';
import { DatasourcesClient } from './modules/datasources';
import { TamedDataClient } from './modules/tameddata';
import { ConversationsClient } from './modules/conversations';
import { BillingClient } from './modules/billing';
import { RealtimeClient } from './modules/realtime';
import { Users } from './modules/users';
import { Auth } from './modules/auth';
import { Notifications } from './modules/notifications';
import { Templates } from './modules/templates';
import { Integrations } from './modules/email';
import { AuthConfig } from './types';

export class DataTamerSDK extends BaseClient {
  // Legacy module names for backward compatibility
  public readonly organizations: OrganizationsClient;
  public readonly projects: ProjectsClient;
  
  // New module names
  public readonly workspaces: WorkspacesClient;
  public readonly topics: TopicsClient;
  
  // Other modules
  public readonly datasources: DatasourcesClient;
  public readonly tamedData: TamedDataClient;
  public readonly conversations: ConversationsClient;
  public readonly billing: BillingClient;
  public readonly realtime: RealtimeClient;
  
  // New modules
  public readonly users: Users;
  public readonly auth: Auth;
  public readonly notifications: Notifications;
  public readonly templates: Templates;
  public readonly integrations: Integrations;

  constructor(config: AuthConfig) {
    super(config);
    
    // Initialize all module clients with the same config
    // Legacy modules for backward compatibility
    this.organizations = new OrganizationsClient(config);
    this.projects = new ProjectsClient(config);
    
    // New module names
    this.workspaces = new WorkspacesClient(config);
    this.topics = new TopicsClient(config);
    
    // Other modules
    this.datasources = new DatasourcesClient(config);
    this.tamedData = new TamedDataClient(config);
    this.conversations = new ConversationsClient(config);
    this.billing = new BillingClient(config);
    this.realtime = new RealtimeClient(config);
    
    // New modules
    this.users = new Users(config);
    this.auth = new Auth(config);
    this.notifications = new Notifications(config);
    this.templates = new Templates(config);
    this.integrations = new Integrations(config);
  }

  /**
   * Update authentication for all modules
   */
  public updateAllAuth(updates: Partial<AuthConfig>): void {
    this.updateAuth(updates);
    this.organizations.updateAuth(updates);
    this.projects.updateAuth(updates);
    this.workspaces.updateAuth(updates);
    this.topics.updateAuth(updates);
    this.datasources.updateAuth(updates);
    this.tamedData.updateAuth(updates);
    this.conversations.updateAuth(updates);
    this.billing.updateAuth(updates);
    this.realtime.updateAuth(updates);
    this.users.updateAuth(updates);
    this.auth.updateAuth(updates);
    this.notifications.updateAuth(updates);
    this.templates.updateAuth(updates);
    this.integrations.updateAuth(updates);
  }

  /**
   * Set session token for all modules
   */
  public setAllSessionToken(token: string): void {
    this.setSessionToken(token);
    this.organizations.setSessionToken(token);
    this.projects.setSessionToken(token);
    this.workspaces.setSessionToken(token);
    this.topics.setSessionToken(token);
    this.datasources.setSessionToken(token);
    this.tamedData.setSessionToken(token);
    this.conversations.setSessionToken(token);
    this.billing.setSessionToken(token);
    this.realtime.setSessionToken(token);
    this.users.setSessionToken(token);
    this.auth.setSessionToken(token);
    this.notifications.setSessionToken(token);
    this.templates.setSessionToken(token);
    this.integrations.setSessionToken(token);
  }

  /**
   * Set API key for all modules
   */
  public setAllApiKey(apiKey: string): void {
    this.setApiKey(apiKey);
    this.organizations.setApiKey(apiKey);
    this.projects.setApiKey(apiKey);
    this.workspaces.setApiKey(apiKey);
    this.topics.setApiKey(apiKey);
    this.datasources.setApiKey(apiKey);
    this.tamedData.setApiKey(apiKey);
    this.conversations.setApiKey(apiKey);
    this.billing.setApiKey(apiKey);
    this.realtime.setApiKey(apiKey);
    this.users.setApiKey(apiKey);
    this.auth.setApiKey(apiKey);
    this.notifications.setApiKey(apiKey);
    this.templates.setApiKey(apiKey);
    this.integrations.setApiKey(apiKey);
  }

  /**
   * Health check endpoint
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    services: Record<string, boolean>;
  }> {
    const timestamp = new Date().toISOString();
    const services: Record<string, boolean> = {};

    try {
      // Test basic connectivity
      await this.get('/api/swagger');
      services.api = true;
    } catch {
      services.api = false;
    }

    try {
      // Test real-time connectivity
      services.realtime = this.realtime.isConnectedToStream();
    } catch {
      services.realtime = false;
    }

    const allHealthy = Object.values(services).every(status => status === true);

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      services,
    };
  }
}

// Export all types and classes
export * from './types';
export { BaseClient } from './client/base';
// Legacy module exports for backward compatibility
export { OrganizationsClient } from './modules/organizations';
export { ProjectsClient } from './modules/projects';
// New module exports
export { WorkspacesClient } from './modules/workspaces';
export { TopicsClient } from './modules/topics';
// Other module exports
export { DatasourcesClient } from './modules/datasources';
export { TamedDataClient } from './modules/tameddata';
export { ConversationsClient } from './modules/conversations';
export { BillingClient } from './modules/billing';
export { RealtimeClient } from './modules/realtime';
// New module exports
export { Users } from './modules/users';
export { Auth } from './modules/auth';
export { Notifications } from './modules/notifications';
export { Templates } from './modules/templates';
export { Integrations } from './modules/email';

// Default export
export default DataTamerSDK;