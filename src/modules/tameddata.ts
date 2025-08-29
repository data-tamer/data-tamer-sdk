import { BaseClient } from '../client/base';
import {
  TamedData,
  Wire,
  CreateTamedDataRequest,
  StreamData,
  AuthConfig,
} from '../types';

export class TamedDataClient extends BaseClient {
  constructor(config: AuthConfig) {
    super(config);
  }

  /**
   * Create new tamed data
   */
  async create(data: CreateTamedDataRequest): Promise<TamedData> {
    return this.post<TamedData>('/api/tamed-data/new', data);
  }

  /**
   * Create tamed data with wire connections
   */
  async createWithWires(
    data: CreateTamedDataRequest,
    wires: Array<{
      originTable: string;
      originField: string;
      destinationTable: string;
      destinationField: string;
      transformationType?: string;
      transformationConfig?: Record<string, any>;
    }>
  ): Promise<{
    tamedData: TamedData;
    wires: Wire[];
  }> {
    return this.post<{
      tamedData: TamedData;
      wires: Wire[];
    }>('/api/tamed-data/new-wires', {
      ...data,
      wires,
    });
  }

  /**
   * Get tamed data by ID
   */
  async getTamedData(tamedDataId: string): Promise<TamedData> {
    return this.get<TamedData>(`/api/tamed-data/${tamedDataId}`);
  }

  /**
   * Update tamed data
   */
  async update(
    tamedDataId: string,
    updates: { name?: string; description?: string }
  ): Promise<TamedData> {
    return this.post<TamedData>('/api/tamed-data/edit', {
      id: tamedDataId,
      ...updates,
    });
  }

  /**
   * Delete tamed data
   */
  async deleteTamedData(tamedDataId: string): Promise<void> {
    return this.post<void>('/api/tamed-data/delete', {
      id: tamedDataId,
    });
  }

  /**
   * Get tamed data for a topic
   */
  async getByTopic(topicId: string): Promise<TamedData[]> {
    return this.post<TamedData[]>('/api/tamed-data/project', {
      projectId: topicId,
    });
  }

  // API Key Management

  /**
   * Get API key for tamed data
   */
  async getApiKey(tamedDataId: string): Promise<{ apiKey: string }> {
    return this.get<{ apiKey: string }>(`/api/tamed-data/${tamedDataId}/api-key`);
  }

  /**
   * Generate new API key for tamed data
   */
  async generateApiKey(tamedDataId: string): Promise<{ apiKey: string }> {
    return this.post<{ apiKey: string }>(`/api/tamed-data/${tamedDataId}/api-key/generate`);
  }

  /**
   * Regenerate existing API key for tamed data
   */
  async regenerateApiKey(tamedDataId: string): Promise<{ apiKey: string }> {
    return this.post<{ apiKey: string }>(`/api/tamed-data/${tamedDataId}/api-key/regenerate`);
  }

  // Stream API Integration

  /**
   * Get stream data from tamed data (requires API key)
   */
  async getStreamData(
    tamedDataId: string,
    apiKey: string
  ): Promise<{
    tamedData: TamedData;
    streamData: StreamData[];
  }> {
    // Temporarily set API key for this request
    const originalApiKey = this.config.apiKey;
    this.setApiKey(apiKey);

    try {
      const response = await this.get<{
        tamedData: TamedData;
        streamData: StreamData[];
      }>(`/api/stream/${tamedDataId}`);
      
      return response;
    } finally {
      // Restore original API key
      if (originalApiKey) {
        this.setApiKey(originalApiKey);
      }
    }
  }

  /**
   * Send data to stream (requires API key)
   */
  async sendToStream(
    tamedDataId: string,
    apiKey: string,
    data: {
      content: any;
      metadata?: Record<string, any>;
      timestamp?: string;
    }
  ): Promise<{ success: boolean; messageId?: string }> {
    // Temporarily set API key for this request
    const originalApiKey = this.config.apiKey;
    this.setApiKey(apiKey);

    try {
      const response = await this.post<{ success: boolean; messageId?: string }>(
        `/api/stream/${tamedDataId}`,
        {
          content: data.content,
          metadata: data.metadata,
          timestamp: data.timestamp || new Date().toISOString(),
        }
      );
      
      return response;
    } finally {
      // Restore original API key
      if (originalApiKey) {
        this.setApiKey(originalApiKey);
      }
    }
  }

  /**
   * Search stream data using RAG (Retrieval-Augmented Generation) (requires API key)
   */
  async searchRag(
    tamedDataId: string,
    apiKey: string,
    searchParams: {
      question: string;
      limit?: number;
      offset?: number;
      user_id?: string;
    }
  ): Promise<{
    message_id: string;
    success: boolean;
    results?: any[];
    error?: string;
  }> {
    // Temporarily set API key for this request
    const originalApiKey = this.config.apiKey;
    this.setApiKey(apiKey);

    try {
      // Prepare the request body according to the API specification
      const requestBody = {
        question: searchParams.question,
        tamed_data_id: tamedDataId,
        limit: searchParams.limit,
        offset: searchParams.offset,
        user_id: searchParams.user_id,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const response = await this.post<{
        message_id: string;
        success: boolean;
        results?: any[];
        error?: string;
      }>(`/api/stream/${tamedDataId}/search`, requestBody);
      
      return response;
    } finally {
      // Restore original API key
      if (originalApiKey) {
        this.setApiKey(originalApiKey);
      }
    }
  }

  // Utility methods

  /**
   * Get tamed data by status
   */
  async getByStatus(
    topicId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'PROCESSING'
  ): Promise<TamedData[]> {
    const allTamedData = await this.getByTopic(topicId);
    return allTamedData.filter((td) => td.status === status);
  }

  /**
   * Get active tamed data for a topic
   */
  async getActive(topicId: string): Promise<TamedData[]> {
    return this.getByStatus(topicId, 'ACTIVE');
  }

  /**
   * Get tamed data by data type
   */
  async getByDataType(topicId: string, dataType: string): Promise<TamedData[]> {
    const allTamedData = await this.getByTopic(topicId);
    return allTamedData.filter((td) => td.dataType === dataType);
  }

  /**
   * Check if tamed data exists
   */
  async exists(tamedDataId: string): Promise<boolean> {
    try {
      await this.get(tamedDataId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clone tamed data (creates a copy with new name)
   */
  async clone(
    tamedDataId: string,
    newName: string,
    newDescription?: string
  ): Promise<TamedData> {
    // Get the original tamed data
    const original = await this.getTamedData(tamedDataId);
    
    // Create new tamed data with same configuration
    const cloneData: CreateTamedDataRequest = {
      name: newName,
      description: newDescription || `Clone of ${original.name}`,
      projectId: original.projectId,
      datasourceId: original.datasourceId,
      dataType: original.dataType,
      configuration: { ...original.configuration },
    };

    return this.create(cloneData);
  }

  /**
   * Batch create multiple tamed data entries
   */
  async batchCreate(requests: CreateTamedDataRequest[]): Promise<TamedData[]> {
    const results: TamedData[] = [];
    
    // Execute requests sequentially to avoid rate limiting
    for (const request of requests) {
      try {
        const result = await this.create(request);
        results.push(result);
      } catch (error) {
        console.error(`Failed to create tamed data: ${request.name}`, error);
        // Continue with other requests even if one fails
      }
    }

    return results;
  }

  /**
   * Stream data with automatic retries
   */
  async sendToStreamWithRetry(
    tamedDataId: string,
    apiKey: string,
    data: {
      content: any;
      metadata?: Record<string, any>;
      timestamp?: string;
    },
    maxRetries: number = 3,
    retryDelayMs: number = 1000
  ): Promise<{ success: boolean; messageId?: string }> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendToStream(tamedDataId, apiKey, data);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Failed to send data to stream after retries');
  }
}