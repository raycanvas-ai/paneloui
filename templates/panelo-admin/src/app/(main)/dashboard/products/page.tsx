import { ProductsCatalog } from "./_components/products-catalog";
import { ProductsHeader } from "./_components/products-header";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <ProductsHeader />
      <ProductsCatalog />
    </div>
  );
}
