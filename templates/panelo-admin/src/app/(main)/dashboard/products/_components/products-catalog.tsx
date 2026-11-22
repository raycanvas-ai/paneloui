"use client";

import { useState } from "react";

import Link from "next/link";

import { format, parseISO } from "date-fns";
import {
  Archive,
  Copy,
  LayoutGrid,
  LayoutList,
  ListFilter,
  MoreHorizontal,
  PackageSearch,
  Pencil,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { ProductStatusBadge, ProductThumb, StockLabel } from "./product-visuals";
import { formatMoney, type Product, type ProductStatus, productCategories, products } from "./products-data";

type StatusFilter = "all" | ProductStatus;
type View = "table" | "grid";

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

function countFor(status: StatusFilter) {
  return status === "all" ? products.length : products.filter((product) => product.status === status).length;
}

export function ProductsCatalog() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("table");

  const search = query.trim().toLowerCase();
  const visible = products.filter(
    (product) =>
      (status === "all" || product.status === status) &&
      (category === "all" || product.category === category) &&
      (!search || product.name.toLowerCase().includes(search) || product.sku.toLowerCase().includes(search)),
  );

  function clearFilters() {
    setStatus("all");
    setCategory("all");
    setQuery("");
  }

  return (
    <Tabs value={status} onValueChange={(value) => setStatus(value as StatusFilter)} className="gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-none overflow-x-auto">
          <TabsList variant="line">
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                <span className="text-muted-foreground text-xs tabular-nums">{countFor(tab.value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex items-center gap-2">
          <InputGroup className="lg:w-64">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search products"
              placeholder="Search name or SKU..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={category === "all" ? undefined : "border-primary/40 text-primary"}>
                <ListFilter data-icon="inline-start" />
                {category === "all" ? "Category" : category}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                <DropdownMenuRadioItem value="all">All categories</DropdownMenuRadioItem>
                {productCategories.map((item) => (
                  <DropdownMenuRadioItem key={item} value={item}>
                    {item}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={view}
            onValueChange={(value) => value && setView(value as View)}
            aria-label="Layout"
          >
            <ToggleGroupItem value="table" aria-label="Table view">
              <LayoutList />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <TabsContent value={status}>
        {visible.length === 0 ? (
          <Card>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageSearch />
                </EmptyMedia>
                <EmptyTitle>No products match these filters</EmptyTitle>
                <EmptyDescription>
                  Try a different name or SKU, or widen the status and category filters.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          </Card>
        ) : view === "table" ? (
          <ProductsTable items={visible} />
        ) : (
          <ProductsGrid items={visible} />
        )}
      </TabsContent>
    </Tabs>
  );
}

function ProductActions({ product }: { product: Product }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${product.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/products/${product.id}`}>
            <Pencil />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.success(`Duplicated ${product.name}`)}>
          <Copy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={product.status === "archived"}
          onSelect={() => toast(`${product.name} archived`, { description: "It is hidden from every sales channel." })}
        >
          <Archive />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProductsTable({ items }: { items: Product[] }) {
  return (
    <Card className="gap-0 py-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-12 pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="py-2.5 pl-4">
                <div className="flex items-center gap-3">
                  <ProductThumb product={product} />
                  <div className="flex min-w-0 flex-col">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                    >
                      {product.name}
                    </Link>
                    <span className="text-muted-foreground text-xs">{product.category}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground text-xs">{product.sku}</TableCell>
              <TableCell className="text-right tabular-nums">
                <span className="flex flex-col items-end">
                  {formatMoney(product.price)}
                  {product.compareAtPrice && (
                    <span className="text-muted-foreground text-xs line-through">
                      {formatMoney(product.compareAtPrice)}
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell>
                <StockLabel stock={product.stock} />
              </TableCell>
              <TableCell>
                <ProductStatusBadge status={product.status} />
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {format(parseISO(product.updatedAt), "d MMM yyyy")}
              </TableCell>
              <TableCell className="pr-4 text-right">
                <ProductActions product={product} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function ProductsGrid({ items }: { items: Product[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {items.map((product) => (
        <li key={product.id}>
          {/* Concentric radius: rounded-xl (14px) card with p-2 (8px) holds a rounded-sm (6px) media tile. */}
          <Link
            href={`/dashboard/products/${product.id}`}
            className="flex flex-col gap-3 rounded-xl bg-card p-2 ring-1 ring-foreground/10 outline-none transition-[scale,box-shadow] duration-150 ease-out hover:ring-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]"
          >
            <ProductThumb
              product={product}
              className="aspect-[4/3] size-auto w-full rounded-sm"
              iconClassName="size-10"
            />
            <div className="flex flex-col gap-1.5 px-1.5 pb-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm">{product.name}</span>
                <span className="text-sm tabular-nums">{formatMoney(product.price)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <StockLabel stock={product.stock} className="text-xs" />
                <ProductStatusBadge status={product.status} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
