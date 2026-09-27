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
  /** Wallet the balance belongs to — matches Transaction.senderId/receiverId. */
  walletId?: string;
  currency?: string;
  balance: number;
}

export interface TransactionListResponse {
  success: boolean;
  walletId?: string;
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

/**
 * Prisma `Decimal` columns reach the browser as strings (`"120.50"`) even
 * though the contracts declare them as numbers. Coerce on the way in so the
 * rest of the app can do arithmetic and `toLocaleString()` on `amount`.
 */
function toAmount(value: unknown): number {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0;
}

function withNumericAmount(transaction: Transaction): Transaction {
  return { ...transaction, amount: toAmount(transaction.amount) };
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
    token?: string,
  ): Promise<TransactionListResponse> {
    const response = await this.request<TransactionListResponse>(
      `/wallet/transactions/${userId}?limit=${limit}&offset=${offset}`,
      undefined,
      token,
    );

    return {
      ...response,
      transactions: Array.isArray(response.transactions)
        ? response.transactions.map(withNumericAmount)
        : [],
    };
  }

  async sendP2PTransaction(
    data: {
      senderUserId: string;
      receiverUserId: string;
      amount: number;
      description?: string;
      idempotencyKey: string;
    },
    token?: string,
  ): Promise<TransactionResponse> {
    const response = await this.request<TransactionResponse>(
      '/transaction/transfer',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token,
    );

    return {
      ...response,
      transaction: response.transaction
        ? withNumericAmount(response.transaction)
        : response.transaction,
    };
  }

  async getTransactionById(
    id: string,
    token?: string,
  ): Promise<{ success: boolean; transaction: Transaction }> {
    const response = await this.request<{
      success: boolean;
      transaction: Transaction;
    }>(`/webhook/transaction/${id}`, undefined, token);

    return {
      ...response,
      transaction: response.transaction
        ? withNumericAmount(response.transaction)
        : response.transaction,
    };
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

