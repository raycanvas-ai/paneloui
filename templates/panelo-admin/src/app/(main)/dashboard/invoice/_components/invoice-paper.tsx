import { format, parseISO } from "date-fns";

import { formatCurrency } from "@/lib/utils";

import { ClientMark } from "./client-mark";
import {
  getInvoiceClient,
  getInvoiceCurrency,
  getInvoiceDiscount,
  getInvoiceInstalments,
  getInvoiceSubtotal,
  getInvoiceTotal,
  getRecurringLabel,
  INVOICE_NUMBER_PLACEHOLDER,
  type InvoiceFormValues,
  invoiceIssuer,
} from "./data";

const ROW = "grid grid-cols-[minmax(0,1fr)_44px_56px_auto] items-center gap-3 sm:gap-4";

export function InvoicePaper({ invoice }: { readonly invoice: InvoiceFormValues }) {
  const client = getInvoiceClient(invoice);
  const currency = getInvoiceCurrency(invoice);
  const recurring = getRecurringLabel(invoice);
  const money = (value: number) =>
    formatCurrency(Number.isFinite(value) ? value : 0, {
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <article
      data-print-paper
      className="relative flex flex-col gap-6 rounded-lg bg-white p-5 text-neutral-900 text-[13px] shadow-sm sm:p-6"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-bold text-xl tracking-tight sm:text-2xl">INVOICE</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-neutral-500">Invoice Number</span>
            <span className="rounded bg-neutral-100 px-2 py-0.5 font-medium text-neutral-700">
              #{invoice.invoiceNumber.trim() ? invoice.invoiceNumber : INVOICE_NUMBER_PLACEHOLDER}
            </span>
          </div>
        </div>
        <ClientMark className="size-10 sm:size-11" />
      </header>

      <div className="flex flex-col gap-6 border-neutral-200 border-t pt-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Party
            label="Billed by:"
            name={invoice.fullName}
            email={invoiceIssuer.email}
            address={invoiceIssuer.address}
          />
          <Party label="Billed to:" name={client.name} email={client.email} address={client.address} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Stamp label="Date Issue:" value={formatPaperDate(invoice.dateIssue)} />
          <Stamp label="Due Date:" value={formatPaperDate(invoice.dueDate)} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <p className="text-neutral-500">Invoice Items/Service:</p>

        <div>
          <div className={`${ROW} rounded bg-neutral-50 px-3 py-2.5 text-neutral-500`}>
            <span>Item Name</span>
            <span className="text-right">QTY</span>
            <span className="text-right">Tax</span>
            <span className="text-right tabular-nums">Amount</span>
          </div>

          {invoice.items.map((item) => (
            <div key={item.id} className={`${ROW} border-neutral-100 border-b px-3 py-2.5`}>
              <span className="truncate">{item.name}</span>
              <span className="text-right tabular-nums">{item.qty}</span>
              <span className="text-right tabular-nums">{item.taxRate}%</span>
              <span className="text-right tabular-nums">{money(item.amount)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col">
        <Total label="Subtotal" value={money(getInvoiceSubtotal(invoice))} />
        <Total label="Discount" value={money(getInvoiceDiscount(invoice))} />
        <Total label="Grand Total" value={money(getInvoiceTotal(invoice))} emphasis />
      </section>

      {invoice.mode === "split" ? (
        <section className="flex flex-col gap-2">
          <p className="text-neutral-500">Payment Schedule:</p>
          {getInvoiceInstalments(invoice).map((instalment) => (
            <div
              key={instalment.label}
              className="flex items-center justify-between gap-4 border-neutral-100 border-b px-3 pb-2"
            >
              <span>{instalment.label}</span>
              <span className="text-neutral-500">{format(instalment.date, "MMMM d, yyyy")}</span>
              <span className="tabular-nums">{money(instalment.amount)}</span>
            </div>
          ))}
        </section>
      ) : null}

      {invoice.mode === "recurring" ? (
        <p className="rounded-md bg-neutral-50 px-3 py-2 text-neutral-600">
          Repeats <span className="font-semibold text-neutral-900">{recurring.frequency.toLowerCase()}</span>
          {recurring.until ? <> until {format(recurring.until, "MMMM d, yyyy")}</> : null}.
        </p>
      ) : null}

      <p className="rounded-md border border-neutral-200 px-3 py-2 text-neutral-600">Note: {invoiceIssuer.note}</p>

      <footer className="flex flex-wrap items-end justify-between gap-5 pt-1">
        <div>
          <p className="font-semibold">Payment Method</p>
          <p className="mt-1 text-neutral-500">{invoiceIssuer.paymentMethod}</p>
          <p className="text-neutral-500">Account Number : {invoiceIssuer.accountNumber}</p>
        </div>

        <div className="ml-auto text-right">
          <svg viewBox="0 0 150 44" className="h-9 w-[124px] text-neutral-900" aria-hidden="true">
            <path
              d="M6 38C22 30 30 6 38 8s-4 30 4 30 14-26 22-24-2 26 6 26 12-20 20-20 8 14 16 10 12-16 32-22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <p className="font-semibold">{invoiceIssuer.signatureName}</p>
        </div>
      </footer>
    </article>
  );
}

function Party({
  label,
  name,
  email,
  address,
}: {
  readonly label: string;
  readonly name: string;
  readonly email: string;
  readonly address: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold">{name}</p>
      <p className="text-neutral-500">{email}</p>
      <p className="text-neutral-500">{address}</p>
    </div>
  );
}

function Stamp({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function Total({
  label,
  value,
  emphasis,
}: {
  readonly label: string;
  readonly value: string;
  readonly emphasis?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-6 px-3 py-2 ${emphasis ? "font-bold" : "text-neutral-700"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function formatPaperDate(value: string) {
  const date = parseISO(value);

  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMMM d, yyyy");
}
