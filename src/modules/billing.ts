import { BaseClient } from '../client/base';
import {
  BillingHistory,
  Subscription,
  AuthConfig,
} from '../types';

export class BillingClient extends BaseClient {
  constructor(config: AuthConfig) {
    super(config);
  }

  /**
   * Get billing history for workspace
   */
  async getHistoryForWorkspace(workspaceId: string): Promise<BillingHistory[]> {
    return this.post<BillingHistory[]>('/api/billing/list', {
      organizationId: workspaceId,
    });
  }

  // Stripe Subscriptions

  /**
   * Get current subscription details
   */
  async getSubscription(): Promise<Subscription> {
    return this.get<Subscription>('/api/stripe/subscriptions/get');
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    planId: string,
    workspaceId: string
  ): Promise<{
    subscription: Subscription;
    clientSecret?: string;
    checkoutUrl?: string;
  }> {
    return this.post('/api/stripe/subscriptions/new', {
      planId,
      organizationId: workspaceId,
    });
  }

  /**
   * Cancel subscription at the end of current period
   */
  async cancelSubscriptionAtPeriodEnd(subscriptionId: string): Promise<{
    subscription: Subscription;
    message: string;
  }> {
    return this.post('/api/stripe/subscriptions/cancel-at-end', {
      subscriptionId,
    });
  }

  /**
   * Resume a cancelled subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<{
    subscription: Subscription;
    message: string;
  }> {
    return this.post('/api/stripe/subscriptions/resume', {
      subscriptionId,
    });
  }

  /**
   * Create checkout session for token purchase
   */
  async createTokenCheckout(
    workspaceId: string,
    tokenPackageId: string,
    quantity: number = 1
  ): Promise<{
    checkoutUrl: string;
    sessionId: string;
  }> {
    return this.post('/api/stripe/tokens-checkout', {
      organizationId: workspaceId,
      tokenPackageId,
      quantity,
    });
  }

  /**
   * Create alternative subscription (different endpoint)
   */
  async createAlternativeSubscription(
    workspaceId: string,
    planId: string
  ): Promise<{
    subscription: Subscription;
    paymentUrl?: string;
  }> {
    return this.post('/api/subscriptions/new', {
      organizationId: workspaceId,
      planId,
    });
  }

  // Utility methods

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(): Promise<{
    hasActiveSubscription: boolean;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  }> {
    try {
      const subscription = await this.getSubscription();
      
      return {
        hasActiveSubscription: subscription.status === 'ACTIVE',
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      };
    } catch (error) {
      return {
        hasActiveSubscription: false,
        status: 'NONE',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
  }

  /**
   * Get recent billing activity
   */
  async getRecentActivity(
    workspaceId: string,
    days: number = 30
  ): Promise<BillingHistory[]> {
    const allHistory = await this.getHistoryForWorkspace(workspaceId);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return allHistory.filter(item => 
      new Date(item.createdAt) >= cutoffDate
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Calculate total spending
   */
  async getTotalSpending(
    workspaceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalAmount: number;
    currency: string;
    transactionCount: number;
    byStatus: Record<string, { amount: number; count: number }>;
  }> {
    const history = await this.getHistoryForWorkspace(workspaceId);
    
    let filteredHistory = history;
    
    if (startDate) {
      filteredHistory = filteredHistory.filter(item => 
        new Date(item.createdAt) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filteredHistory = filteredHistory.filter(item => 
        new Date(item.createdAt) <= new Date(endDate)
      );
    }

    const totalAmount = filteredHistory.reduce((sum, item) => sum + item.amount, 0);
    const currency = filteredHistory[0]?.currency || 'USD';
    
    const byStatus: Record<string, { amount: number; count: number }> = {};
    
    filteredHistory.forEach(item => {
      if (!byStatus[item.status]) {
        byStatus[item.status] = { amount: 0, count: 0 };
      }
      byStatus[item.status].amount += item.amount;
      byStatus[item.status].count += 1;
    });

    return {
      totalAmount,
      currency,
      transactionCount: filteredHistory.length,
      byStatus,
    };
  }

  /**
   * Get monthly spending summary
   */
  async getMonthlySpending(
    workspaceId: string,
    year?: number,
    month?: number
  ): Promise<{
    totalAmount: number;
    currency: string;
    transactionCount: number;
    dailyBreakdown: Array<{
      date: string;
      amount: number;
      transactionCount: number;
    }>;
  }> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const history = await this.getHistoryForWorkspace(workspaceId);
    
    const monthlyHistory = history.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });

    const totalAmount = monthlyHistory.reduce((sum, item) => sum + item.amount, 0);
    const currency = monthlyHistory[0]?.currency || 'USD';

    // Group by day
    const dailyMap: Record<string, { amount: number; count: number }> = {};
    
    monthlyHistory.forEach(item => {
      const dateKey = item.createdAt.split('T')[0]; // YYYY-MM-DD
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { amount: 0, count: 0 };
      }
      dailyMap[dateKey].amount += item.amount;
      dailyMap[dateKey].count += 1;
    });

    const dailyBreakdown = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        amount: data.amount,
        transactionCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalAmount,
      currency,
      transactionCount: monthlyHistory.length,
      dailyBreakdown,
    };
  }

  /**
   * Check if subscription needs attention (expired, past due, etc.)
   */
  async needsAttention(): Promise<{
    needsAttention: boolean;
    issues: string[];
    subscription?: Subscription;
  }> {
    try {
      const subscription = await this.getSubscription();
      const issues: string[] = [];

      if (subscription.status === 'PAST_DUE') {
        issues.push('Subscription payment is past due');
      }

      if (subscription.status === 'UNPAID') {
        issues.push('Subscription has unpaid invoices');
      }

      if (subscription.cancelAtPeriodEnd) {
        const periodEnd = new Date(subscription.currentPeriodEnd);
        const now = new Date();
        const daysUntilEnd = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilEnd <= 7) {
          issues.push(`Subscription will cancel in ${daysUntilEnd} days`);
        }
      }

      return {
        needsAttention: issues.length > 0,
        issues,
        subscription,
      };
    } catch (error) {
      return {
        needsAttention: true,
        issues: ['Unable to retrieve subscription information'],
      };
    }
  }
}