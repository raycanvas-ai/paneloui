"use client";

import { useState } from "react";

import { cn } from "cn";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ProductThumb } from "../../_components/product-visuals";
import type { Product, ProductTone } from "../../_components/products-data";

const tones: ProductTone[] = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];
const shots = ["Front", "Back", "Detail", "Styled"];

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const startTone = tones.indexOf(product.tone);
  const toneFor = (index: number) => tones[(startTone + index) % tones.length];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Media</CardTitle>
        <CardDescription>{shots.length} images · first image is used as the storefront thumbnail</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            <ImagePlus data-icon="inline-start" />
            Upload
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="relative">
          <ProductThumb
            product={product}
            tone={toneFor(active)}
            className="aspect-[16/9] size-auto w-full rounded-lg"
            iconClassName="size-16"
          />
          <span className="absolute bottom-2 left-2 rounded-sm bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur-sm">
            {shots[active]}
          </span>
        </div>

        <fieldset className="grid grid-cols-4 gap-2" aria-label="Product images">
          {shots.map((shot, index) => (
            <button
              key={shot}
              type="button"
              aria-label={`Show ${shot.toLowerCase()} image`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
              className={cn(
                "rounded-lg p-0.5 outline-none ring-1 ring-transparent transition-[scale,box-shadow] duration-150 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]",
                active === index ? "ring-2 ring-primary" : "hover:ring-foreground/20",
              )}
            >
              {/* rounded-lg (10px) button with p-0.5 (2px) wraps an 8px (rounded-md) tile. */}
              <ProductThumb
                product={product}
                tone={toneFor(index)}
                className="aspect-square size-auto w-full rounded-md"
                iconClassName="size-6"
              />
            </button>
          ))}
        </fieldset>
      </CardContent>
    </Card>
  );
}
