"use client";

import { useState } from "react";

import { format, subDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DAY_FORMAT = "d MMM yyyy";

function describe(range: DateRange | undefined) {
  if (!range?.from) return "Select date";
  const start = format(range.from, DAY_FORMAT);
  return range.to ? `${start} - ${format(range.to, DAY_FORMAT)}` : start;
}

/** Two-month range picker. Pass `value` to control it; otherwise it starts on the last 30 days. */
export function DateRangePicker({
  value,
  onChange,
}: {
  readonly value?: DateRange;
  readonly onChange?: (value: DateRange | undefined) => void;
}) {
  const [ownRange, setOwnRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: subDays(today, 29), to: today };
  });
  const range = value ?? ownRange;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="font-normal">
          {describe(range)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto overflow-hidden p-0">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={range?.from}
          selected={range}
          onSelect={(next) => {
            if (value === undefined) setOwnRange(next);
            onChange?.(next);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
