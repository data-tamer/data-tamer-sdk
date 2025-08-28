import { BaseClient } from '../client/base';
import {
  Conversation,
  ConversationMessage,
  AIResponse,
  CreateConversationRequest,
  SendPromptRequest,
  AuthConfig,
} from '../types';

export class ConversationsClient extends BaseClient {
  constructor(config: AuthConfig) {
    super(config);
  }

  /**
   * Get conversation history for workspace and topic
   */
  async getHistory(
    workspaceId: string,
    topicId: string
  ): Promise<Conversation[]> {
    return this.post<Conversation[]>('/api/conversations/history', {
      organization_id: workspaceId,
      project_id: topicId,
    });
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    offset: number = 0,
    limit: number = 10
  ): Promise<{
    messages: ConversationMessage[];
    hasMore: boolean;
    total: number;
  }> {
    return this.post('/api/conversations/messages', {
      conversation_id: conversationId,
      offset,
      limit,
    });
  }

  /**
   * Edit conversation title
   */
  async editTitle(
    conversationId: string,
    newTitle: string
  ): Promise<Conversation> {
    return this.post<Conversation>('/api/conversations/edit', {
      conversationId,
      title: newTitle,
    });
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(conversationId: string): Promise<void> {
    return this.post<void>('/api/conversations/delete', {
      conversationId,
    });
  }

  // AI/Prompts Integration

  /**
   * Create a new AI conversation
   */
  async createConversation(
    data: CreateConversationRequest
  ): Promise<{
    conversationId: string;
    conversation: Conversation;
  }> {
    return this.post('/api/prompts/conversation/create', data);
  }

  /**
   * Submit a prompt to AI and get response
   */
  async submitPrompt(data: SendPromptRequest): Promise<AIResponse> {
    return this.post<AIResponse>('/api/prompts/submit', data);
  }

  /**
   * Get AI response (for polling-based implementations)
   */
  async getResponse(conversationId: string): Promise<AIResponse> {
    return this.post<AIResponse>('/api/prompts/response', {
      conversationId,
    });
  }

  /**
   * Stop AI processing
   */
  async stopProcessing(conversationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.post('/api/prompts/stop', {
      conversationId,
    });
  }

  // High-level convenience methods

  /**
   * Start a new conversation with an initial message
   */
  async startConversation(
    workspaceId: string,
    topicId: string,
    initialMessage: string,
    title?: string
  ): Promise<{
    conversation: Conversation;
    response: AIResponse;
  }> {
    // Create the conversation
    const { conversationId, conversation } = await this.createConversation({
      title: title || 'New Conversation',
      organizationId: workspaceId,
      projectId: topicId,
    });

    // Send the initial message
    const response = await this.submitPrompt({
      conversationId,
      message: initialMessage,
    });

    return {
      conversation,
      response,
    };
  }

  /**
   * Continue an existing conversation
   */
  async continueConversation(
    conversationId: string,
    message: string,
    context?: Record<string, any>
  ): Promise<AIResponse> {
    return this.submitPrompt({
      conversationId,
      message,
      context,
    });
  }

  /**
   * Get full conversation thread (all messages)
   */
  async getFullConversation(conversationId: string): Promise<{
    conversation: Conversation;
    messages: ConversationMessage[];
  }> {
    const allMessages: ConversationMessage[] = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    // Get all messages by pagination
    while (hasMore) {
      const { messages, hasMore: more } = await this.getMessages(
        conversationId,
        offset,
        limit
      );
      
      allMessages.push(...messages);
      hasMore = more;
      offset += limit;
    }

    // Sort messages by timestamp (oldest first)
    allMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // We don't have a direct conversation endpoint, so we'll construct it
    // In a real implementation, you might want to add an endpoint for this
    const conversation: Conversation = {
      id: conversationId,
      title: 'Conversation', // Would need to be fetched separately
      organizationId: '',
      projectId: '',
      userId: '',
      status: 'ACTIVE',
      createdAt: allMessages[0]?.timestamp || new Date().toISOString(),
      updatedAt: allMessages[allMessages.length - 1]?.timestamp || new Date().toISOString(),
    };

    return {
      conversation,
      messages: allMessages,
    };
  }

  /**
   * Search conversations by title or content
   */
  async search(
    workspaceId: string,
    topicId: string,
    query: string
  ): Promise<Conversation[]> {
    // Get all conversations first
    const conversations = await this.getHistory(workspaceId, topicId);
    
    // Filter by title (client-side filtering)
    // In a production environment, you'd want server-side search
    const filteredConversations = conversations.filter(conv =>
      conv.title.toLowerCase().includes(query.toLowerCase())
    );

    return filteredConversations;
  }

  /**
   * Archive old conversations (mark as archived)
   */
  async archiveOldConversations(
    workspaceId: string,
    topicId: string,
    daysOld: number = 30
  ): Promise<{
    archived: number;
    conversations: Conversation[];
  }> {
    const conversations = await this.getHistory(workspaceId, topicId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const toArchive = conversations.filter(conv => 
      new Date(conv.updatedAt) < cutoffDate && conv.status === 'ACTIVE'
    );

    // Archive each conversation (assuming there's an update endpoint)
    const archivedConversations: Conversation[] = [];
    for (const conv of toArchive) {
      try {
        // This would need to be implemented in the API
        // For now, we'll just mark them in the response
        archivedConversations.push({
          ...conv,
          status: 'ARCHIVED'
        });
      } catch (error) {
        console.error(`Failed to archive conversation ${conv.id}:`, error);
      }
    }

    return {
      archived: archivedConversations.length,
      conversations: archivedConversations,
    };
  }

  /**
   * Get conversation statistics
   */
  async getStats(
    workspaceId: string,
    topicId: string
  ): Promise<{
    totalConversations: number;
    activeConversations: number;
    archivedConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
  }> {
    const conversations = await this.getHistory(workspaceId, topicId);
    
    const active = conversations.filter(c => c.status === 'ACTIVE');
    const archived = conversations.filter(c => c.status === 'ARCHIVED');

    // Get message count for each conversation (this could be expensive)
    let totalMessages = 0;
    for (const conv of conversations.slice(0, 10)) { // Limit to first 10 for performance
      try {
        const { total } = await this.getMessages(conv.id, 0, 1);
        totalMessages += total;
      } catch (error) {
        // Continue if we can't get message count for a conversation
      }
    }

    return {
      totalConversations: conversations.length,
      activeConversations: active.length,
      archivedConversations: archived.length,
      totalMessages,
      averageMessagesPerConversation: conversations.length > 0 
        ? Math.round(totalMessages / Math.min(conversations.length, 10))
        : 0,
    };
  }
}