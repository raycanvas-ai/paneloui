import { Badge } from "@/components/ui/badge";

import type { OrderStatus } from "./orders-data";

const payment: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-warning/25 text-warning" },
  paid: { label: "Paid", className: "border-success/25 text-success" },
  fulfilled: { label: "Paid", className: "border-success/25 text-success" },
  refunded: { label: "Refunded", className: "border-destructive/25 text-destructive" },
};

const fulfillment: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Unfulfilled", className: "border-border text-muted-foreground" },
  paid: { label: "Unfulfilled", className: "border-warning/25 text-warning" },
  fulfilled: { label: "Fulfilled", className: "border-success/25 text-success" },
  refunded: { label: "Cancelled", className: "border-border text-muted-foreground" },
};

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <Badge className={className} variant="outline">
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge {...payment[status]} />;
}

export function FulfillmentBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge {...fulfillment[status]} />;
}
