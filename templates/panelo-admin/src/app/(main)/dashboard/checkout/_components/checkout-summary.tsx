"use client";

import { useState } from "react";

import { cn } from "cn";
import { Lock, TicketPercent, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

import { getOrderLines, type getOrderTotals, TAX_RATE } from "../../orders/_components/orders-data";
import { ProductThumb } from "../../products/_components/product-visuals";
import { formatMoney } from "../../products/_components/products-data";
import { CHECKOUT_FORM_ID, cart, type deliveryOptions, PROMO_CODE, PROMO_RATE } from "./checkout-data";

const lines = getOrderLines({ items: cart });

const iconSwap = "transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const iconHidden = "scale-[0.25] opacity-0 blur-[4px]";

function Row({ label, value, className }: { label: React.ReactNode; value: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function CheckoutSummary({
  totals,
  delivery,
  discountCode,
  onDiscountChange,
  submitting,
}: {
  totals: ReturnType<typeof getOrderTotals>;
  delivery: (typeof deliveryOptions)[number];
  discountCode: string | null;
  onDiscountChange: (code: string | null) => void;
  submitting: boolean;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function applyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim().toUpperCase() === PROMO_CODE) {
      onDiscountChange(PROMO_CODE);
      setCode("");
      setError(null);
    } else {
      setError(code.trim() ? "That code isn't valid or has expired." : "Enter a discount code first.");
    }
  }

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Order summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li key={`${line.productId}-${line.variant}`} className="flex items-center gap-3">
                <div className="relative">
                  <ProductThumb product={line.product} className="size-12" />
                  <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-foreground text-[0.7rem] text-background tabular-nums">
                    <span className="sr-only">Quantity </span>
                    {line.quantity}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-sm">{line.product.name}</span>
                  <span className="text-muted-foreground text-xs">{line.variant}</span>
                </div>
                <span className="text-sm tabular-nums">{formatMoney(line.total)}</span>
              </li>
            ))}
          </ul>

          <Separator />

          {discountCode ? (
            <div className="flex items-center gap-2 rounded-md bg-success/10 py-1 pr-1 pl-2.5 text-sm text-success">
              <TicketPercent className="size-4" />
              <span className="font-medium">{discountCode}</span>
              <span className="tabular-nums">· {PROMO_RATE * 100}% off applied</span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="ml-auto text-success hover:bg-success/10 hover:text-success"
                aria-label="Remove discount code"
                onClick={() => onDiscountChange(null)}
              >
                <X />
              </Button>
            </div>
          ) : (
            <form noValidate onSubmit={applyCode}>
              <Field className="gap-1.5" data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="checkout-promo">Discount code</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="checkout-promo"
                    placeholder={`Try ${PROMO_CODE}`}
                    value={code}
                    aria-invalid={Boolean(error)}
                    onChange={(event) => {
                      setCode(event.target.value);
                      setError(null);
                    }}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton type="submit" variant="secondary">
                      Apply
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {error && <FieldError>{error}</FieldError>}
              </Field>
            </form>
          )}

          <Separator />

          <div className="flex flex-col gap-2">
            <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
            {totals.discount > 0 && (
              <Row label="Discount" value={`−${formatMoney(totals.discount)}`} className="*:last:text-success" />
            )}
            <Row label={`Shipping · ${delivery.label}`} value={delivery.price ? formatMoney(delivery.price) : "Free"} />
            <Row label={`Estimated tax (${TAX_RATE * 100}%)`} value={formatMoney(totals.tax)} />
          </div>

          <Separator />

          <div className="flex items-baseline justify-between gap-4">
            <span className="font-medium">Total</span>
            <span className="text-2xl tabular-nums leading-none tracking-tight">{formatMoney(totals.total)}</span>
          </div>

          <Button type="submit" form={CHECKOUT_FORM_ID} size="lg" className="w-full" disabled={submitting}>
            {/* Both icons stay mounted so the lock and spinner cross-fade instead of popping. */}
            <span className="relative grid size-4 place-items-center">
              <Lock aria-hidden="true" className={cn(iconSwap, submitting && iconHidden)} />
              <Spinner aria-hidden={!submitting} className={cn("absolute", iconSwap, !submitting && iconHidden)} />
            </span>
            {submitting ? "Processing payment…" : `Pay ${formatMoney(totals.total)}`}
          </Button>
          <p className="text-center text-muted-foreground text-xs">
            By placing this order you agree to the terms of sale and return policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
