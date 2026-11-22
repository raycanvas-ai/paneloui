"use client";

import { type ComponentProps, useState } from "react";

import { cn } from "cn";
import { Eye, EyeOff } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

// Both icons stay mounted and cross-fade, so the swap animates in both directions.
const iconSwap = "size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const iconHidden = "scale-[0.25] opacity-0 blur-[4px]";

export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput {...props} type={visible ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <span className="relative grid place-items-center">
            <EyeOff aria-hidden="true" className={cn("absolute inset-0", iconSwap, !visible && iconHidden)} />
            <Eye aria-hidden="true" className={cn(iconSwap, visible && iconHidden)} />
          </span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
