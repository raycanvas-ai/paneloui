import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { OrdersKpis } from "./_components/orders-kpis";
import { OrdersTable } from "./_components/orders-table";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">Orders</h1>
          <p className="text-muted-foreground text-sm">Track payments, fulfillment, and refunds for every order.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline">
            <Download data-icon="inline-start" />
            Export
          </Button>
          <Button size="sm">
            <Plus data-icon="inline-start" />
            Create order
          </Button>
        </div>
      </div>

      <OrdersKpis />
      <OrdersTable />
    </div>
  );
}
