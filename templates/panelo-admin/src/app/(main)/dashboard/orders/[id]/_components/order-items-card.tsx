import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { ProductThumb } from "../../../products/_components/product-visuals";
import { formatMoney } from "../../../products/_components/products-data";
import { getOrderLines, getOrderTotals, type Order, TAX_RATE } from "../../_components/orders-data";

function SummaryRow({ label, value, muted }: { label: React.ReactNode; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground tabular-nums" : "tabular-nums"}>{value}</span>
    </div>
  );
}

export function OrderItemsCard({ order }: { order: Order }) {
  const lines = getOrderLines(order);
  const totals = getOrderTotals(order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Items</CardTitle>
        <CardDescription className="tabular-nums">
          {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"} · {order.shippingMethod}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col divide-y">
          {lines.map((line) => (
            <li key={`${line.productId}-${line.variant}`} className="flex items-center gap-3 py-3 first:pt-0">
              <ProductThumb product={line.product} className="size-12" />
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/dashboard/products/${line.product.id}`}
                  className="truncate font-medium text-sm underline-offset-4 hover:underline"
                >
                  {line.product.name}
                </Link>
                <span className="text-muted-foreground text-xs">
                  {line.variant} · <span className="font-mono">{line.product.sku}</span>
                </span>
              </div>
              <span className="text-muted-foreground text-sm tabular-nums">
                {formatMoney(line.product.price)} × {line.quantity}
              </span>
              <span className="w-20 text-right font-medium text-sm tabular-nums">{formatMoney(line.total)}</span>
            </li>
          ))}
        </ul>

        {order.note && (
          <p className="rounded-md bg-muted/70 px-2.5 py-2 text-muted-foreground text-sm">
            <span className="text-foreground">Note:</span> {order.note}
          </p>
        )}

        <Separator />

        <div className="flex flex-col gap-2 sm:ml-auto sm:w-72">
          <SummaryRow label="Subtotal" value={formatMoney(totals.subtotal)} />
          {totals.discount > 0 && <SummaryRow label="Discount" value={`−${formatMoney(totals.discount)}`} />}
          <SummaryRow label="Shipping" value={totals.shipping ? formatMoney(totals.shipping) : "Free"} />
          <SummaryRow label={`Tax (${TAX_RATE * 100}%)`} value={formatMoney(totals.tax)} />
          <Separator className="my-1" />
          <div className="flex items-center justify-between gap-4 font-medium">
            <span>Total</span>
            <span className="text-lg tabular-nums">{formatMoney(totals.total)}</span>
          </div>
          {order.status === "refunded" ? (
            <SummaryRow label="Refunded to customer" value={`−${formatMoney(totals.total)}`} />
          ) : (
            <SummaryRow
              label={order.status === "pending" ? "Awaiting payment" : "Paid by customer"}
              value={formatMoney(order.status === "pending" ? 0 : totals.total)}
              muted
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
