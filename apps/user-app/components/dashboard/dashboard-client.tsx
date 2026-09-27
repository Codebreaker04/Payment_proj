"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";

import { makeCurrencyFormatter } from "@/lib/dashboard/format";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { ErrorBanner } from "@/components/dashboard/error-banner";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export function DashboardClient() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const accessToken = session?.accessToken;

  const {
    balance,
    transactions,
    walletId,
    historyTruncated,
    loading,
    refreshing,
    error,
    reload,
    refresh,
  } = useDashboardData({ userId, accessToken });

  const formatCurrency = useMemo(
    () => makeCurrencyFormatter(balance?.currency).format,
    [balance?.currency],
  );

  if (status === "loading" || (loading && !balance && !error)) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {error && <ErrorBanner message={error} onRetry={reload} />}

      <MetricsOverview
        balance={balance}
        transactions={transactions}
        walletId={walletId}
        formatCurrency={formatCurrency}
      />

      <TransactionsTable
        transactions={transactions}
        walletId={walletId}
        formatCurrency={formatCurrency}
        historyTruncated={historyTruncated}
        refreshing={refreshing}
        onRefresh={refresh}
      />
    </>
  );
}