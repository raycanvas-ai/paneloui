import { z } from "zod";

import type { OrderLine } from "../../orders/_components/orders-data";

export const cart: OrderLine[] = [
  { productId: "1", variant: "Medium", quantity: 1 },
  { productId: "2", variant: "Sand", quantity: 1 },
  { productId: "6", variant: "Charcoal", quantity: 2 },
];

export const deliveryOptions = [
  { id: "standard", label: "Standard", eta: "5–7 business days", price: 0 },
  { id: "express", label: "Express", eta: "2–3 business days", price: 1200 },
  { id: "overnight", label: "Overnight", eta: "Next business day if ordered by 2 PM", price: 2400 },
] as const;

export type DeliveryId = (typeof deliveryOptions)[number]["id"];

export const CHECKOUT_FORM_ID = "checkout-form";

export const PROMO_CODE = "WELCOME10";
export const PROMO_RATE = 0.1;

const EXPIRY_FORMAT = /^(0[1-9]|1[0-2])\/\d{2}$/;

function isFutureExpiry(value: string) {
  // Zod runs every check, so leave malformed input to the format message instead of also flagging it expired.
  if (!EXPIRY_FORMAT.test(value)) return true;
  const [month, year] = value.split("/").map(Number);
  const now = new Date();
  // A card stays valid through the last day of its expiry month.
  return 2000 + year > now.getFullYear() || (2000 + year === now.getFullYear() && month >= now.getMonth() + 1);
}

export const checkoutSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  address: z.string().trim().min(1, "Enter a street address."),
  apartment: z.string(),
  city: z.string().trim().min(1, "Enter a city."),
  region: z.string().trim().min(2, "Enter a state or region."),
  postalCode: z.string().trim().min(3, "Enter a valid postal code."),
  country: z.string(),
  delivery: z.enum(["standard", "express", "overnight"]),
  cardName: z.string().trim().min(1, "Enter the name shown on the card."),
  cardNumber: z
    .string()
    .refine((value) => /^\d{16}$/.test(value.replace(/\s/g, "")), "Enter the 16-digit card number."),
  expiry: z.string().regex(EXPIRY_FORMAT, "Use the MM/YY format.").refine(isFutureExpiry, "This card has expired."),
  cvc: z.string().regex(/^\d{3,4}$/, "Enter the 3 or 4 digit code."),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}
