"use client";

import { useState } from "react";

import Link from "next/link";

import { format, parseISO } from "date-fns";
import { Eye, MoreHorizontal, Printer, Search, ShoppingCart, Undo2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";

import { formatMoney } from "../../products/_components/products-data";
import { FulfillmentBadge, PaymentBadge } from "./order-badges";
import { getOrderTotals, type Order, type OrderStatus, orders } from "./orders-data";

type StatusFilter = "all" | OrderStatus;

const tabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "refunded", label: "Refunded" },
];

function countFor(status: StatusFilter) {
  return status === "all" ? orders.length : orders.filter((order) => order.status === status).length;
}

export function OrdersTable() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const search = query.trim().toLowerCase().replace(/^#/, "");
  const visible = orders.filter(
    (order) =>
      (status === "all" || order.status === status) &&
      (!search ||
        String(order.number).includes(search) ||
        order.customer.name.toLowerCase().includes(search) ||
        order.customer.email.toLowerCase().includes(search)),
  );

  return (
    <Tabs value={status} onValueChange={(value) => setStatus(value as StatusFilter)} className="gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-none overflow-x-auto">
          <TabsList variant="line">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <span className="text-muted-foreground text-xs tabular-nums">{countFor(tab.value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <InputGroup className="lg:w-72">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search orders"
            placeholder="Search order #, name or email..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
      </div>

      <TabsContent value={status}>
        {visible.length === 0 ? (
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingCart />
                </EmptyMedia>
                <EmptyTitle>No orders found</EmptyTitle>
                <EmptyDescription>
                  Nothing matches &ldquo;{query.trim() || tabs.find((tab) => tab.value === status)?.label}&rdquo;. Check
                  the order number or try another status.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                  }}
                >
                  Show all orders
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        ) : (
          <Card className="gap-0 py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead className="w-12 pr-4">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </TableBody>
            </Table>
            <div className="border-t px-4 py-3 text-muted-foreground text-xs tabular-nums">
              Showing {visible.length} of {orders.length} orders
            </div>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

function OrderRow({ order }: { order: Order }) {
  const totals = getOrderTotals(order);
  const href = `/dashboard/orders/${order.id}`;

  return (
    <TableRow>
      <TableCell className="pl-4">
        <Link
          href={href}
          className="font-medium tabular-nums underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          #{order.number}
        </Link>
      </TableCell>
      <TableCell className="py-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(order.customer.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span>{order.customer.name}</span>
            <span className="text-muted-foreground text-xs">{order.customer.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {format(parseISO(order.placedAt), "d MMM, h:mm a")}
      </TableCell>
      <TableCell className="text-right tabular-nums">{totals.itemCount}</TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        <span className={order.status === "refunded" ? "text-muted-foreground line-through" : undefined}>
          {formatMoney(totals.total)}
        </span>
      </TableCell>
      <TableCell>
        <PaymentBadge status={order.status} />
      </TableCell>
      <TableCell>
        <FulfillmentBadge status={order.status} />
      </TableCell>
      <TableCell className="pr-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for order ${order.number}`}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link href={href}>
                <Eye />
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast.success(`Packing slip for #${order.number} sent to printer`)}>
              <Printer />
              Print packing slip
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={order.status === "pending" || order.status === "refunded"}
              onSelect={() => toast(`Refund started for #${order.number}`)}
            >
              <Undo2 />
              Refund
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
