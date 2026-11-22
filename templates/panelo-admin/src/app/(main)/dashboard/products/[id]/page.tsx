import { notFound } from "next/navigation";

import { getProduct } from "../_components/products-data";
import { ProductDetailHeader } from "./_components/product-detail-header";
import { ProductGallery } from "./_components/product-gallery";
import {
  ProductInventoryCard,
  ProductOrganizationCard,
  ProductPricingCard,
} from "./_components/product-overview-cards";
import { ProductReviews } from "./_components/product-reviews";
import { ProductSalesChart } from "./_components/product-sales-chart";
import { ProductVariants } from "./_components/product-variants";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-4">
      <ProductDetailHeader product={product} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-7">
          <ProductGallery product={product} />
          <ProductVariants product={product} />
          <ProductSalesChart product={product} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 xl:col-span-5">
          <ProductPricingCard product={product} />
          <ProductInventoryCard product={product} />
          <ProductOrganizationCard product={product} />
          <ProductReviews product={product} />
        </div>
      </div>
    </div>
  );
}
