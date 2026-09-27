"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className='mb-6 border-destructive/30 bg-destructive/5 ring-destructive/20'>
      <CardContent className='flex items-center justify-between gap-4 text-sm text-destructive'>
        <span>{message}</span>
        <Button variant='outline' size='sm' onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}