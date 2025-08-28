import { BaseClient } from '../client/base';
import {
  Organization,
  OrganizationWithUsers,
  OrganizationDashboard,
  CreateOrganizationRequest,
  BillingHistory,
  AuthConfig,
} from '../types';

export class WorkspacesClient extends BaseClient {
  constructor(config: AuthConfig) {
    super(config);
  }

  /**
   * List all workspaces for the current user
   */
  async listWorkspaces(): Promise<Organization[]> {
    return this.get<Organization[]>('/api/organizations/list');
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(data: CreateOrganizationRequest): Promise<{
    organization: Organization;
    role: any;
    userRole: any;
  }> {
    return this.post<{
      organization: Organization;
      role: any;
      userRole: any;
    }>('/api/organizations/new', data);
  }

  /**
   * Get workspace details by ID
   */
  async getWorkspace(organizationId: string): Promise<OrganizationWithUsers> {
    return this.get<OrganizationWithUsers>(`/api/organizations/organization?id=${organizationId}`);
  }

  /**
   * Delete a workspace (admin only)
   */
  async deleteWorkspace(organizationId: string): Promise<void> {
    return this.post<void>('/api/organizations/delete', { id: organizationId });
  }

  /**
   * Get workspace dashboard data
   */
  async getWorkspaceDashboard(organizationId: string): Promise<OrganizationDashboard> {
    return this.get<OrganizationDashboard>(`/api/organizations/dashboard?organization=${organizationId}`);
  }

  /**
   * Add user to workspace (admin only)
   */
  async addUserToWorkspace(workspaceId: string, userEmail: string): Promise<{
    message: string;
    invitation?: any;
  }> {
    return this.post('/api/organizations/add-user', {
      organization: workspaceId,
      userEmail,
    });
  }

  /**
   * Remove user from workspace (admin only)
   */
  async removeUserFromWorkspace(workspaceId: string, roleId: string): Promise<void> {
    return this.post('/api/organizations/remove-user', {
      organization: workspaceId,
      roleId,
    });
  }

  /**
   * Change user role in workspace (admin only)
   */
  async changeUserRoleInWorkspace(
    workspaceId: string,
    userId: string,
    newRole: 'admin' | 'user'
  ): Promise<{ message: string }> {
    return this.post('/api/organizations/role-change', {
      organization: workspaceId,
      userId,
      newRole,
    });
  }

  /**
   * Check if current user is admin of workspace
   */
  async isWorkspaceAdmin(workspaceId: string): Promise<{ isAdmin: boolean }> {
    return this.get<{ isAdmin: boolean }>(`/api/organizations/is-admin?organization=${workspaceId}`);
  }

  /**
   * Regenerate workspace API key (admin only)
   */
  async regenerateWorkspaceApiKey(workspaceId: string): Promise<{ apiKey: string }> {
    return this.post<{ apiKey: string }>('/api/organizations/organization/regenerate-api-key', {
      organization: workspaceId,
    });
  }

  /**
   * Get pending workspace invitations
   */
  async getPendingWorkspaceInvitations(workspaceId: string): Promise<any[]> {
    return this.get<any[]>(`/api/organizations/invitations/pending?organization=${workspaceId}`);
  }

  /**
   * Revoke workspace invitation (admin only)
   */
  async revokeWorkspaceInvitation(invitationId: string): Promise<void> {
    return this.post<void>('/api/organizations/invitations/revoke', {
      invitationId,
    });
  }

  /**
   * Top up workspace credits
   */
  async topUpCredits(
    workspaceId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<{ paymentUrl: string }> {
    return this.post('/api/organizations/topup-credit/intent', {
      organization: workspaceId,
      amount,
      currency,
    });
  }

  /**
   * Top up workspace tokens
   */
  async topUpTokens(
    workspaceId: string,
    tokenAmount: number
  ): Promise<{ paymentUrl: string }> {
    return this.post('/api/organizations/topup-tokens', {
      organization: workspaceId,
      tokenAmount,
    });
  }

  /**
   * Get billing history for workspace
   */
  async getBillingHistory(workspaceId: string): Promise<BillingHistory[]> {
    return this.post('/api/billing/list', { organizationId: workspaceId });
  }
}