export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Transaction {
  id: string;
  referenceId: string;
  senderId: string | null;
  receiverId: string | null;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  success: boolean;
  balance: number;
}

export interface TransactionListResponse {
  success: boolean;
  count: number;
  transactions: Transaction[];
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  transaction: Transaction;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  language: string;
  currency: string;
  emailNotifications: boolean;
  transactionAlerts: boolean;
  twoFactorEnabled: boolean;
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    token?: string,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
      } | null;
      throw new Error(
        error?.message ??
          error?.error ??
          `${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as T;
  }

  async getBalance(userId: string, token?: string): Promise<WalletBalance> {
    return this.request<WalletBalance>(
      `/wallet/balance/${userId}`,
      undefined,
      token,
    );
  }

  async getTransactions(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<TransactionListResponse> {
    return this.request<TransactionListResponse>(
      `/wallet/transactions/${userId}?limit=${limit}&offset=${offset}`,
    );
  }

  async sendP2PTransaction(data: {
    senderUserId: string;
    receiverUserId: string;
    amount: number;
    description?: string;
    idempotencyKey: string;
  }): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/transaction/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactionById(
    id: string,
  ): Promise<{ success: boolean; transaction: Transaction }> {
    return this.request<{ success: boolean; transaction: Transaction }>(
      `/webhook/transaction/${id}`,
    );
  }

  async getProfile(
    userId: string,
  ): Promise<{ success: boolean; profile: UserProfile }> {
    return this.request<{ success: boolean; profile: UserProfile }>(
      `/user/profile/${userId}`,
    );
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string; phone?: string },
  ): Promise<{ success: boolean; profile: UserProfile }> {
    return this.request<{ success: boolean; profile: UserProfile }>(
      `/user/profile/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  }

  async getSettings(
    userId: string,
  ): Promise<{ success: boolean; settings: UserSettings }> {
    return this.request<{ success: boolean; settings: UserSettings }>(
      `/user/settings/${userId}`,
    );
  }

  async updateSettings(
    userId: string,
    data: Partial<UserSettings>,
  ): Promise<{ success: boolean; settings: UserSettings }> {
    return this.request<{ success: boolean; settings: UserSettings }>(
      `/user/settings/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
  }
}

export const api = new ApiClient();

