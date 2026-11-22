"use client";

import * as React from "react";

import { format, parseISO } from "date-fns";
import { CalendarDays, ChevronDown, Hash, Layers2, Repeat, User } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ClientMark } from "./client-mark";
import {
  INVOICE_NUMBER_PLACEHOLDER,
  type InvoiceFormValues,
  invoiceClients,
  invoiceDiscounts,
  recurringFrequencies,
  splitCounts,
  splitIntervals,
} from "./data";
import { InvoiceItems } from "./invoice-items";
import { NotchField, notchInputClass, notchTriggerClass } from "./notch-field";

const MODES = [
  { value: "standard", label: "Standard" },
  { value: "split", label: "Split" },
  { value: "recurring", label: "Recurring" },
] as const;

export function InvoiceForm({
  showPreview,
  onShowPreviewChange,
}: {
  readonly showPreview: boolean;
  readonly onShowPreviewChange: (value: boolean) => void;
}) {
  const { control, register } = useFormContext<InvoiceFormValues>();
  const discountEnabled = useWatch({ control, name: "discountEnabled" });
  const mode = useWatch({ control, name: "mode" });

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
      <Breadcrumb className="pl-10 md:pl-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/invoice">Invoice</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create Invoice</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-semibold text-xl tracking-tight">Create Invoice</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">Create a new invoice and deliver it instantly.</p>
        </div>

        <FieldLabel className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-lg border bg-card px-3 py-2 font-medium text-sm shadow-xs">
          Show Preview
          <Switch
            checked={showPreview}
            onCheckedChange={onShowPreviewChange}
            className="data-checked:bg-[var(--tone-primary)]"
          />
        </FieldLabel>
      </div>

      <Controller
        control={control}
        name="mode"
        render={({ field }) => (
          <Tabs value={field.value} onValueChange={field.onChange}>
            <TabsList className="w-full rounded-lg bg-muted p-1 group-data-horizontal/tabs:h-9">
              {MODES.map((mode) => (
                <TabsTrigger key={mode.value} value={mode.value} className="rounded-lg text-sm">
                  {mode.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      />

      {/* Each mode owns the extra terms it needs; Standard needs none. */}
      {mode === "split" ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-medium tracking-tight">Payment Schedule</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <NotchSelect
              name="splitCount"
              label="Split Into"
              icon={<Layers2 />}
              asNumber
              options={splitCounts.map((count) => ({ value: String(count), label: `${count} payments` }))}
            />
            <NotchSelect
              name="splitInterval"
              label="Frequency"
              icon={<Repeat />}
              options={splitIntervals.map((interval) => ({ value: interval.id, label: interval.label }))}
            />
          </div>
        </section>
      ) : null}

      {mode === "recurring" ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-medium tracking-tight">Recurring Schedule</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <NotchSelect
              name="repeatEvery"
              label="Repeat Every"
              icon={<Repeat />}
              options={recurringFrequencies.map((frequency) => ({ value: frequency.id, label: frequency.label }))}
            />
            <Controller
              control={control}
              name="repeatUntil"
              render={({ field }) => (
                <DateNotch id="repeat-until" label="Ends On" value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="font-medium tracking-tight">Invoice Information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <NotchField label="Full Name" required icon={<User />} htmlFor="full-name">
            <input id="full-name" className={notchInputClass} placeholder="Full name" {...register("fullName")} />
          </NotchField>

          <Controller
            control={control}
            name="clientId"
            render={({ field }) => {
              const client = invoiceClients.find((option) => option.id === field.value) ?? invoiceClients[0];

              return (
                <NotchField label="Billed To" required>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={notchTriggerClass} aria-label="Billed to">
                      <SelectValue>
                        <span className="flex min-w-0 items-center gap-2.5">
                          <ClientMark name={client.name} />
                          <span className="truncate font-medium">{client.name}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        {invoiceClients.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </NotchField>
              );
            }}
          />

          <Controller
            control={control}
            name="dateIssue"
            render={({ field }) => (
              <DateNotch id="date-issue" label="Date Issue" value={field.value} onChange={field.onChange} />
            )}
          />

          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <DateNotch id="due-date" label="Due Date" value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <NotchField label="Invoice Number" icon={<Hash />} htmlFor="invoice-number">
          <input
            id="invoice-number"
            className={notchInputClass}
            placeholder={INVOICE_NUMBER_PLACEHOLDER}
            {...register("invoiceNumber")}
          />
        </NotchField>
      </section>

      <Separator />

      <InvoiceItems />

      <Separator />

      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <Controller
          control={control}
          name="discountEnabled"
          render={({ field }) => (
            <FieldLabel className="flex cursor-pointer items-center gap-3 font-medium text-sm">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="size-4.5 rounded-[5px] data-checked:border-[var(--tone-primary)] data-checked:bg-[var(--tone-primary)]"
              />
              Add Discount
            </FieldLabel>
          )}
        />

        <Controller
          control={control}
          name="discountId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={!discountEnabled}>
              <SelectTrigger
                aria-label="Discount"
                className="h-9 w-full rounded-lg px-3 data-[size=default]:h-9 sm:w-52"
              >
                <SelectValue placeholder="Select discount">
                  {invoiceDiscounts.find((option) => option.id === field.value)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectGroup>
                  {invoiceDiscounts.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
}

/** A Select that disappears into a notched field — used by the schedule sections. */
function NotchSelect({
  name,
  label,
  icon,
  options,
  asNumber,
}: {
  readonly name: "splitCount" | "splitInterval" | "repeatEvery";
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly options: Array<{ value: string; label: string }>;
  readonly asNumber?: boolean;
}) {
  const { control } = useFormContext<InvoiceFormValues>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <NotchField label={label} required icon={icon}>
          <Select
            value={String(field.value)}
            onValueChange={(value) => field.onChange(asNumber ? Number(value) : value)}
          >
            <SelectTrigger className={notchTriggerClass} aria-label={label}>
              <SelectValue>{options.find((option) => option.value === String(field.value))?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </NotchField>
      )}
    />
  );
}

function DateNotch({
  id,
  label,
  value,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const date = parseDateValue(value);

  return (
    <NotchField label={label} required icon={<CalendarDays />}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          className="flex h-full w-full min-w-0 cursor-pointer items-center justify-between gap-2 text-left text-sm outline-none"
        >
          <span className={date ? "truncate" : "truncate text-muted-foreground"}>
            {date ? format(date, "MMMM d, yyyy") : "Pick a date"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={(selected) => {
              if (!selected) return;

              onChange(format(selected, "yyyy-MM-dd"));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </NotchField>
  );
}

function parseDateValue(value: string) {
  const date = parseISO(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
