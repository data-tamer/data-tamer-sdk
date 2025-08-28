import { BaseClient } from '../client/base';
import {
  GoogleAuthUrlRequest,
  GoogleAuthUrlResponse,
  GoogleCallbackRequest,
  GoogleTokenResponse,
  GoogleRefreshRequest,
  AuthProviderResponse,
  CreateExternalAccountRequest,
  CreateExternalAccountResponse,
  User,
  Organization,
} from '../types';

/**
 * Auth module for authentication and external integrations
 */
export class Auth extends BaseClient {
  // Google OAuth

  /**
   * Generate Google OAuth authorization URL
   */
  async getGoogleAuthUrl(request?: GoogleAuthUrlRequest): Promise<GoogleAuthUrlResponse> {
    return this.post<GoogleAuthUrlResponse>('/api/auth/google-auth-url', request || {});
  }

  /**
   * Handle Google OAuth callback
   */
  async handleGoogleCallback(request: GoogleCallbackRequest): Promise<GoogleTokenResponse> {
    return this.post<GoogleTokenResponse>('/api/auth/google/callback', request);
  }

  /**
   * Refresh Google OAuth access token
   */
  async refreshGoogleToken(request: GoogleRefreshRequest): Promise<GoogleTokenResponse> {
    return this.post<GoogleTokenResponse>('/api/auth/google/refresh', request);
  }

  /**
   * Check if user authenticated via social login
   */
  async getAuthProvider(): Promise<AuthProviderResponse> {
    return this.get<AuthProviderResponse>('/api/auth/is-social');
  }

  // Account Creation

  /**
   * Create account with default workspace
   */
  async createAccount(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    workspaceName: string;
    workspaceDescription?: string;
  }): Promise<{
    message: string;
    user: User;
    organization: Organization;
    role: any;
    userRole: any;
  }> {
    return this.post('/api/accounts/create', data);
  }

  // External API (for external platforms)

  /**
   * Create user account from external platform
   * Requires API key authentication
   */
  async createExternalAccount(request: CreateExternalAccountRequest): Promise<CreateExternalAccountResponse> {
    return this.post<CreateExternalAccountResponse>('/api/external/accounts/create', request);
  }
}