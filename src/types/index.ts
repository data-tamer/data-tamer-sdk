// Base types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface AuthConfig {
  baseUrl: string;
  sessionToken?: string;
  apiKey?: string;
  timeout?: number;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isFirstLogin?: boolean;
}

// API Token types
export interface ApiToken {
  id: string;
  name: string;
  last_used_at?: string;
  created_at: string;
}

export interface CreateApiTokenRequest {
  name: string;
}

export interface CreateApiTokenResponse extends ApiToken {
  token: string; // Only returned once during creation
}

// External Account types
export interface CreateExternalAccountRequest {
  email: string;
  firstName: string;
  lastName: string;
  workspaceName: string;
  workspaceDescription?: string;
  externalPlatform: string;
  externalUserId: string;
  metadata?: Record<string, any>;
}

export interface CreateExternalAccountResponse {
  success: boolean;
  message: string;
  user: User & {
    externalPlatform: string;
    externalUserId: string;
  };
  organization: Organization;
  accessToken: string;
}

// Auth types
export interface GoogleAuthUrlRequest {
  redirectUrl?: string;
}

export interface GoogleAuthUrlResponse {
  authUrl: string;
}

export interface GoogleCallbackRequest {
  code: string;
  redirect_uri?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface GoogleRefreshRequest {
  refresh_token: string;
}

export interface AuthProviderResponse {
  provider: 'google' | 'github' | 'email' | 'unknown';
}

// Email types  
export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId: string;
  message: string;
}

// Google Drive types
export interface GoogleDriveDownloadRequest {
  fileId: string;
  mimeType: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  description: string;
  owner: string;
  apiKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationRole {
  id: string;
  fk_organization_id: string;
  role: 'admin' | 'user';
}

export interface UserOrganizationRole {
  id: string;
  fk_user_id: string;
  fk_role_id: string;
}

export interface OrganizationWithUsers extends Organization {
  users: Array<{
    user: User;
    role: string;
  }>;
}

export interface OrganizationDashboard {
  totalProjects: number;
  totalDatasources: number;
  totalConversations: number;
  usageChart: Array<{
    date: string;
    value: number;
  }>;
  projectsChart: Array<{
    name: string;
    count: number;
  }>;
}

// Project types
export interface Project {
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

export interface ProjectUser {
  id: string;
  projectId: string;
  userId: string;
  role: 'admin' | 'member';
  user: User;
}

export interface ProjectAction {
  id: string;
  projectId: string;
  name: string;
  description: string;
  actionType: string;
  parameters: Record<string, any>;
  createdBy: string;
  createdAt: string;
}

// Datasource types
export type DatasourceStatus = 'ACTIVE' | 'INACTIVE' | 'PROCESSING' | 'ERROR' | 'DELETED';
export type DatasourceType = 'SQL' | 'CSV' | 'JSON' | 'API' | 'STREAM' | 'GIT';

export interface Datasource {
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

export interface DatasourceHistory {
  id: string;
  datasourceId: string;
  status: DatasourceStatus;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Tamed Data types
export interface TamedData {
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

export interface Wire {
  id: string;
  tamedDataId: string;
  originTable: string;
  originField: string;
  destinationTable: string;
  destinationField: string;
  transformationType?: string;
  transformationConfig?: Record<string, any>;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  organizationId: string;
  projectId: string;
  userId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AIResponse {
  conversationId: string;
  messageId: string;
  content: string;
  metadata?: Record<string, any>;
  isComplete: boolean;
}

// Notification types
export interface Notification {
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

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  templateType: string;
  configuration: Record<string, any>;
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Billing types
export interface BillingHistory {
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

export interface Subscription {
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

// Stripe types
export interface CreateSubscriptionRequest {
  priceId: string;
  organizationId: string;
}

export interface CreateTokenCheckoutRequest {
  priceId: string;
  organizationId: string;
}

export interface CheckoutResponse {
  url: string;
}

export interface CreateSubscriptionDatabaseRequest {
  subscriptionId: string;
  supabaseUserId: string;
  planAmount: number;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  organizationId: string;
  tokensAmount: string;
}

// Stream types
export interface StreamData {
  content: any;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface StreamMessage {
  tamedDataId: string;
  data: StreamData;
}

// SSE Event types
export interface SSEEvent {
  id?: string;
  event?: string;
  data: any;
  retry?: number;
}

// Request types
export interface CreateOrganizationRequest {
  name: string;
  description: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  organizationId: string;
}

export interface CreateDatasourceRequest {
  name: string;
  description: string;
  organizationId: string;
  datasourceType: DatasourceType;
  configuration: Record<string, any>;
}

export interface CreateTamedDataRequest {
  name: string;
  description: string;
  projectId: string;
  datasourceId: string;
  dataType: string;
  configuration?: Record<string, any>;
}

export interface CreateConversationRequest {
  title?: string;
  organizationId: string;
  projectId: string;
}

export interface SendPromptRequest {
  conversationId: string;
  message: string;
  context?: Record<string, any>;
}

// Error types
export class DataTamerError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DataTamerError';
  }
}