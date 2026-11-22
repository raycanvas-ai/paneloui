"use client";

import * as React from "react";

import { cn } from "cn";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { defaultInvoiceValues, type InvoiceFormValues } from "./data";
import { InvoiceForm } from "./invoice-form";
import { InvoicePreview } from "./invoice-preview";

/** The screen's accent, scoped here so it never leaks into the rest of the shell. */
const TONE_VARS = "[--tone-primary:var(--primary)]";

export function Invoice() {
  const form = useForm<InvoiceFormValues>({ defaultValues: defaultInvoiceValues });
  const invoice = useWatch({ control: form.control }) as InvoiceFormValues;
  const [showPreview, setShowPreview] = React.useState(true);

  return (
    <FormProvider {...form}>
      {/* One scroller on small screens, two independent panes from lg up. */}
      <div
        className={cn(
          // Collapsing a grid column animates cleanly; swapping width classes snapped.
          "grid h-full min-h-0 overflow-y-auto bg-card transition-[grid-template-columns] duration-300 ease-out lg:grid-rows-1 lg:overflow-hidden",
          showPreview ? "lg:grid-cols-[1fr_1fr]" : "lg:grid-cols-[1fr_0fr]",
          TONE_VARS,
        )}
        data-content-padding="false"
      >
        <form
          className="flex min-w-0 flex-col lg:min-h-0 lg:overflow-y-auto"
          noValidate
          onSubmit={(event) => event.preventDefault()}
        >
          <InvoiceForm showPreview={showPreview} onShowPreviewChange={setShowPreview} />
        </form>

        <InvoicePreview invoice={invoice} collapsed={!showPreview} />
      </div>
    </FormProvider>
  );
}
