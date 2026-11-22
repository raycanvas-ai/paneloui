"use client";

import type { ComponentProps } from "react";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

type OtpCodeInputProps = Omit<ComponentProps<typeof InputOTP>, "maxLength" | "render" | "children" | "pattern">;

// 6-digit code split 3 + 3, sized up for auth screens.
export function OtpCodeInput(props: OtpCodeInputProps) {
  const invalid = props["aria-invalid"] === true;
  const slot = "size-11 text-lg tabular-nums";

  return (
    <InputOTP maxLength={6} pattern="digits" containerClassName="justify-center gap-2" {...props}>
      <InputOTPGroup>
        {[0, 1, 2].map((index) => (
          <InputOTPSlot key={index} index={index} className={slot} aria-invalid={invalid} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {[3, 4, 5].map((index) => (
          <InputOTPSlot key={index} index={index} className={slot} aria-invalid={invalid} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
