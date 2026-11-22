import Link from "next/link";

import { cn } from "cn";
import { format, parseISO } from "date-fns";
import { Package } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { FulfillmentBadge, PaymentBadge } from "@/app/(main)/dashboard/orders/_components/order-badges";
import { ProductThumb } from "@/app/(main)/dashboard/products/_components/product-visuals";
import { formatMoney } from "@/app/(main)/dashboard/products/_components/products-data";

import { pipeline, recentOrders } from "./store-data";

const STAGE_DOT: Record<string, string> = {
  pending: "bg-warning-solid",
  paid: "bg-[var(--tone-primary)]",
  fulfilled: "bg-success-solid",
  refunded: "bg-destructive",
};

export function RecentOrders() {
  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead icon={<Package className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Recent orders">
        <PanelLink href="/dashboard/orders" label="Open all orders" />
      </PanelHead>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {pipeline.map((stage) => (
          <div key={stage.status} className="rounded-lg bg-muted/60 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <span className={cn("size-1.5 rounded-full", STAGE_DOT[stage.status])} />
              {stage.label}
            </p>
            <p className="mt-1 font-semibold text-xl tabular-nums tracking-tight">{stage.count}</p>
          </div>
        ))}
      </div>

      <ul className="-mx-2 flex flex-col">
        {recentOrders.slice(0, 6).map((order) => (
          <li key={order.id}>
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 md:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
            >
              {order.lead ? <ProductThumb product={order.lead} className="size-9" iconClassName="size-4" /> : null}
              <div className="min-w-0">
                <p className="truncate text-sm">
                  <span className="font-medium">#{order.number}</span>
                  <span className="text-muted-foreground"> · {order.customer.name}</span>
                </p>
                <p className="truncate text-muted-foreground text-xs">
                  {order.totals.itemCount} {order.totals.itemCount === 1 ? "item" : "items"} · {order.channel} ·{" "}
                  {format(parseISO(order.placedAt), "MMM d, h:mm a")}
                </p>
              </div>
              <div className="hidden items-center gap-1.5 md:flex">
                <PaymentBadge status={order.status} />
                <FulfillmentBadge status={order.status} />
              </div>
              <span
                className={cn(
                  "text-right font-medium text-sm tabular-nums",
                  order.status === "refunded" && "text-muted-foreground line-through",
                )}
              >
                {formatMoney(order.totals.total)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
