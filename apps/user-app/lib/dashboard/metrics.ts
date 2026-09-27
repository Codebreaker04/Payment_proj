import type { Transaction } from "@/lib/api";

import { directionOf } from "./transactions";

export interface PeriodTotals {
  inflow: number;
  outflow: number;
}

export function sumWindow(
  transactions: Transaction[],
  walletId: string | undefined,
  fromMsAgo: number,
  toMsAgo: number,
): PeriodTotals {
  const now = Date.now();
  const totals: PeriodTotals = { inflow: 0, outflow: 0 };

  for (const transaction of transactions) {
    // Failed transfers never moved money.
    if (transaction.status === "Failed") continue;

    const age = now - new Date(transaction.createdAt).getTime();
    if (age < fromMsAgo || age >= toMsAgo) continue;

    const direction = directionOf(transaction, walletId);
    if (direction === "in") totals.inflow += transaction.amount;
    if (direction === "out") totals.outflow += transaction.amount;
  }

  return totals;
}

/** Percentage change, or null when there is no prior period to compare with. */
export function changeFromPrevious(current: number, previous: number) {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}