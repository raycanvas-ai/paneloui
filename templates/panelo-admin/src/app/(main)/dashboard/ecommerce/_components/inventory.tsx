import Link from "next/link";

import { cn } from "cn";
import { PackageCheck, TriangleAlert } from "lucide-react";

import { PANEL, PanelHead } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { ProductThumb, StockLabel } from "@/app/(main)/dashboard/products/_components/product-visuals";

import { lowStock } from "./store-data";

export function Inventory() {
  return (
    <div className={cn(PANEL, "flex flex-1 flex-col gap-3 p-4 sm:p-5")}>
      <PanelHead
        icon={<TriangleAlert className="size-4 text-muted-foreground" strokeWidth={1.8} />}
        title="Needs restocking"
      >
        {lowStock.length > 0 ? (
          <span className="mr-1.5 rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning text-xs tabular-nums">
            {lowStock.length}
          </span>
        ) : null}
      </PanelHead>

      {lowStock.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
          <PackageCheck className="size-5 text-success" strokeWidth={1.8} />
          <p className="text-muted-foreground text-sm">Every active product is well stocked.</p>
        </div>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {lowStock.map((product) => (
            <li key={product.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <ProductThumb product={product} className="size-9" iconClassName="size-4" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{product.name}</p>
                <StockLabel stock={product.stock} className="text-xs" />
              </div>
              <Link
                href={`/dashboard/products/${product.id}`}
                className="shrink-0 rounded-full bg-muted px-3 py-1 font-medium text-xs transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                Restock<span className="sr-only"> {product.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
