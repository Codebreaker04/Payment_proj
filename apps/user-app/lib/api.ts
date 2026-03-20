const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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

export interface TransactionResponse {
  success: boolean;
  message: string;
  transaction?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Get wallet balance
  async getBalance(userId: string, token?: string): Promise<WalletBalance> {
    return this.request<WalletBalance>(`/wallet/balance/${userId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }

  // Get transaction history
  async getTransactions(
    userId: string,
    limit = 50,
    offset = 0,
    token?: string,
  ): Promise<{ success: boolean; transactions: Transaction[]; count: number }> {
    return this.request(
      `/wallet/transactions/${userId}?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    );
  }

  // Send P2P transaction
  async sendP2PTransaction(
    data: {
      receiverId: string;
      amount: number;
      description?: string;
      idempotencyKey: string;
    },
    token: string,
  ): Promise<TransactionResponse> {
    return this.request<TransactionResponse>('/webhook/transaction', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        paymentMethod: 'P2P',
        currency: 'USD',
      }),
    });
  }

  // Get transaction by ID
  async getTransactionById(
    id: string,
    token?: string,
  ): Promise<{ success: boolean; transaction: Transaction }> {
    return this.request(`/webhook/transaction/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }

  // Register new user
  async register(data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
  }): Promise<{ success: boolean; user: any }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
