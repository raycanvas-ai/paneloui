import { formatCurrency } from "@/lib/utils";

export type ProductStatus = "active" | "draft" | "archived";
export type ProductCategory = "Apparel" | "Accessories" | "Home";
export type ProductArt = "shirt" | "bag" | "sprout" | "backpack" | "coffee" | "wallet" | "blanket" | "bed" | "lamp";
export type ProductTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  /** Money is stored in cents so totals never pick up floating-point drift. */
  price: number;
  compareAtPrice?: number;
  cost: number;
  stock: number;
  status: ProductStatus;
  art: ProductArt;
  tone: ProductTone;
  vendor: string;
  updatedAt: string;
  description: string;
}

export interface ProductVariant {
  name: string;
  sku: string;
  stock: number;
}

export const LOW_STOCK_THRESHOLD = 10;

export const products: Product[] = [
  {
    id: "1",
    name: "Linen Overshirt",
    sku: "APP-LIN-001",
    category: "Apparel",
    price: 8800,
    compareAtPrice: 11000,
    cost: 3150,
    stock: 142,
    status: "active",
    art: "shirt",
    tone: "chart-1",
    vendor: "Northfold Studio",
    updatedAt: "2026-09-14T16:20:00",
    description:
      "A boxy overshirt cut from washed European flax linen. Corozo buttons, a single chest pocket and a curved hem that works tucked or loose.",
  },
  {
    id: "2",
    name: "Everyday Tote",
    sku: "ACC-TOT-014",
    category: "Accessories",
    price: 5400,
    cost: 1880,
    stock: 38,
    status: "active",
    art: "bag",
    tone: "chart-2",
    vendor: "Harbor & Pine",
    updatedAt: "2026-09-13T11:05:00",
    description:
      "Heavyweight 16oz organic canvas with vegetable-tanned leather handles and an interior zip pocket sized for a 14-inch laptop.",
  },
  {
    id: "3",
    name: "Ceramic Planter",
    sku: "HOM-CER-203",
    category: "Home",
    price: 3600,
    cost: 1240,
    stock: 7,
    status: "active",
    art: "sprout",
    tone: "chart-4",
    vendor: "Kiln Collective",
    updatedAt: "2026-09-12T09:40:00",
    description:
      "Wheel-thrown stoneware planter with a matte speckled glaze, drainage hole and matching saucer. Each piece varies slightly.",
  },
  {
    id: "4",
    name: "Merino Crew Sweater",
    sku: "APP-MER-022",
    category: "Apparel",
    price: 12000,
    cost: 4600,
    stock: 0,
    status: "active",
    art: "shirt",
    tone: "chart-3",
    vendor: "Northfold Studio",
    updatedAt: "2026-09-11T18:12:00",
    description:
      "Mid-weight 17.5 micron merino in a relaxed crew neck. Temperature regulating, naturally odor resistant and machine washable on wool.",
  },
  {
    id: "5",
    name: "Waxed Canvas Backpack",
    sku: "ACC-BPK-031",
    category: "Accessories",
    price: 14800,
    cost: 5920,
    stock: 64,
    status: "active",
    art: "backpack",
    tone: "chart-5",
    vendor: "Harbor & Pine",
    updatedAt: "2026-09-10T14:30:00",
    description:
      "Water-resistant waxed cotton canvas, a padded laptop sleeve and solid brass hardware. Rewax once a year and it will outlast you.",
  },
  {
    id: "6",
    name: "Stoneware Mug Set",
    sku: "HOM-MUG-118",
    category: "Home",
    price: 4200,
    cost: 1350,
    stock: 211,
    status: "active",
    art: "coffee",
    tone: "chart-2",
    vendor: "Kiln Collective",
    updatedAt: "2026-09-09T08:55:00",
    description:
      "A set of two 12oz mugs in a reactive glaze. Dishwasher and microwave safe, stacks neatly on open shelving.",
  },
  {
    id: "7",
    name: "Organic Cotton Tee",
    sku: "APP-TEE-007",
    category: "Apparel",
    price: 3200,
    cost: 980,
    stock: 5,
    status: "active",
    art: "shirt",
    tone: "chart-4",
    vendor: "Northfold Studio",
    updatedAt: "2026-09-08T12:10:00",
    description:
      "A 220gsm GOTS-certified cotton tee with a tubular body, so there are no side seams to twist after washing.",
  },
  {
    id: "8",
    name: "Leather Card Wallet",
    sku: "ACC-WAL-045",
    category: "Accessories",
    price: 4600,
    cost: 1420,
    stock: 90,
    status: "active",
    art: "wallet",
    tone: "chart-1",
    vendor: "Harbor & Pine",
    updatedAt: "2026-09-06T17:45:00",
    description:
      "Four card slots and a center pocket in full-grain leather that darkens with use. Hand-stitched edges.",
  },
  {
    id: "9",
    name: "Wool Throw Blanket",
    sku: "HOM-THR-062",
    category: "Home",
    price: 13500,
    cost: 5100,
    stock: 0,
    status: "archived",
    art: "blanket",
    tone: "chart-5",
    vendor: "Fernhill Mills",
    updatedAt: "2026-08-29T10:00:00",
    description:
      "Lambswool herringbone throw woven in a family-run mill. Discontinued after the winter collection sold out.",
  },
  {
    id: "10",
    name: "Linen Bedding Set",
    sku: "HOM-BED-090",
    category: "Home",
    price: 21000,
    cost: 8400,
    stock: 23,
    status: "draft",
    art: "bed",
    tone: "chart-3",
    vendor: "Fernhill Mills",
    updatedAt: "2026-09-14T09:15:00",
    description:
      "Stone-washed linen duvet cover and two pillowcases. Draft listing: photography and size chart still in progress.",
  },
  {
    id: "11",
    name: "Relaxed Chino",
    sku: "APP-CHN-015",
    category: "Apparel",
    price: 7800,
    cost: 2900,
    stock: 56,
    status: "active",
    art: "shirt",
    tone: "chart-2",
    vendor: "Northfold Studio",
    updatedAt: "2026-09-05T15:25:00",
    description: "Garment-dyed cotton twill with a relaxed tapered leg and a gusseted crotch for easy movement.",
  },
  {
    id: "12",
    name: "Brass Desk Lamp",
    sku: "HOM-LMP-011",
    category: "Home",
    price: 16500,
    cost: 7200,
    stock: 12,
    status: "draft",
    art: "lamp",
    tone: "chart-4",
    vendor: "Lumen Works",
    updatedAt: "2026-09-13T20:05:00",
    description:
      "Solid brass articulated arm with a dimmable warm LED. Brushed finish that develops a patina over time.",
  },
];

export const productCategories: ProductCategory[] = ["Apparel", "Accessories", "Home"];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function formatMoney(cents: number) {
  return formatCurrency(cents / 100);
}

export function getStockLevel(stock: number) {
  if (stock === 0) return "out" as const;
  if (stock <= LOW_STOCK_THRESHOLD) return "low" as const;
  return "healthy" as const;
}

const variantShare = [0.2, 0.35, 0.3, 0.15];

export function getVariants(product: Product): ProductVariant[] {
  const names =
    product.category === "Apparel" ? ["Small", "Medium", "Large", "X-Large"] : ["Sand", "Charcoal", "Olive", "Clay"];
  const counts = variantShare.map((share) => Math.floor(product.stock * share));
  // Flooring drops units; hand the remainder to the most common variant so the split still sums to total stock.
  counts[1] += product.stock - counts.reduce((sum, count) => sum + count, 0);

  return names.map((name, index) => ({
    name,
    sku: `${product.sku}-${name.slice(0, 2).toUpperCase()}`,
    stock: counts[index],
  }));
}

export function getWeeklySales(product: Product) {
  const seed = Number(product.id);
  const base = product.status === "active" ? 18 + seed * 3 : 4;

  return Array.from({ length: 12 }, (_, index) => ({
    week: `W${index + 26}`,
    units: base + ((seed * 37 + index * 53) % 17),
  }));
}

const reviewPool = [
  {
    author: "Maya Lindqvist",
    rating: 5,
    date: "2026-09-10",
    body: "Quality feels well above the price point. Already ordered a second one as a gift.",
  },
  {
    author: "Daniel Okafor",
    rating: 4,
    date: "2026-09-04",
    body: "Color is slightly darker than the photos, but honestly I like it more in person.",
  },
  {
    author: "Priya Raman",
    rating: 5,
    date: "2026-08-27",
    body: "Arrived two days early and the packaging was completely plastic-free. Lovely touch.",
  },
  {
    author: "Tom Becker",
    rating: 3,
    date: "2026-08-19",
    body: "Good build, but the first one arrived with a scuff. Support swapped it within a day.",
  },
  {
    author: "Lucía Fernández",
    rating: 5,
    date: "2026-08-11",
    body: "Holding up really well after a couple of months of daily use. Would buy again.",
  },
];

export function getReviews(product: Product) {
  const start = Number(product.id) % reviewPool.length;
  return [0, 1, 2].map((offset) => reviewPool[(start + offset) % reviewPool.length]);
}
