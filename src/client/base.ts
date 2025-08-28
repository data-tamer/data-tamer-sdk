import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthConfig, DataTamerError } from '../types';

export class BaseClient {
  protected axios: AxiosInstance;
  protected config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.axios = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.axios.interceptors.request.use(
      (config) => {
        // Add session token if available
        if (this.config.sessionToken) {
          config.headers.Cookie = `sb-access-token=${this.config.sessionToken}`;
        }

        // Add API key if available
        if (this.config.apiKey) {
          config.headers.Authorization = `Bearer ${this.config.apiKey}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          throw new DataTamerError(
            data?.error || data?.message || `HTTP ${status} Error`,
            status,
            data?.code,
            data
          );
        } else if (error.request) {
          throw new DataTamerError('Network error - no response received');
        } else {
          throw new DataTamerError(error.message || 'Unknown error occurred');
        }
      }
    );
  }

  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  protected async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }

  protected async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data, ...config });
  }

  // Update authentication config
  public updateAuth(updates: Partial<AuthConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Set session token
  public setSessionToken(token: string): void {
    this.config.sessionToken = token;
  }

  // Set API key
  public setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  // Get current configuration
  public getConfig(): AuthConfig {
    return { ...this.config };
  }
}