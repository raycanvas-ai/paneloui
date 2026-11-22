import { TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import { StockLabel } from "../../_components/product-visuals";
import { formatMoney, getStockLevel, type Product } from "../../_components/products-data";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right tabular-nums">{children}</span>
    </div>
  );
}

export function ProductPricingCard({ product }: { product: Product }) {
  const profit = product.price - product.cost;
  const margin = Math.round((profit / product.price) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Pricing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl tabular-nums leading-none tracking-tight">{formatMoney(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-muted-foreground text-sm tabular-nums line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          )}
          {product.compareAtPrice && (
            <Badge className="bg-success/10 text-success">
              {Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
            </Badge>
          )}
        </div>
        <Separator />
        <Row label="Cost per item">{formatMoney(product.cost)}</Row>
        <Row label="Profit per item">{formatMoney(profit)}</Row>
        <Row label="Margin">
          <span className={margin >= 50 ? "text-success" : undefined}>{margin}%</span>
        </Row>
      </CardContent>
    </Card>
  );
}

const locations = [
  { name: "Brooklyn warehouse", share: 0.6 },
  { name: "Oakland warehouse", share: 0.3 },
  { name: "SoHo retail store", share: 0.1 },
];

export function ProductInventoryCard({ product }: { product: Product }) {
  const level = getStockLevel(product.stock);
  const counts = locations.map((location) => Math.floor(product.stock * location.share));
  // Flooring drops units; the primary warehouse takes the remainder so rows always add up to total stock.
  counts[0] += product.stock - counts.reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Inventory</CardTitle>
        <CardDescription>
          <StockLabel stock={product.stock} /> across {locations.length} locations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {level !== "healthy" && (
          <div className="flex items-start gap-2 rounded-md bg-warning/10 px-2.5 py-2 text-sm text-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              {level === "out" ? "Sold out. " : "Running low. "}
              <span className="text-foreground">Restock recommended; this item sells about 24 units a week.</span>
            </span>
          </div>
        )}

        {locations.map((location, index) => {
          const units = counts[index];
          const percent = product.stock ? Math.round((units / product.stock) * 100) : 0;

          return (
            <div key={location.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{location.name}</span>
                <span className="text-muted-foreground tabular-nums">{units} units</span>
              </div>
              <Progress value={percent} aria-label={`${location.name}: ${units} units`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

const channels = ["Online Store", "Instagram Shop", "Point of Sale"];

export function ProductOrganizationCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Organization</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Row label="Category">{product.category}</Row>
        <Row label="Vendor">{product.vendor}</Row>
        <Separator />
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm">Sales channels</span>
          <div className="flex flex-wrap gap-1.5">
            {channels.map((channel) => (
              <Badge key={channel} variant="outline">
                {product.status === "active" && <span className="size-1.5 rounded-full bg-success-solid" />}
                {channel}
              </Badge>
            ))}
          </div>
          {product.status !== "active" && (
            <p className="text-muted-foreground text-xs">
              Not published. {product.status === "draft" ? "Publish the draft" : "Restore the product"} to sell it on
              these channels.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
