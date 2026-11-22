import { addMonths, addWeeks, parseISO } from "date-fns";

export interface InvoiceItem {
  id: string;
  name: string;
  qty: number;
  taxRate: number;
  amount: number;
}

export interface InvoiceClient {
  id: string;
  name: string;
  email: string;
  address: string;
}

export interface InvoiceCurrency {
  code: string;
  label: string;
  flag: string;
}

export interface InvoiceDiscount {
  id: string;
  label: string;
  amount: number;
}

export type InvoiceMode = "standard" | "split" | "recurring";

export const splitCounts = [2, 3, 4, 6];

export const splitIntervals = [
  { id: "biweekly", label: "Every 2 weeks" },
  { id: "monthly", label: "Monthly" },
] as const;

export const recurringFrequencies = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
] as const;

export interface InvoiceFormValues {
  mode: InvoiceMode;
  fullName: string;
  clientId: string;
  dateIssue: string;
  dueDate: string;
  invoiceNumber: string;
  currency: string;
  items: InvoiceItem[];
  discountEnabled: boolean;
  discountId: string;
  splitCount: number;
  splitInterval: string;
  repeatEvery: string;
  repeatUntil: string;
}

/** Shown in the form as placeholder text and in the preview when the field is blank. */
export const INVOICE_NUMBER_PLACEHOLDER = "INV-345442-000";

/** The sending side is the workspace itself, so only the signer's name is editable. */
export const invoiceIssuer = {
  email: "angelina.creatinf@gmail.com",
  address: "IV Persimmon, Springfield, IN 54129",
  paymentMethod: "EFT Bank Transfer",
  accountNumber: "332176141910371",
  signatureName: "Soke Bahtera Abr",
  note: "Late payments will incur a 10% annual fee, calculated daily.",
};

export const invoiceClients: InvoiceClient[] = [
  {
    id: "cansaas",
    name: "Cansaas Agency",
    email: "cansaas.creatinf@gmail.com",
    address: "123 Mapple, Metropolis Street",
  },
  {
    id: "bright",
    name: "Bright Enterprises",
    email: "billing@brightenterprises.com",
    address: "450 Park Avenue South, New York, NY 10016",
  },
  {
    id: "northline",
    name: "Northline GmbH",
    email: "ap@northline.de",
    address: "Kastanienallee 32, 10435 Berlin",
  },
];

export const invoiceCurrencies: InvoiceCurrency[] = [
  { code: "USD", label: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", label: "Euro", flag: "🇪🇺" },
  { code: "GBP", label: "British Pound", flag: "🇬🇧" },
  { code: "INR", label: "Indian Rupee", flag: "🇮🇳" },
];

export const invoiceDiscounts: InvoiceDiscount[] = [
  { id: "year-end", label: "Year End Deals", amount: 2500 },
  { id: "loyalty", label: "Loyalty Credit", amount: 1000 },
  { id: "referral", label: "Referral Bonus", amount: 500 },
];

export const defaultInvoiceValues: InvoiceFormValues = {
  mode: "standard",
  fullName: "Angelina Caroline",
  clientId: "cansaas",
  dateIssue: "2026-01-08",
  dueDate: "2026-01-31",
  invoiceNumber: "",
  currency: "USD",
  items: [
    { id: "brand-guidelines", name: "Brand Guidelines", qty: 2, taxRate: 10, amount: 2500 },
    { id: "logo-usage", name: "Logo Usage", qty: 3, taxRate: 10, amount: 3000 },
    { id: "color-palette", name: "Color Palette", qty: 4, taxRate: 10, amount: 4000 },
    { id: "typography", name: "Typography Standards", qty: 5, taxRate: 10, amount: 5000 },
  ],
  discountEnabled: true,
  discountId: "year-end",
  splitCount: 3,
  splitInterval: "monthly",
  repeatEvery: "monthly",
  repeatUntil: "2026-12-31",
};

function safeNumber(value: number | undefined) {
  return Number.isFinite(value) ? (value as number) : 0;
}

export function getInvoiceClient(invoice: InvoiceFormValues) {
  return invoiceClients.find((client) => client.id === invoice.clientId) ?? invoiceClients[0];
}

export function getInvoiceCurrency(invoice: InvoiceFormValues) {
  return invoiceCurrencies.find((currency) => currency.code === invoice.currency) ?? invoiceCurrencies[0];
}

export function getInvoiceSubtotal(invoice: InvoiceFormValues) {
  return invoice.items.reduce((total, item) => total + safeNumber(item?.amount), 0);
}

export function getInvoiceDiscount(invoice: InvoiceFormValues) {
  if (!invoice.discountEnabled) return 0;

  const discount = invoiceDiscounts.find((option) => option.id === invoice.discountId);

  // Never let a preset discount push the invoice below zero.
  return Math.min(discount?.amount ?? 0, getInvoiceSubtotal(invoice));
}

export function getInvoiceTotal(invoice: InvoiceFormValues) {
  return getInvoiceSubtotal(invoice) - getInvoiceDiscount(invoice);
}

/**
 * Split mode pays the total in equal instalments from the due date onward.
 * The last instalment absorbs the rounding remainder so the parts always
 * add back up to the grand total.
 */
export function getInvoiceInstalments(invoice: InvoiceFormValues) {
  const count = Math.max(2, Math.round(safeNumber(invoice.splitCount)));
  const total = getInvoiceTotal(invoice);
  const share = Math.round((total / count) * 100) / 100;
  const due = parseISO(invoice.dueDate);

  if (Number.isNaN(due.getTime())) return [];

  return Array.from({ length: count }, (_, index) => ({
    label: `Payment ${index + 1} of ${count}`,
    date: invoice.splitInterval === "biweekly" ? addWeeks(due, index * 2) : addMonths(due, index),
    amount: index === count - 1 ? Math.round((total - share * (count - 1)) * 100) / 100 : share,
  }));
}

export function getRecurringLabel(invoice: InvoiceFormValues) {
  const frequency = recurringFrequencies.find((option) => option.id === invoice.repeatEvery);
  const until = parseISO(invoice.repeatUntil);

  return {
    frequency: frequency?.label ?? "Monthly",
    until: Number.isNaN(until.getTime()) ? null : until,
  };
}
