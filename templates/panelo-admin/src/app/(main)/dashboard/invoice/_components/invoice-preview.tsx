"use client";

import { cn } from "cn";
import { FileText, Mail, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

import type { InvoiceFormValues } from "./data";
import { InvoicePaper } from "./invoice-paper";
import { PrintInvoice } from "./print-invoice";

export function InvoicePreview({
  invoice,
  collapsed,
}: {
  readonly invoice: InvoiceFormValues;
  readonly collapsed: boolean;
}) {
  return (
    <>
      <PrintInvoice invoice={invoice} />

      <aside
        aria-hidden={collapsed}
        className={cn(
          "flex min-w-0 flex-col overflow-hidden lg:min-h-0",
          // Off-screen sizes stack, so below lg the pane simply leaves the flow.
          collapsed ? "max-lg:hidden" : "border-t lg:border-t-0 lg:border-l",
        )}
      >
        <header className="flex shrink-0 flex-wrap items-center gap-2.5 border-b bg-card px-4 py-3 lg:min-w-96">
          <h2 className="font-semibold text-lg tracking-tight">Preview</h2>

          <ButtonGroup>
            <Button type="button" variant="outline">
              <Mail data-icon="inline-start" />
              Email
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <FileText data-icon="inline-start" />
              PDF
            </Button>
          </ButtonGroup>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="button" className="bg-[var(--tone-primary)] text-white hover:bg-[var(--tone-primary)]/90">
              <Send data-icon="inline-start" />
              Send Invoice
            </Button>
          </div>
        </header>

        <div className="flex-1 bg-muted p-4 sm:p-5 lg:min-h-0 lg:min-w-96 lg:overflow-y-auto">
          {/* Two offset sheets behind the paper, the way the mock stacks them. */}
          <div className="relative mx-auto w-full max-w-[660px] pt-3.5">
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-8 rounded-t-lg bg-black/[0.06] dark:bg-white/5"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-3 top-2 h-8 rounded-t-lg bg-black/[0.04] dark:bg-white/[0.03]"
            />
            <InvoicePaper invoice={invoice} />
          </div>
        </div>
      </aside>
    </>
  );
}
