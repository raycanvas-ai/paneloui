"use client";

import { siGithub, siGoogle } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const providers = [
  { id: "google", label: "Google", icon: siGoogle },
  { id: "github", label: "GitHub", icon: siGithub },
] as const;

export type SocialProvider = (typeof providers)[number]["id"];

/** Provider buttons share one pending state so only one sign-in can be in flight. */
export function SocialSignIn({
  pending,
  disabled,
  onSelect,
}: {
  readonly pending: SocialProvider | null;
  readonly disabled?: boolean;
  readonly onSelect: (provider: SocialProvider) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          disabled={pending !== null || disabled === true}
          aria-busy={pending === provider.id}
          onClick={() => onSelect(provider.id)}
        >
          {pending === provider.id ? (
            <Spinner className="size-4" aria-hidden="true" />
          ) : (
            <SimpleIcon icon={provider.icon} className="size-4 fill-current" aria-hidden="true" />
          )}
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
