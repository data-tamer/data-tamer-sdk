import { BaseClient } from '../client/base';
import {
  Datasource,
  DatasourceHistory,
  CreateDatasourceRequest,
  DatasourceType,
  DatasourceStatus,
  AuthConfig,
} from '../types';

export class DatasourcesClient extends BaseClient {
  constructor(config: AuthConfig) {
    super(config);
  }

  /**
   * List all datasources for a workspace
   */
  async listForWorkspace(workspaceId: string): Promise<Datasource[]> {
    return this.post<Datasource[]>('/api/datasources/list', {
      organization: workspaceId,
    });
  }

  /**
   * Get datasource details by ID
   */
  async getDatasource(datasourceId: string): Promise<Datasource> {
    return this.post<Datasource>('/api/datasources/datasource', {
      id: datasourceId,
    });
  }

  /**
   * Create a new datasource
   */
  async create(data: CreateDatasourceRequest): Promise<Datasource> {
    return this.post<Datasource>('/api/datasources/new', data);
  }

  /**
   * Update datasource details
   */
  async update(
    datasourceId: string,
    updates: { name?: string; description?: string }
  ): Promise<Datasource> {
    return this.post<Datasource>('/api/datasources/edit', {
      id: datasourceId,
      ...updates,
    });
  }

  /**
   * Delete a datasource (soft delete)
   */
  async deleteDatasource(datasourceId: string): Promise<void> {
    return this.post<void>('/api/datasources/delete', {
      id: datasourceId,
    });
  }

  /**
   * Get datasources for a specific topic
   */
  async getByTopic(topicId: string): Promise<Datasource[]> {
    return this.post<Datasource[]>('/api/datasources/project-datasources', {
      projectId: topicId,
    });
  }

  /**
   * Get datasource processing history
   */
  async getHistory(datasourceId: string): Promise<DatasourceHistory[]> {
    return this.post<DatasourceHistory[]>('/api/datasources/compute_datasource_history', {
      datasourceId,
    });
  }

  /**
   * Rebuild/reprocess a datasource
   */
  async rebuild(datasourceId: string): Promise<{
    message: string;
    status: DatasourceStatus;
  }> {
    return this.post('/api/datasources/rebuild', {
      datasourceId,
    });
  }

  /**
   * Stop datasource processing
   */
  async stop(datasourceId: string): Promise<{
    message: string;
    status: DatasourceStatus;
  }> {
    return this.post('/api/datasources/stop', {
      datasourceId,
    });
  }

  /**
   * Stream data from a STREAM type datasource
   */
  async stream(
    datasourceId: string,
    data: {
      content: any;
      metadata?: Record<string, any>;
      timestamp?: string;
    }
  ): Promise<{ message: string }> {
    return this.post('/api/datasources/stream', {
      datasourceId,
      ...data,
    });
  }

  /**
   * Test SQL connection for SQL datasources
   */
  async testSqlConnection(connectionConfig: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    return this.post('/api/datasources/testsql', connectionConfig);
  }

  /**
   * Test Git connection for GIT datasources
   */
  async testGitConnection(gitConfig: {
    repositoryUrl: string;
    branch?: string;
    username?: string;
    accessToken?: string;
    provider?: 'github' | 'gitlab' | 'bitbucket';
  }): Promise<{
    success: boolean;
    message: string;
    branches?: string[];
    error?: string;
  }> {
    return this.post('/api/datasources/tests-git', gitConfig);
  }

  /**
   * Get wildcard/demo data (for testing)
   */
  async getWildData(): Promise<any[]> {
    return this.get<any[]>('/api/datasources/wilddata');
  }

  /**
   * Download datasource file
   */
  async downloadFile(datasourceId: string): Promise<{
    downloadUrl: string;
    expiresAt: string;
  }> {
    return this.get<{
      downloadUrl: string;
      expiresAt: string;
    }>(`/api/datasources/download/${datasourceId}`);
  }

  // Utility methods

  /**
   * Get datasources by type
   */
  async getByType(
    workspaceId: string,
    type: DatasourceType
  ): Promise<Datasource[]> {
    const allDatasources = await this.listForWorkspace(workspaceId);
    return allDatasources.filter((ds) => ds.datasourceType === type);
  }

  /**
   * Get datasources by status
   */
  async getByStatus(
    workspaceId: string,
    status: DatasourceStatus
  ): Promise<Datasource[]> {
    const allDatasources = await this.listForWorkspace(workspaceId);
    return allDatasources.filter((ds) => ds.status === status);
  }

  /**
   * Get active datasources
   */
  async getActive(workspaceId: string): Promise<Datasource[]> {
    return this.getByStatus(workspaceId, 'ACTIVE');
  }

  /**
   * Wait for datasource to reach a specific status
   */
  async waitForStatus(
    datasourceId: string,
    targetStatus: DatasourceStatus,
    timeoutMs: number = 60000,
    pollIntervalMs: number = 2000
  ): Promise<Datasource> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const datasource = await this.getDatasource(datasourceId);
      
      if (datasource.status === targetStatus) {
        return datasource;
      }

      if (datasource.status === 'ERROR') {
        throw new Error(`Datasource reached ERROR status while waiting for ${targetStatus}`);
      }

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Timeout waiting for datasource to reach ${targetStatus} status`);
  }

  /**
   * Validate datasource configuration based on type
   */
  validateConfiguration(type: DatasourceType, config: Record<string, any>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    switch (type) {
      case 'SQL':
        if (!config.host) errors.push('Host is required');
        if (!config.port) errors.push('Port is required');
        if (!config.database) errors.push('Database is required');
        if (!config.username) errors.push('Username is required');
        if (!config.password) errors.push('Password is required');
        break;

      case 'API':
        if (!config.url) errors.push('URL is required');
        if (!config.method) errors.push('HTTP method is required');
        break;

      case 'GIT':
        if (!config.repositoryUrl) errors.push('Repository URL is required');
        break;

      case 'CSV':
      case 'JSON':
        if (!config.filePath && !config.fileContent) {
          errors.push('File path or content is required');
        }
        break;

      case 'STREAM':
        if (!config.streamConfig) errors.push('Stream configuration is required');
        break;

      default:
        errors.push(`Unknown datasource type: ${type}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}