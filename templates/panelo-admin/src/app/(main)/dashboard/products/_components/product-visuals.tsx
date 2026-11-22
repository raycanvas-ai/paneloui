import { cn } from "cn";
import {
  Backpack,
  BedDouble,
  Coffee,
  Handbag,
  Lamp,
  Layers,
  type LucideIcon,
  Shirt,
  Sprout,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { getStockLevel, type Product, type ProductArt, type ProductStatus, type ProductTone } from "./products-data";

const artIcons: Record<ProductArt, LucideIcon> = {
  shirt: Shirt,
  bag: Handbag,
  sprout: Sprout,
  backpack: Backpack,
  coffee: Coffee,
  wallet: Wallet,
  blanket: Layers,
  bed: BedDouble,
  lamp: Lamp,
};

const toneClasses: Record<ProductTone, string> = {
  "chart-1": "bg-chart-1/10 text-chart-1",
  "chart-2": "bg-chart-2/10 text-chart-2",
  "chart-3": "bg-chart-3/10 text-chart-3",
  "chart-4": "bg-chart-4/10 text-chart-4",
  "chart-5": "bg-chart-5/10 text-chart-5",
};

/** Placeholder product art: a token-tinted tile with a neutral image outline, standing in for real photography. */
export function ProductThumb({
  product,
  tone,
  className,
  iconClassName,
}: {
  product: Pick<Product, "art" | "tone">;
  tone?: ProductTone;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = artIcons[product.art];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-md outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
        toneClasses[tone ?? product.tone],
        className,
      )}
    >
      <Icon className={cn("size-5", iconClassName)} strokeWidth={1.5} />
    </div>
  );
}

const statusStyles: Record<ProductStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "border-success/25 text-success" },
  draft: { label: "Draft", className: "border-info/25 text-info" },
  archived: { label: "Archived", className: "border-border text-muted-foreground" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const style = statusStyles[status];

  return (
    <Badge className={style.className} variant="outline">
      <span className="size-1.5 rounded-full bg-current" />
      {style.label}
    </Badge>
  );
}

export function StockLabel({ stock, className }: { stock: number; className?: string }) {
  const level = getStockLevel(stock);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm tabular-nums",
        level === "low" && "text-warning",
        level === "out" && "text-destructive",
        className,
      )}
    >
      {level === "out" ? "Out of stock" : `${stock} in stock`}
      {level === "low" && <span className="text-xs">· Low</span>}
    </span>
  );
}
