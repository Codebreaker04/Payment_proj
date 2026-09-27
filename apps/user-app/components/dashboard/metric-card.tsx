"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";

import { PERIOD_DAYS } from "@/lib/dashboard/constants";

export function MetricCard({
  label,
  value,
  subtitle,
  change,
  invertChange = false,
}: {
  label: string;
  value: string;
  subtitle: string;
  change?: number | null;
  invertChange?: boolean;
}) {
  const delta = typeof change === "number" ? change : null;
  const isFlat = delta === 0;
  const isUp = delta !== null && delta >= 0;
  // More money leaving the wallet is not "good", so invert the sentiment.
  const isGood = invertChange ? !isUp : isUp;

  return (
    <Card className='[--card-spacing:--spacing(6)]'>
      <CardContent className='flex flex-col gap-2'>
        <span className='text-sm font-medium text-muted-foreground'>
          {label}
        </span>
        <span className='text-3xl font-semibold tabular-nums'>{value}</span>
        {delta === null ? (
          <span className='text-sm text-muted-foreground'>{subtitle}</span>
        ) : isFlat ? (
          <span className='text-sm text-muted-foreground'>
            No change vs previous {PERIOD_DAYS} days
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm",
              isGood ? "text-success" : "text-destructive",
            )}
          >
            {isUp ? (
              <TrendingUp className='size-4' aria-hidden='true' />
            ) : (
              <TrendingDown className='size-4' aria-hidden='true' />
            )}
            {Math.abs(delta).toFixed(1)}% {isUp ? "increase" : "decrease"} vs
            previous {PERIOD_DAYS} days
          </span>
        )}
      </CardContent>
    </Card>
  );
}