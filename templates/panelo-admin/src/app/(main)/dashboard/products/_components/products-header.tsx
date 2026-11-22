import { Download, Package, Plus, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getStockLevel, products } from "./products-data";

export function ProductsHeader() {
  const lowStock = products.filter((product) => getStockLevel(product.stock) === "low").length;
  const outOfStock = products.filter((product) => getStockLevel(product.stock) === "out").length;
  const activeCount = products.filter((product) => product.status === "active").length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage your catalog, pricing, and stock across every sales channel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline">
            <Upload data-icon="inline-start" />
            Import
          </Button>
          <Button size="sm" variant="outline">
            <Download data-icon="inline-start" />
            Export
          </Button>
          <Button size="sm">
            <Plus data-icon="inline-start" />
            Add product
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5 tabular-nums">
          <Package />
          {products.length} Products
        </Badge>
        <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5 tabular-nums">
          <span className="size-2 rounded-full bg-success-solid" />
          {activeCount} Active
        </Badge>
        <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5 tabular-nums">
          <span className="size-2 rounded-full bg-warning-solid" />
          {lowStock} Low stock
        </Badge>
        <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5 tabular-nums">
          <span className="size-2 rounded-full bg-destructive" />
          {outOfStock} Out of stock
        </Badge>
      </div>
    </div>
  );
}
