import { api, type Transaction } from "@/lib/api";

import { HISTORY_WINDOW_MS, MAX_PAGES, PAGE_SIZE } from "./constants";

export type Direction = "in" | "out" | "unknown";

/**
 * Transactions carry wallet ids, not user ids, so direction can only be
 * derived once the wallet id is known (it comes back on both wallet calls).
 */
export function directionOf(transaction: Transaction, walletId?: string): Direction {
  if (!walletId) return "unknown";
  if (transaction.receiverId === walletId) return "in";
  if (transaction.senderId === walletId) return "out";
  return "unknown";
}

export function signedAmount(transaction: Transaction, direction: Direction) {
  return direction === "out" ? -transaction.amount : transaction.amount;
}

export function truncateId(id: string | null) {
  if (!id) return "—";
  return `…${id.slice(-8)}`;
}

export interface TransactionWindow {
  transactions: Transaction[];
  walletId?: string;
  /** True when MAX_PAGES was reached before the window was covered. */
  truncated: boolean;
}

/**
 * Fetch transactions until the rows are older than the metric window, so the
 * 30/60-day totals are not computed from a single truncated page.
 * The endpoint returns newest-first, so page N is strictly older than page N-1.
 */
export async function fetchTransactionWindow(
  userId: string,
  token?: string,
): Promise<TransactionWindow> {
  const transactions: Transaction[] = [];
  let walletId: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const response = await api.getTransactions(
      userId,
      PAGE_SIZE,
      page * PAGE_SIZE,
      token,
    );
    walletId ??= response.walletId;

    const batch = response.transactions;
    transactions.push(...batch);

    // A short page means there is no more history at all.
    if (batch.length < PAGE_SIZE) {
      return { transactions, walletId, truncated: false };
    }

    const oldest = batch[batch.length - 1];
    if (
      oldest &&
      Date.now() - new Date(oldest.createdAt).getTime() >= HISTORY_WINDOW_MS
    ) {
      // Everything older than the window can no longer affect the metrics.
      return { transactions, walletId, truncated: false };
    }
  }

  return { transactions, walletId, truncated: true };
}