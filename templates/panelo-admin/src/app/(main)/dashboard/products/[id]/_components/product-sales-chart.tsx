"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { formatMoney, getWeeklySales, type Product } from "../../_components/products-data";

const chartConfig = {
  units: { label: "Units sold", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ProductSalesChart({ product }: { product: Product }) {
  const data = getWeeklySales(product);
  const units = data.reduce((sum, week) => sum + week.units, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Sales, last 12 weeks</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {units} units · {formatMoney(units * product.price)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart accessibilityLayer data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />
            <Bar dataKey="units" fill="var(--color-units)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
