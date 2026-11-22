import Link from "next/link";

import { cn } from "cn";
import { Trophy } from "lucide-react";

import { PANEL, PanelHead, PanelLink } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { ProductThumb } from "@/app/(main)/dashboard/products/_components/product-visuals";
import { formatMoney } from "@/app/(main)/dashboard/products/_components/products-data";

import { bestSellers } from "./store-data";

const top = bestSellers[0]?.revenue ?? 1;

export function BestSellers() {
  return (
    <div className={cn(PANEL, "flex flex-col gap-3 p-4 sm:p-5")}>
      <PanelHead icon={<Trophy className="size-4 text-muted-foreground" strokeWidth={1.8} />} title="Best sellers">
        <PanelLink href="/dashboard/products" label="Open products" />
      </PanelHead>

      <ol className="-mx-2 flex flex-col">
        {bestSellers.map(({ product, units, revenue }) => (
          <li key={product.id}>
            <Link
              href={`/dashboard/products/${product.id}`}
              className="flex items-center gap-3 rounded-lg px-2 py-2 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <ProductThumb product={product} className="size-9" iconClassName="size-4" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate">{product.name}</span>
                  <span className="shrink-0 font-medium tabular-nums">{formatMoney(revenue)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-muted">
                    <div
                      className="h-1 rounded-full bg-[var(--tone-primary)]"
                      style={{ width: `${(revenue / top) * 100}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-muted-foreground text-xs tabular-nums">{units} sold</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
