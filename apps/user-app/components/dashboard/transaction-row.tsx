"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Badge } from "@repo/ui/components/badge";
import { TableCell, TableRow } from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/utils";
import type { Transaction } from "@/lib/api";

import { DIRECTION_VARIANTS, STATUS_VARIANTS } from "@/lib/dashboard/badges";
import { dateFormatter } from "@/lib/dashboard/format";
import {
  directionOf,
  signedAmount,
  truncateId,
} from "@/lib/dashboard/transactions";

export function TransactionRow({
  transaction,
  walletId,
  formatCurrency,
}: {
  transaction: Transaction;
  walletId: string | undefined;
  formatCurrency: (value: number) => string;
}) {
  const direction = directionOf(transaction, walletId);
  const amount = signedAmount(transaction, direction);
  const received = direction === "in";
  // Without a wallet id the direction is unknown, so no sign.
  const sign = direction === "in" ? "+" : direction === "out" ? "−" : "";

  return (
    <TableRow key={transaction.id}>
      <TableCell className='px-4 py-3 whitespace-normal'>
        <span className='font-medium text-foreground'>
          {transaction.referenceId}
        </span>
        <span className='block text-sm text-muted-foreground'>
          {transaction.description ?? transaction.type}
        </span>
      </TableCell>
      <TableCell className='px-4 py-3 text-muted-foreground'>
        <Badge
          variant={DIRECTION_VARIANTS[direction]}
          className='font-normal'
        >
          {received ? (
            <ArrowDownLeft aria-hidden='true' />
          ) : (
            <ArrowUpRight aria-hidden='true' />
          )}
          {received ? "Received" : "Sent"}
        </Badge>
        <span className='ml-2 font-mono text-sm'>
          {received
            ? truncateId(transaction.senderId)
            : truncateId(transaction.receiverId)}
        </span>
      </TableCell>
      <TableCell
        className={cn(
          "px-4 py-3 text-right font-medium tabular-nums",
          received ? "text-success" : "text-foreground",
        )}
      >
        {sign}
        {formatCurrency(Math.abs(amount))}
      </TableCell>
      <TableCell className='px-4 py-3'>
        <Badge
          variant={STATUS_VARIANTS[transaction.status] ?? "secondary"}
        >
          {transaction.status}
        </Badge>
      </TableCell>
      <TableCell className='px-4 py-3 text-muted-foreground'>
        {dateFormatter.format(new Date(transaction.createdAt))}
      </TableCell>
    </TableRow>
  );
}