"use client";

import { useCallback, useEffect, useState } from "react";

import { api, type Transaction, type WalletBalance } from "@/lib/api";

import { fetchTransactionWindow } from "@/lib/dashboard/transactions";

export function useDashboardData({
  userId,
  accessToken,
}: {
  userId: string | undefined;
  accessToken: string | undefined;
}) {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [walletIdFromTransactions, setWalletIdFromTransactions] = useState<
    string | undefined
  >(undefined);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyTruncated, setHistoryTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!userId) return;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const [balanceResponse, transactionsResponse] = await Promise.all([
          api.getBalance(userId, accessToken),
          fetchTransactionWindow(userId, accessToken),
        ]);

        setBalance(balanceResponse);
        setWalletIdFromTransactions(transactionsResponse.walletId);
        setHistoryTruncated(transactionsResponse.truncated);
        setTransactions(transactionsResponse.transactions);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your dashboard data",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, accessToken],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    balance,
    transactions,
    walletId: balance?.walletId ?? walletIdFromTransactions,
    historyTruncated,
    loading,
    refreshing,
    error,
    reload: () => void load(),
    refresh: () => void load({ silent: true }),
  };
}