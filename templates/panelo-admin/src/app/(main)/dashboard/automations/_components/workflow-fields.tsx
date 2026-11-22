"use client";
import type { ChangeEvent } from "react";

import { cn } from "cn";

/**
 * Chips in this builder are real controls. Each one lays an absolutely
 * positioned input or select over an invisible copy of the current value, so
 * the chip stays exactly as wide as what it holds — a bare <select> would
 * otherwise size itself to its longest option.
 */
const SHELL =
  "relative inline-flex h-[28px] items-center rounded-[8px] bg-muted px-[11px] text-[15px] text-foreground/75 transition-colors focus-within:bg-foreground/10 hover:bg-foreground/15";
const SIZER = "pointer-events-none whitespace-pre opacity-0";
const CONTROL = "absolute inset-0 w-full appearance-none rounded-[8px] bg-transparent px-[11px] outline-none";

export function ChipInput({
  value,
  onChange,
  label,
  placeholder = "value",
  className,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
  readonly placeholder?: string;
  readonly className?: string;
}) {
  return (
    <label className={cn(SHELL, "cursor-text", className)}>
      <span className={SIZER}>{value || placeholder}</span>
      <input
        value={value}
        aria-label={label}
        placeholder={placeholder}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className={cn(CONTROL, "placeholder:text-muted-foreground")}
      />
    </label>
  );
}

export function ChipSelect({
  value,
  options,
  onChange,
  label,
  className,
}: {
  readonly value: string;
  readonly options: readonly string[];
  readonly onChange: (value: string) => void;
  readonly label: string;
  readonly className?: string;
}) {
  return (
    <label className={cn(SHELL, "cursor-pointer", className)}>
      <span className={SIZER}>{value}</span>
      <select
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className={cn(CONTROL, "cursor-pointer")}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Auto-growing message body that keeps the reference's block styling. */
export function BodyField({
  value,
  onChange,
  label,
  className,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly label: string;
  readonly className?: string;
}) {
  return (
    <textarea
      value={value}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      rows={value.split("\n").length}
      className={cn(
        "field-sizing-content w-full resize-none bg-transparent text-[15px] leading-[20px] outline-none",
        className,
      )}
    />
  );
}
