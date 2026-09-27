"use client";

import { useMemo } from "react";

import type { Transaction, WalletBalance } from "@/lib/api";
import {
  HISTORY_WINDOW_MS,
  PERIOD_DAYS,
  PERIOD_MS,
} from "@/lib/dashboard/constants";
import { changeFromPrevious, sumWindow } from "@/lib/dashboard/metrics";

import { MetricCard } from "./metric-card";

export function MetricsOverview({
  balance,
  transactions,
  walletId,
  formatCurrency,
}: {
  balance: WalletBalance | null;
  transactions: Transaction[];
  walletId: string | undefined;
  formatCurrency: (value: number) => string;
}) {
  const current = useMemo(
    () => sumWindow(transactions, walletId, 0, PERIOD_MS),
    [transactions, walletId],
  );
  const previous = useMemo(
    () => sumWindow(transactions, walletId, PERIOD_MS, HISTORY_WINDOW_MS),
    [transactions, walletId],
  );

  const netFlow = current.inflow - current.outflow;

  return (
    <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <MetricCard
        label='Total Balance'
        value={balance?.success ? formatCurrency(balance.balance) : "—"}
        subtitle={balance?.success ? "Available now" : "Unavailable"}
      />
      <MetricCard
        label='Money In'
        value={formatCurrency(current.inflow)}
        subtitle={`Last ${PERIOD_DAYS} days`}
        change={changeFromPrevious(current.inflow, previous.inflow)}
      />
      <MetricCard
        label='Money Out'
        value={formatCurrency(current.outflow)}
        subtitle={`Last ${PERIOD_DAYS} days`}
        change={changeFromPrevious(current.outflow, previous.outflow)}
        invertChange
      />
      <MetricCard
        label='Net Flow'
        value={formatCurrency(netFlow)}
        subtitle={`Last ${PERIOD_DAYS} days`}
        change={changeFromPrevious(
          netFlow,
          previous.inflow - previous.outflow,
        )}
      />
    </div>
  );
}