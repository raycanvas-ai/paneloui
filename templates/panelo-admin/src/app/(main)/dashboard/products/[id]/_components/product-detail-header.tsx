import Link from "next/link";

import { Copy, ExternalLink, Pencil } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import { ProductStatusBadge } from "../../_components/product-visuals";
import type { Product } from "../../_components/products-data";
import { CopySkuButton } from "./copy-sku-button";

export function ProductDetailHeader({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
              {product.name}
            </h1>
            <ProductStatusBadge status={product.status} />
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-xs">{product.sku}</span>
            <CopySkuButton sku={product.sku} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={product.status !== "active"}>
            <ExternalLink data-icon="inline-start" />
            View in store
          </Button>
          <Button size="sm" variant="outline">
            <Copy data-icon="inline-start" />
            Duplicate
          </Button>
          <Button size="sm">
            <Pencil data-icon="inline-start" />
            Edit product
          </Button>
        </div>
      </div>
    </div>
  );
}
