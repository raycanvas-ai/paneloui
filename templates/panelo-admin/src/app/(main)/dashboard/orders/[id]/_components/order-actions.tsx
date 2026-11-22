"use client";

import { PackageCheck, Printer, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

import type { OrderStatus } from "../../_components/orders-data";

export function OrderActions({ number, status }: { number: number; status: OrderStatus }) {
  const canRefund = status === "paid" || status === "fulfilled";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => toast.success(`Packing slip for #${number} sent to printer`)}>
        <Printer data-icon="inline-start" />
        Print
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={!canRefund}
        title={canRefund ? undefined : "Only captured payments can be refunded"}
        onClick={() =>
          toast(`Refund started for #${number}`, { description: "The customer will be emailed a receipt." })
        }
      >
        <Undo2 data-icon="inline-start" />
        Refund
      </Button>
      {status === "paid" && (
        <Button size="sm" onClick={() => toast.success(`#${number} marked as fulfilled`)}>
          <PackageCheck data-icon="inline-start" />
          Fulfill items
        </Button>
      )}
    </div>
  );
}
