import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { StockLabel } from "../../_components/product-visuals";
import { formatMoney, getVariants, type Product } from "../../_components/products-data";

export function ProductVariants({ product }: { product: Product }) {
  const variants = getVariants(product);

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="font-normal">Variants</CardTitle>
        <CardDescription>
          {variants.length} {product.category === "Apparel" ? "sizes" : "colors"} · priced at{" "}
          <span className="tabular-nums">{formatMoney(product.price)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="pr-4 text-right">Inventory</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.sku}>
                <TableCell className="pl-4 font-medium">{variant.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs">{variant.sku}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMoney(product.price)}</TableCell>
                <TableCell className="pr-4 text-right">
                  <StockLabel stock={variant.stock} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
