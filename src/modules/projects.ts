import { BaseClient } from '../client/base';
import {
  Project,
  ProjectUser,
  ProjectAction,
  CreateProjectRequest,
  AuthConfig,
} from '../types';

export class ProjectsClient extends BaseClient {
  constructor(config: AuthConfig) {
    super(config);
  }

  /**
   * List all topics for a workspace
   */
  async listTopics(workspaceId: string): Promise<Project[]> {
    return this.post<Project[]>('/api/projects/list', {
      organization: workspaceId,
    });
  }

  /**
   * Create a new topic
   */
  async createTopic(data: CreateProjectRequest): Promise<Project> {
    return this.post<Project>('/api/projects/new', data);
  }

  /**
   * Get topic details by ID
   */
  async getTopic(topicId: string): Promise<Project> {
    return this.post<Project>('/api/projects/project', { id: topicId });
  }

  /**
   * Update topic details
   */
  async updateTopic(
    topicId: string,
    updates: Partial<Pick<Project, 'name' | 'description'>>
  ): Promise<Project> {
    return this.post<Project>('/api/projects/edit', {
      id: topicId,
      ...updates,
    });
  }

  /**
   * Delete a topic
   */
  async deleteTopic(topicId: string): Promise<void> {
    return this.post<void>('/api/projects/delete', { id: topicId });
  }

  /**
   * Send a chat message in topic context
   */
  async chatInTopic(
    topicId: string,
    message: string,
    context?: Record<string, any>
  ): Promise<{
    conversationId: string;
    messageId: string;
    response: string;
  }> {
    return this.post('/api/projects/chat', {
      projectId: topicId,
      message,
      context,
    });
  }

  // Project Users Management
  
  /**
   * List users in a topic
   */
  async listTopicUsers(topicId: string): Promise<ProjectUser[]> {
    return this.post<ProjectUser[]>('/api/projects/users/list', {
      projectId: topicId,
    });
  }

  /**
   * Add user to topic
   */
  async addUserToTopic(
    topicId: string,
    userEmail: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<{
    message: string;
    userRole?: ProjectUser;
  }> {
    return this.post('/api/projects/users/add', {
      projectId: topicId,
      userEmail,
      role,
    });
  }

  /**
   * Remove user from topic
   */
  async removeUserFromTopic(topicId: string, userId: string): Promise<void> {
    return this.post('/api/projects/users/remove', {
      projectId: topicId,
      userId,
    });
  }

  // Topic Actions Management

  /**
   * List topic actions
   */
  async listTopicActions(topicId: string): Promise<ProjectAction[]> {
    return this.post<ProjectAction[]>('/api/projects/actions/list', {
      projectId: topicId,
    });
  }

  /**
   * Add a new topic action
   */
  async addTopicAction(
    topicId: string,
    action: {
      name: string;
      description: string;
      actionType: string;
      parameters: Record<string, any>;
    }
  ): Promise<ProjectAction> {
    return this.post<ProjectAction>('/api/projects/actions/add', {
      projectId: topicId,
      ...action,
    });
  }

  /**
   * Delete a topic action
   */
  async deleteTopicAction(actionId: string): Promise<void> {
    return this.post<void>('/api/projects/actions/delete', {
      actionId,
    });
  }

  // Utility Methods

  /**
   * Get topic statistics
   */
  async getTopicStats(topicId: string): Promise<{
    totalUsers: number;
    totalActions: number;
    totalTamedData: number;
    lastActivity: string;
  }> {
    const [users, actions] = await Promise.all([
      this.listTopicUsers(topicId),
      this.listTopicActions(topicId),
    ]);

    const project = await this.getTopic(topicId);

    return {
      totalUsers: users.length,
      totalActions: actions.length,
      totalTamedData: project.tamedDataCount || 0,
      lastActivity: project.lastAccessedAt || project.updatedAt,
    };
  }

  /**
   * Check if current user has admin access to topic
   */
  async hasTopicAdminAccess(topicId: string): Promise<boolean> {
    try {
      const users = await this.listTopicUsers(topicId);
      // This would need to be implemented based on your actual user identification
      // For now, we'll assume the first user is the current user
      return users.length > 0 && users[0].role === 'admin';
    } catch (error) {
      return false;
    }
  }
}