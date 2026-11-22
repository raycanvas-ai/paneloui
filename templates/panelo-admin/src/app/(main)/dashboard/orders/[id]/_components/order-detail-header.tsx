import Link from "next/link";

import { format, parseISO } from "date-fns";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { FulfillmentBadge, PaymentBadge } from "../../_components/order-badges";
import type { Order } from "../../_components/orders-data";
import { OrderActions } from "./order-actions";

export function OrderDetailHeader({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/orders">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="tabular-nums">#{order.number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-medium text-2xl tabular-nums leading-tight tracking-tight sm:text-3xl sm:leading-none">
              Order #{order.number}
            </h1>
            <PaymentBadge status={order.status} />
            <FulfillmentBadge status={order.status} />
          </div>
          <p className="text-muted-foreground text-sm tabular-nums">
            Placed {format(parseISO(order.placedAt), "d MMMM yyyy 'at' h:mm a")} via {order.channel}
          </p>
        </div>

        <OrderActions number={order.number} status={order.status} />
      </div>
    </div>
  );
}
