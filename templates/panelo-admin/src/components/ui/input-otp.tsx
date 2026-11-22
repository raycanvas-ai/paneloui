"use client"

import * as React from "react"
import { cn } from "cn"
import {
  createOTPInputController,
  OTPInput,
  OTPInputGroup,
  OTPInputSeparator,
  OTPInputSlot,
} from "@ui-sdk/react/otp-input"
import { MinusIcon } from "lucide-react"

function InputOTP({
  className,
  containerClassName,
  controller,
  onChange,
  onComplete,
  ref,
  ...props
}: Omit<
  React.ComponentProps<typeof OTPInput>,
  "className" | "ref" | "onValueChange" | "onValueCommit"
> & {
  className?: string
  containerClassName?: string
  ref?: React.Ref<{ focus: () => void }>
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
}) {
  const [ownController] = React.useState(createOTPInputController)
  const otp = controller ?? ownController

  // Form libraries focus the field through its ref; the real input lives inside ui-sdk.
  React.useImperativeHandle(ref, () => ({ focus: () => otp.focus() }), [otp])

  return (
    <OTPInput
      controller={otp}
      onValueChange={(value) => onChange?.(value)}
      onValueCommit={(value) => onComplete?.(value)}
      className={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName,
        // input-otp put className on the input itself.
        "[&>input]:disabled:cursor-not-allowed",
        className
      )}
      render={<div data-slot="input-otp" />}
      {...props}
    />
  )
}

function InputOTPGroup({
  className,
  ...props
}: Omit<React.ComponentProps<typeof OTPInputGroup>, "className"> & {
  className?: string
}) {
  return (
    <OTPInputGroup
      className={cn(
        "flex items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      render={<div data-slot="input-otp-group" />}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: Omit<React.ComponentProps<typeof OTPInputSlot>, "className" | "children"> & {
  className?: string
}) {
  return (
    <OTPInputSlot
      index={index}
      className={cn(
        "relative flex size-8 items-center justify-center border-y border-r border-input text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-destructive data-active:z-10 data-active:border-ring data-active:ring-3 data-active:ring-ring/50 data-active:aria-invalid:border-destructive data-active:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-active:aria-invalid:ring-destructive/40",
        className
      )}
      render={<div data-slot="input-otp-slot" />}
      {...props}
    >
      {({ char, hasFakeCaret }) => (
        <>
          {char}
          {hasFakeCaret && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
            </div>
          )}
        </>
      )}
    </OTPInputSlot>
  )
}

function InputOTPSeparator({
  ...props
}: React.ComponentProps<typeof OTPInputSeparator>) {
  return (
    <OTPInputSeparator
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      render={<div data-slot="input-otp-separator" role="separator" />}
      {...props}
    >
      <MinusIcon
      />
    </OTPInputSeparator>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
