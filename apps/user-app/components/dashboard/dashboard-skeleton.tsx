"use client";

import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";

export function DashboardSkeleton() {
  return (
    <div>
      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} size='sm'>
            <CardHeader>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-7 w-28' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-48' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className='h-6 w-full' />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}