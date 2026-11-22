import { Mail, Phone } from "lucide-react";
import { siMastercard, siVisa } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";

import type { Address, Order } from "../../_components/orders-data";

export function OrderCustomerCard({ order }: { order: Order }) {
  const { customer } = order;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Customer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="font-medium text-sm">{customer.name}</span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {customer.orders === 1 ? "First order" : `${customer.orders} orders`}
            </span>
          </div>
          {customer.orders === 1 && <Badge className="ml-auto bg-info/10 text-info">New</Badge>}
        </div>
        <Separator />
        <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm hover:underline">
          <Mail className="size-4 text-muted-foreground" />
          <span className="truncate">{customer.email}</span>
        </a>
        <a
          href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`}
          className="flex items-center gap-2 text-sm hover:underline"
        >
          <Phone className="size-4 text-muted-foreground" />
          <span className="tabular-nums">{customer.phone}</span>
        </a>
      </CardContent>
    </Card>
  );
}

function AddressLines({ address }: { address: Address }) {
  return (
    <address className="text-sm not-italic leading-relaxed">
      {address.line1}
      {address.line2 && <>, {address.line2}</>}
      <br />
      {address.city}, {address.region} {address.postalCode}
      <br />
      {address.country}
    </address>
  );
}

export function OrderAddressCard({ order }: { order: Order }) {
  const pickup = order.shippingMethod === "In-store pickup";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">{pickup ? "Pickup location" : "Shipping address"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <AddressLines address={order.address} />
        <Separator />
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-sm">Billing address</span>
          <span className="text-sm">Same as {pickup ? "store address" : "shipping address"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderPaymentCard({ order }: { order: Order }) {
  const icon = order.card.brand === "Visa" ? siVisa : siMastercard;
  const statusText = {
    pending: "Authorization pending",
    paid: "Captured",
    fulfilled: "Captured",
    refunded: "Refunded in full",
  }[order.status];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Payment</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-12 place-items-center rounded-md border bg-background">
            <SimpleIcon icon={icon} className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm tabular-nums">
              {order.card.brand} ending in {order.card.last4}
            </span>
            <span
              className={
                order.status === "pending"
                  ? "text-warning text-xs"
                  : order.status === "refunded"
                    ? "text-destructive text-xs"
                    : "text-success text-xs"
              }
            >
              {statusText}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Transaction</span>
          <span className="font-mono text-xs">ch_3Q{order.number}Xk9pLm</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Gateway</span>
          <span>Stripe</span>
        </div>
      </CardContent>
    </Card>
  );
}
