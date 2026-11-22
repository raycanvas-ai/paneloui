import { cn } from "cn";
import { Circle, CircleCheck } from "lucide-react";

export const passwordRequirements = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "Upper and lowercase letters", test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { label: "At least one number", test: (value: string) => /\d/.test(value) },
  { label: "At least one symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export const meetsPasswordRequirements = (value: string) => passwordRequirements.every((rule) => rule.test(value));

// Index = number of requirements met.
const strength = [
  { label: "Too weak", text: "text-muted-foreground", fill: "" },
  { label: "Weak", text: "text-destructive", fill: "bg-destructive" },
  { label: "Fair", text: "text-warning", fill: "bg-warning-solid" },
  { label: "Good", text: "text-success", fill: "bg-success-solid" },
  { label: "Strong", text: "text-success", fill: "bg-success-solid" },
];

const iconSwap = "size-4 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
const iconHidden = "scale-[0.25] opacity-0 blur-[4px]";

/** Meter plus checklist; point the input's aria-describedby at `${id}-strength ${id}-rules`. */
export function PasswordStrength({ id, password }: { readonly id: string; readonly password: string }) {
  const met = passwordRequirements.map((rule) => rule.test(password));
  const score = met.filter(Boolean).length;

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
          {passwordRequirements.map((rule, index) => (
            <div
              key={rule.label}
              className={cn(
                "h-1 rounded-full bg-foreground/10 transition-[background-color] duration-150 ease-out",
                index < score && strength[score].fill,
              )}
            />
          ))}
        </div>
        <span id={`${id}-strength`} aria-live="polite" className={cn("w-16 text-right text-xs", strength[score].text)}>
          {password ? strength[score].label : ""}
        </span>
      </div>

      <ul id={`${id}-rules`} aria-label="Password requirements" className="grid gap-1.5 sm:grid-cols-2">
        {passwordRequirements.map((rule, index) => (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-2 text-xs transition-[color] duration-150 ease-out",
              met[index] ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="relative grid shrink-0 place-items-center">
              <CircleCheck
                aria-hidden="true"
                className={cn("absolute inset-0 text-success", iconSwap, !met[index] && iconHidden)}
              />
              <Circle aria-hidden="true" className={cn(iconSwap, met[index] && iconHidden)} />
            </span>
            {rule.label}
            <span className="sr-only">{met[index] ? "(met)" : "(not met)"}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
