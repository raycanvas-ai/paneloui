"use client";

import { useSyncExternalStore } from "react";

import { createPortal } from "react-dom";

import type { InvoiceFormValues } from "./data";
import { InvoicePaper } from "./invoice-paper";

const subscribe = () => () => {
  // Nothing to unsubscribe: the snapshot never changes after hydration.
};

/** Renders a print-only copy of the invoice straight under <body>, once we're on the client. */
export function PrintInvoice({ invoice }: { readonly invoice: InvoiceFormValues }) {
  // Server snapshot is false, client snapshot is true: no effect or extra render needed to detect hydration.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!isClient) return null;

  return createPortal(
    <div data-print-root>
      <InvoicePaper invoice={invoice} />
    </div>,
    document.body,
  );
}
