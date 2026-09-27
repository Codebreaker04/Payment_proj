"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { cn } from "@repo/ui/lib/utils";
import type { Transaction } from "@/lib/api";

import { MAX_PAGES, PAGE_SIZE, RECENT_TRANSACTIONS } from "@/lib/dashboard/constants";

import { TransactionRow } from "./transaction-row";

export function TransactionsTable({
  transactions,
  walletId,
  formatCurrency,
  historyTruncated,
  refreshing,
  onRefresh,
}: {
  transactions: Transaction[];
  walletId: string | undefined;
  formatCurrency: (value: number) => string;
  historyTruncated: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (statusFilter !== "All" && transaction.status !== statusFilter) {
        return false;
      }
      if (!query) return true;

      return [
        transaction.referenceId,
        transaction.id,
        transaction.description ?? "",
        transaction.type,
        transaction.status,
        transaction.amount.toString(),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [transactions, search, statusFilter]);

  const statuses = useMemo(
    () => ["All", ...new Set(transactions.map((tx) => tx.status))],
    [transactions],
  );

  const hasFilters = search.trim() !== "" || statusFilter !== "All";

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='text-lg'>Recent Transactions</CardTitle>
        <CardDescription>
          {hasFilters
            ? `${filtered.length} of ${transactions.length} transactions`
            : "Your latest activity"}
        </CardDescription>
        <CardAction className='flex flex-wrap items-center gap-2 max-sm:col-span-2 max-sm:col-start-1 max-sm:row-span-1 max-sm:row-start-3 max-sm:w-full max-sm:justify-self-stretch'>
          <div className='relative w-full sm:w-56'>
            <Search className='pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search transactions...'
              aria-label='Search transactions'
              className='pl-8 md:text-base'
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label='Filter by status'
            className='h-8 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All statuses" : status}
              </option>
            ))}
          </select>
          <Button variant='outline' onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={cn(refreshing && "animate-spin")} />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='px-0'>
        <Table className='text-base'>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='px-4 text-muted-foreground font-medium'>
                Transaction
              </TableHead>
              <TableHead className='px-4 text-muted-foreground font-medium'>
                Counterparty
              </TableHead>
              <TableHead className='px-4 text-right text-muted-foreground font-medium'>
                Amount
              </TableHead>
              <TableHead className='px-4 text-muted-foreground font-medium'>
                Status
              </TableHead>
              <TableHead className='px-4 text-muted-foreground font-medium'>
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className='hover:bg-transparent'>
                <TableCell
                  colSpan={5}
                  className='px-4 py-10 text-center text-muted-foreground'
                >
                  {transactions.length === 0
                    ? "No transactions yet. Send your first transfer to see it here."
                    : "No transactions match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.slice(0, RECENT_TRANSACTIONS).map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  walletId={walletId}
                  formatCurrency={formatCurrency}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {(filtered.length > RECENT_TRANSACTIONS || historyTruncated) && (
        <CardFooter className='justify-between text-sm text-muted-foreground'>
          <span>
            {filtered.length > RECENT_TRANSACTIONS
              ? `Showing ${RECENT_TRANSACTIONS} of ${filtered.length} matching transactions`
              : "Showing all matching transactions"}
          </span>
          {historyTruncated && (
            <span>
              Loaded the most recent{" "}
              {(MAX_PAGES * PAGE_SIZE).toLocaleString()} transactions; older
              activity is not counted in the totals above.
            </span>
          )}
        </CardFooter>
      )}
    </Card>
  );
}