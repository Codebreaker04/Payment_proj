import type { ComponentProps } from "react";

import { Badge } from "@repo/ui/components/badge";

import type { Direction } from "./transactions";

export type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

export const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  Completed: "success",
  Pending: "warning",
  Failed: "destructive",
  Refunded: "secondary",
};

export const DIRECTION_VARIANTS: Record<Direction, BadgeVariant> = {
  in: "success",
  out: "outline",
  unknown: "outline",
};