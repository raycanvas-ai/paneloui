import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CheckoutFlow } from "./_components/checkout-flow";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">Checkout</h1>
          <p className="text-muted-foreground text-sm">Confirm delivery details and pay for the items in your cart.</p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft data-icon="inline-start" />
            Back to products
          </Link>
        </Button>
      </div>

      <CheckoutFlow />
    </div>
  );
}
