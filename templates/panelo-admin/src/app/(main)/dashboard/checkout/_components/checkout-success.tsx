import Link from "next/link";

import { CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { formatMoney } from "../../products/_components/products-data";
import type { CheckoutValues, deliveryOptions } from "./checkout-data";

export function CheckoutSuccess({
  values,
  total,
  delivery,
}: {
  values: CheckoutValues;
  total: number;
  delivery: (typeof deliveryOptions)[number];
}) {
  const rows = [
    { label: "Order number", value: "#1058" },
    { label: "Delivery", value: `${delivery.label} · ${delivery.eta}` },
    { label: "Shipping to", value: `${values.address}, ${values.city}` },
    {
      label: "Charged",
      value: `${formatMoney(total)} to card ending ${values.cardNumber.replace(/\s/g, "").slice(-4)}`,
    },
  ];

  return (
    <Card className="mx-auto w-full max-w-lg">
      {/* A rare, once-per-order moment: stage the confirmation in semantic chunks. */}
      <CardContent className="flex flex-col items-center gap-6 py-6 text-center" role="status">
        <div className="grid size-12 animate-stage place-items-center rounded-full bg-success/10 text-success stage-0">
          <CircleCheck className="size-6" />
        </div>

        <div className="flex animate-stage flex-col gap-1.5 stage-1">
          <h2 className="font-medium text-xl tracking-tight">Thanks, {values.firstName}. Your order is confirmed.</h2>
          <p className="text-muted-foreground text-sm">
            A receipt is on its way to <span className="text-foreground">{values.email}</span>. Tracking details follow
            as soon as the parcel ships.
          </p>
        </div>

        {/* Concentric radius: rounded-lg (10px) panel, p-1 (4px), rounded-sm (6px) rows. */}
        <dl className="flex w-full animate-stage flex-col rounded-lg bg-muted/60 p-1 text-left text-sm stage-2">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 rounded-sm px-2.5 py-2 odd:bg-background/60">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex w-full animate-stage flex-col gap-2 stage-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/dashboard/orders">Go to orders</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/products">Keep shopping</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
