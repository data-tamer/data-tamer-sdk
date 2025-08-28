import { BaseClient } from '../client/base';
import {
  User,
  ApiToken,
  CreateApiTokenRequest,
  CreateApiTokenResponse,
} from '../types';

/**
 * Users module for managing user accounts and API tokens
 */
export class Users extends BaseClient {
  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/api/users/info/get');
  }

  /**
   * Update user profile information
   */
  async updateProfile(data: { firstName: string; lastName: string }): Promise<User> {
    return this.post<User>('/api/users/info/modify', data);
  }

  /**
   * Change user password
   */
  async changePassword(password: string): Promise<{ user: User }> {
    return this.post<{ user: User }>('/api/users/password/modify', { password });
  }

  /**
   * Remove first login flag
   */
  async removeFirstLoginFlag(userId: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/api/users/removefirstlogin', { id: userId });
  }

  // API Token Management

  /**
   * List all API tokens for the current user
   */
  async listApiTokens(): Promise<ApiToken[]> {
    return this.get<ApiToken[]>('/api/users/tokens');
  }

  /**
   * Create a new API token
   */
  async createApiToken(request: CreateApiTokenRequest): Promise<CreateApiTokenResponse> {
    return this.post<CreateApiTokenResponse>('/api/users/tokens', request);
  }

  /**
   * Delete an API token by ID
   */
  async deleteApiToken(tokenId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/api/users/tokens/${tokenId}`);
  }

  // Admin-only endpoints (require super admin privileges)

  /**
   * List all inactive users (Admin only)
   */
  async listInactiveUsers(): Promise<User[]> {
    return this.get<User[]>('/api/users/inactive/list');
  }

  /**
   * Activate an inactive user (Admin only)
   */
  async activateUser(userId: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/api/users/inactive/activate', { id: userId });
  }

  /**
   * Update user email (Admin only)
   */
  async updateUserEmail(userId: string, email: string): Promise<User> {
    return this.post<User>('/api/users/create', { id: userId, email });
  }
}