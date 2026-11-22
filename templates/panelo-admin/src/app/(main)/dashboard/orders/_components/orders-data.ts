import { addHours, addMinutes, parseISO } from "date-fns";

import { getProduct, type Product } from "../../products/_components/products-data";

/** One lifecycle status per order, so status tabs are exclusive and their counts add up to the total. */
export type OrderStatus = "pending" | "paid" | "fulfilled" | "refunded";

export interface OrderLine {
  productId: string;
  variant: string;
  quantity: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  number: number;
  status: OrderStatus;
  placedAt: string;
  channel: "Online Store" | "Instagram Shop" | "Point of Sale";
  customer: { name: string; email: string; phone: string; orders: number };
  items: OrderLine[];
  /** Cents. */
  discount: number;
  /** Cents. */
  shipping: number;
  shippingMethod: string;
  address: Address;
  card: { brand: "Visa" | "Mastercard"; last4: string };
  note?: string;
}

export const TAX_RATE = 0.08;

export const orders: Order[] = [
  {
    id: "1",
    number: 1057,
    status: "paid",
    placedAt: "2026-09-15T09:42:00",
    channel: "Online Store",
    customer: { name: "Maya Lindqvist", email: "maya.lindqvist@fastmail.com", phone: "+1 (718) 555-0142", orders: 6 },
    items: [
      { productId: "1", variant: "Medium", quantity: 1 },
      { productId: "2", variant: "Sand", quantity: 1 },
      { productId: "6", variant: "Charcoal", quantity: 2 },
    ],
    discount: 1900,
    shipping: 0,
    shippingMethod: "Standard · 5–7 business days",
    address: {
      line1: "214 Kent Avenue",
      line2: "Apt 5C",
      city: "Brooklyn",
      region: "NY",
      postalCode: "11249",
      country: "United States",
    },
    card: { brand: "Visa", last4: "4242" },
    note: "Please leave the parcel with the building concierge.",
  },
  {
    id: "2",
    number: 1056,
    status: "pending",
    placedAt: "2026-09-15T08:15:00",
    channel: "Instagram Shop",
    customer: { name: "Daniel Okafor", email: "d.okafor@gmail.com", phone: "+1 (312) 555-0178", orders: 1 },
    items: [{ productId: "5", variant: "Olive", quantity: 1 }],
    discount: 0,
    shipping: 1200,
    shippingMethod: "Express · 2–3 business days",
    address: {
      line1: "1550 N Damen Ave",
      city: "Chicago",
      region: "IL",
      postalCode: "60622",
      country: "United States",
    },
    card: { brand: "Mastercard", last4: "8810" },
  },
  {
    id: "3",
    number: 1055,
    status: "fulfilled",
    placedAt: "2026-09-14T17:03:00",
    channel: "Online Store",
    customer: { name: "Priya Raman", email: "priya@ramanstudio.co", phone: "+1 (415) 555-0110", orders: 11 },
    items: [
      { productId: "3", variant: "Clay", quantity: 2 },
      { productId: "8", variant: "Charcoal", quantity: 1 },
    ],
    discount: 0,
    shipping: 0,
    shippingMethod: "Standard · 5–7 business days",
    address: {
      line1: "88 Guerrero Street",
      city: "San Francisco",
      region: "CA",
      postalCode: "94103",
      country: "United States",
    },
    card: { brand: "Visa", last4: "1881" },
  },
  {
    id: "4",
    number: 1054,
    status: "refunded",
    placedAt: "2026-09-14T11:26:00",
    channel: "Online Store",
    customer: { name: "Tom Becker", email: "tom.becker@proton.me", phone: "+1 (206) 555-0193", orders: 2 },
    items: [{ productId: "4", variant: "Large", quantity: 1 }],
    discount: 0,
    shipping: 1200,
    shippingMethod: "Express · 2–3 business days",
    address: {
      line1: "401 Pine Street",
      line2: "Unit 12",
      city: "Seattle",
      region: "WA",
      postalCode: "98101",
      country: "United States",
    },
    card: { brand: "Mastercard", last4: "5100" },
    note: "Refunded: item went out of stock before fulfillment.",
  },
  {
    id: "5",
    number: 1053,
    status: "fulfilled",
    placedAt: "2026-09-13T19:48:00",
    channel: "Point of Sale",
    customer: { name: "Lucía Fernández", email: "lucia.fdz@icloud.com", phone: "+1 (212) 555-0126", orders: 4 },
    items: [
      { productId: "11", variant: "Medium", quantity: 1 },
      { productId: "7", variant: "Small", quantity: 3 },
    ],
    discount: 0,
    shipping: 0,
    shippingMethod: "In-store pickup",
    address: {
      line1: "102 Prince Street",
      city: "New York",
      region: "NY",
      postalCode: "10012",
      country: "United States",
    },
    card: { brand: "Visa", last4: "0077" },
  },
  {
    id: "6",
    number: 1052,
    status: "paid",
    placedAt: "2026-09-13T14:09:00",
    channel: "Online Store",
    customer: { name: "Hiro Tanaka", email: "hiro.tanaka@outlook.com", phone: "+1 (503) 555-0164", orders: 3 },
    items: [{ productId: "1", variant: "Large", quantity: 2 }],
    discount: 1760,
    shipping: 0,
    shippingMethod: "Standard · 5–7 business days",
    address: {
      line1: "2231 SE Division Street",
      city: "Portland",
      region: "OR",
      postalCode: "97202",
      country: "United States",
    },
    card: { brand: "Visa", last4: "3056" },
  },
  {
    id: "7",
    number: 1051,
    status: "fulfilled",
    placedAt: "2026-09-12T10:31:00",
    channel: "Instagram Shop",
    customer: { name: "Amara Nwosu", email: "amara.nwosu@gmail.com", phone: "+1 (404) 555-0137", orders: 8 },
    items: [
      { productId: "6", variant: "Sand", quantity: 1 },
      { productId: "3", variant: "Olive", quantity: 1 },
    ],
    discount: 0,
    shipping: 800,
    shippingMethod: "Standard · 5–7 business days",
    address: {
      line1: "675 Ponce De Leon Ave NE",
      city: "Atlanta",
      region: "GA",
      postalCode: "30308",
      country: "United States",
    },
    card: { brand: "Mastercard", last4: "4417" },
  },
  {
    id: "8",
    number: 1050,
    status: "pending",
    placedAt: "2026-09-12T08:57:00",
    channel: "Online Store",
    customer: { name: "Elliot Marsh", email: "elliot@marshandco.com", phone: "+1 (617) 555-0158", orders: 1 },
    items: [{ productId: "8", variant: "Clay", quantity: 2 }],
    discount: 0,
    shipping: 800,
    shippingMethod: "Standard · 5–7 business days",
    address: {
      line1: "59 Charles Street",
      city: "Boston",
      region: "MA",
      postalCode: "02114",
      country: "United States",
    },
    card: { brand: "Visa", last4: "9921" },
  },
  {
    id: "9",
    number: 1049,
    status: "fulfilled",
    placedAt: "2026-09-11T16:22:00",
    channel: "Online Store",
    customer: { name: "Sofia Rossi", email: "sofia.rossi@gmail.com", phone: "+1 (305) 555-0185", orders: 5 },
    items: [
      { productId: "5", variant: "Charcoal", quantity: 1 },
      { productId: "2", variant: "Olive", quantity: 1 },
    ],
    discount: 2020,
    shipping: 0,
    shippingMethod: "Express · 2–3 business days",
    address: {
      line1: "1420 Ocean Drive",
      line2: "Suite 804",
      city: "Miami Beach",
      region: "FL",
      postalCode: "33139",
      country: "United States",
    },
    card: { brand: "Visa", last4: "6620" },
  },
  {
    id: "10",
    number: 1048,
    status: "refunded",
    placedAt: "2026-09-10T13:40:00",
    channel: "Online Store",
    customer: { name: "Owen Fletcher", email: "owen.f@yahoo.com", phone: "+1 (512) 555-0102", orders: 2 },
    items: [{ productId: "7", variant: "X-Large", quantity: 2 }],
    discount: 0,
    shipping: 800,
    shippingMethod: "Standard · 5–7 business days",
    address: { line1: "900 E 6th Street", city: "Austin", region: "TX", postalCode: "78702", country: "United States" },
    card: { brand: "Mastercard", last4: "2290" },
    note: "Refunded: customer returned both tees for a size exchange.",
  },
  {
    id: "11",
    number: 1047,
    status: "fulfilled",
    placedAt: "2026-09-09T09:05:00",
    channel: "Point of Sale",
    customer: { name: "Grace Liu", email: "grace.liu@hey.com", phone: "+1 (646) 555-0119", orders: 14 },
    items: [{ productId: "6", variant: "Olive", quantity: 3 }],
    discount: 0,
    shipping: 0,
    shippingMethod: "In-store pickup",
    address: {
      line1: "102 Prince Street",
      city: "New York",
      region: "NY",
      postalCode: "10012",
      country: "United States",
    },
    card: { brand: "Visa", last4: "7314" },
  },
  {
    id: "12",
    number: 1046,
    status: "paid",
    placedAt: "2026-09-08T18:50:00",
    channel: "Instagram Shop",
    customer: { name: "Jonas Weber", email: "jonas.weber@posteo.de", phone: "+1 (720) 555-0147", orders: 1 },
    items: [
      { productId: "11", variant: "Large", quantity: 1 },
      { productId: "1", variant: "Large", quantity: 1 },
    ],
    discount: 0,
    shipping: 1200,
    shippingMethod: "Express · 2–3 business days",
    address: {
      line1: "3300 Tejon Street",
      city: "Denver",
      region: "CO",
      postalCode: "80211",
      country: "United States",
    },
    card: { brand: "Mastercard", last4: "6038" },
  },
];

export function getOrder(id: string) {
  return orders.find((order) => order.id === id);
}

export type ResolvedOrderLine = OrderLine & { product: Product; total: number };

export function getOrderLines(order: Pick<Order, "items">): ResolvedOrderLine[] {
  return order.items.flatMap((line) => {
    const product = getProduct(line.productId);
    return product ? [{ ...line, product, total: product.price * line.quantity }] : [];
  });
}

export function getOrderTotals(order: Pick<Order, "items" | "discount" | "shipping">) {
  const subtotal = getOrderLines(order).reduce((sum, line) => sum + line.total, 0);
  const tax = Math.round((subtotal - order.discount) * TAX_RATE);
  const total = subtotal - order.discount + order.shipping + tax;
  const itemCount = order.items.reduce((sum, line) => sum + line.quantity, 0);

  return { subtotal, discount: order.discount, shipping: order.shipping, tax, total, itemCount };
}

export type TimelineState = "done" | "current" | "upcoming" | "failed";

export interface TimelineEvent {
  title: string;
  description: string;
  at?: Date;
  state: TimelineState;
}

export function getOrderTimeline(order: Order): TimelineEvent[] {
  const placed = parseISO(order.placedAt);
  const paid = order.status !== "pending";
  const pickup = order.shippingMethod === "In-store pickup";

  const events: TimelineEvent[] = [
    {
      title: "Order placed",
      description: `${order.customer.name} checked out on ${order.channel}.`,
      at: placed,
      state: "done",
    },
    paid
      ? {
          title: "Payment captured",
          description: `${order.card.brand} ending in ${order.card.last4} was charged.`,
          at: addMinutes(placed, 2),
          state: "done",
        }
      : {
          title: "Awaiting payment",
          description: "The card authorization is still pending with the bank.",
          state: "current",
        },
  ];

  if (order.status === "refunded") {
    events.push({
      title: "Refund issued",
      description: order.note ?? "The full amount was returned to the card.",
      at: addHours(placed, 26),
      state: "failed",
    });
    return events;
  }

  if (order.status !== "fulfilled") {
    events.push(
      {
        title: "Ready to ship",
        description: "Pick, pack and print a shipping label.",
        state: paid ? "current" : "upcoming",
      },
      { title: "Delivered", description: "Estimated once the parcel ships.", state: "upcoming" },
    );
    return events;
  }

  if (pickup) {
    events.push({
      title: "Picked up in store",
      description: "Collected at SoHo retail store.",
      at: addMinutes(placed, 5),
      state: "done",
    });
    return events;
  }

  const deliveredAt = addHours(placed, 48);
  const delivered = deliveredAt <= new Date();
  events.push(
    {
      title: "Shipped",
      description: "Handed to UPS · tracking 1Z 999 AA1 01 2345 6784.",
      at: addHours(placed, 6),
      state: "done",
    },
    delivered
      ? { title: "Delivered", description: "Signed for at the delivery address.", at: deliveredAt, state: "done" }
      : { title: "In transit", description: "UPS estimates delivery within two days.", state: "current" },
  );

  return events;
}
