import EventSource from 'eventsource';
import { BaseClient } from '../client/base';
import { AuthConfig, SSEEvent } from '../types';

export interface RealtimeOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface RealtimeEventHandlers {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onError?: (error: Event | Error) => void;
  onClose?: () => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFailed?: () => void;
}

export class RealtimeClient extends BaseClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private shouldReconnect: boolean = true;
  private handlers: RealtimeEventHandlers = {};
  private isConnected: boolean = false;

  constructor(config: AuthConfig) {
    super(config);
  }

  /**
   * Connect to Server-Sent Events stream
   */
  async connect(
    options: RealtimeOptions = {},
    handlers: RealtimeEventHandlers = {}
  ): Promise<void> {
    this.shouldReconnect = options.reconnect !== false;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.handlers = handlers;

    await this.establishConnection();
  }

  private async establishConnection(): Promise<void> {
    try {
      // Close existing connection
      if (this.eventSource) {
        this.eventSource.close();
      }

      // Build SSE URL with authentication
      const sseUrl = this.buildSseUrl();
      
      // Create EventSource connection
      this.eventSource = new EventSource(sseUrl);

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      if (this.handlers.onError) {
        this.handlers.onError(error as Error);
      }
      
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  private buildSseUrl(): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const url = new URL(`${baseUrl}/api/sse`);

    // Add authentication parameters
    if (this.config.sessionToken) {
      url.searchParams.set('token', this.config.sessionToken);
    }

    if (this.config.apiKey) {
      url.searchParams.set('apiKey', this.config.apiKey);
    }

    return url.toString();
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      if (this.handlers.onOpen) {
        this.handlers.onOpen();
      }
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (this.handlers.onMessage) {
          this.handlers.onMessage(data);
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.isConnected = false;
      
      if (this.handlers.onError) {
        this.handlers.onError(error);
      }

      // Handle reconnection
      if (this.shouldReconnect && this.eventSource?.readyState === EventSource.CLOSED) {
        this.scheduleReconnect();
      }
    };

    // Handle custom events
    this.eventSource.addEventListener('notification', (event) => {
      this.handleCustomEvent('notification', event);
    });

    this.eventSource.addEventListener('datasource_update', (event) => {
      this.handleCustomEvent('datasource_update', event);
    });

    this.eventSource.addEventListener('topic_update', (event) => {
      this.handleCustomEvent('topic_update', event);
    });

    this.eventSource.addEventListener('ai_response', (event) => {
      this.handleCustomEvent('ai_response', event);
    });
  }

  private handleCustomEvent(eventType: string, event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      const sseEvent: SSEEvent = {
        id: event.lastEventId,
        event: eventType,
        data,
      };

      if (this.handlers.onMessage) {
        this.handlers.onMessage(sseEvent);
      }
    } catch (error) {
      console.error(`Failed to parse ${eventType} event:`, error);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      if (this.handlers.onReconnectFailed) {
        this.handlers.onReconnectFailed();
      }
      return;
    }

    this.reconnectAttempts++;
    
    if (this.handlers.onReconnect) {
      this.handlers.onReconnect(this.reconnectAttempts);
    }

    setTimeout(() => {
      if (this.shouldReconnect) {
        console.log(`Reconnecting (attempt ${this.reconnectAttempts})`);
        this.establishConnection();
      }
    }, this.reconnectInterval);
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(eventType: string, handler: (data: any) => void): () => void {
    if (!this.eventSource) {
      throw new Error('Not connected. Call connect() first.');
    }

    const eventHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        handler(data);
      } catch (error) {
        console.error(`Failed to parse ${eventType} event:`, error);
      }
    };

    this.eventSource.addEventListener(eventType, eventHandler);

    // Return unsubscribe function
    return () => {
      if (this.eventSource) {
        this.eventSource.removeEventListener(eventType, eventHandler);
      }
    };
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnected = false;
    
    if (this.handlers.onClose) {
      this.handlers.onClose();
    }
  }

  /**
   * Get connection status
   */
  getConnectionState(): {
    connected: boolean;
    readyState: number | null;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      readyState: this.eventSource?.readyState || null,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Check if currently connected
   */
  isConnectedToStream(): boolean {
    return this.isConnected && this.eventSource?.readyState === EventSource.OPEN;
  }

  // High-level convenience methods

  /**
   * Simple notification subscription
   */
  onNotifications(handler: (notification: any) => void): () => void {
    return this.subscribe('notification', handler);
  }

  /**
   * Subscribe to datasource updates
   */
  onDatasourceUpdates(handler: (update: any) => void): () => void {
    return this.subscribe('datasource_update', handler);
  }

  /**
   * Subscribe to topic updates  
   */
  onTopicUpdates(handler: (update: any) => void): () => void {
    return this.subscribe('topic_update', handler);
  }

  /**
   * Subscribe to AI responses
   */
  onAIResponses(handler: (response: any) => void): () => void {
    return this.subscribe('ai_response', handler);
  }

  /**
   * Subscribe to all events with filtering
   */
  onAllEvents(
    filter: (eventType: string, data: any) => boolean,
    handler: (eventType: string, data: any) => void
  ): () => void {
    const originalHandler = this.handlers.onMessage;
    
    this.handlers.onMessage = (eventData: any) => {
      // Call original handler first
      if (originalHandler) {
        originalHandler(eventData);
      }

      // Apply custom filter and handler
      if (eventData.event && filter(eventData.event, eventData.data)) {
        handler(eventData.event, eventData.data);
      }
    };

    // Return cleanup function
    return () => {
      this.handlers.onMessage = originalHandler;
    };
  }

  /**
   * Auto-reconnect with exponential backoff
   */
  enableAutoReconnect(
    initialInterval: number = 1000,
    maxInterval: number = 30000,
    maxAttempts: number = 10
  ): void {
    this.shouldReconnect = true;
    this.maxReconnectAttempts = maxAttempts;
    
    let currentInterval = initialInterval;
    
    const originalReconnect = this.handlers.onReconnect;
    this.handlers.onReconnect = (attempt: number) => {
      if (originalReconnect) {
        originalReconnect(attempt);
      }

      // Exponential backoff
      currentInterval = Math.min(currentInterval * 1.5, maxInterval);
      this.reconnectInterval = currentInterval;
    };

    // Reset interval on successful connection
    const originalOpen = this.handlers.onOpen;
    this.handlers.onOpen = () => {
      if (originalOpen) {
        originalOpen();
      }
      currentInterval = initialInterval;
      this.reconnectInterval = currentInterval;
    };
  }
}