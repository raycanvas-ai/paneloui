"use client";

import * as React from "react";

import { cn } from "cn";
import { ChevronUp, DollarSign, Layers, Percent, Plus, Puzzle, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { type InvoiceFormValues, invoiceCurrencies } from "./data";
import { NotchField, notchInputClass, notchTriggerClass } from "./notch-field";

export function InvoiceItems() {
  const { control, register } = useFormContext<InvoiceFormValues>();
  const { append, fields, remove } = useFieldArray({ control, name: "items", keyName: "fieldKey" });
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setCollapsed((previous) => ({ ...previous, [key]: !previous[key] }));
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-medium tracking-tight">Invoice Items/Service</h2>

      <Controller
        control={control}
        name="currency"
        render={({ field }) => {
          const currency = invoiceCurrencies.find((option) => option.code === field.value) ?? invoiceCurrencies[0];

          return (
            <NotchField label="Currency" required>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={notchTriggerClass} aria-label="Currency">
                  <SelectValue>
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="text-base leading-none">{currency.flag}</span>
                      <span className="truncate font-medium">{currency.label}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {invoiceCurrencies.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        <span className="mr-1">{option.flag}</span>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </NotchField>
          );
        }}
      />

      {fields.map((field, index) => {
        const isCollapsed = collapsed[field.fieldKey] === true;

        return (
          <div key={field.fieldKey} className="rounded-xl border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm">Item {index + 1}</span>
              <div className="-mr-1.5 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove item ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-expanded={!isCollapsed}
                  aria-label={`${isCollapsed ? "Expand" : "Collapse"} item ${index + 1}`}
                  onClick={() => toggle(field.fieldKey)}
                >
                  <ChevronUp className={cn("transition-transform", isCollapsed && "rotate-180")} />
                </Button>
              </div>
            </div>

            {isCollapsed ? null : (
              <div className="mt-4 flex flex-col gap-4">
                <NotchField label="Item Name" icon={<Puzzle />} htmlFor={`item-name-${index}`}>
                  <input
                    id={`item-name-${index}`}
                    className={notchInputClass}
                    placeholder="Item name"
                    {...register(`items.${index}.name` as const)}
                  />
                </NotchField>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1.5fr]">
                  <NotchField label="QTY" icon={<Layers />} htmlFor={`item-qty-${index}`}>
                    <input
                      id={`item-qty-${index}`}
                      type="number"
                      min="0"
                      step="1"
                      className={notchInputClass}
                      {...register(`items.${index}.qty` as const, { valueAsNumber: true })}
                    />
                  </NotchField>

                  <NotchField label="Tax" icon={<Percent />} htmlFor={`item-tax-${index}`}>
                    <input
                      id={`item-tax-${index}`}
                      type="number"
                      min="0"
                      step="0.1"
                      className={notchInputClass}
                      {...register(`items.${index}.taxRate` as const, { valueAsNumber: true })}
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </NotchField>

                  <NotchField
                    label="Amount"
                    icon={<DollarSign />}
                    htmlFor={`item-amount-${index}`}
                    className="max-sm:col-span-2"
                  >
                    <input
                      id={`item-amount-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      className={notchInputClass}
                      {...register(`items.${index}.amount` as const, { valueAsNumber: true })}
                    />
                  </NotchField>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="h-10 w-full rounded-lg bg-muted/50 font-normal text-muted-foreground hover:text-foreground"
        onClick={() => append({ id: `item-${Date.now()}`, name: "", qty: 1, taxRate: 10, amount: 0 })}
      >
        <Plus data-icon="inline-start" />
        Add Items
      </Button>
    </section>
  );
}
