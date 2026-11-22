"use client";

import { useState } from "react";

import { cn } from "cn";
import { Check, Link2, Map as MapIcon, Plus, Repeat, SquareKanban, X } from "lucide-react";
import { type SimpleIcon as SimpleIconType, siFigma, siGithub, siLinear, siNotion } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";

// Selected tiles show a check with the contextual icon values: scale 0.25 → 1, opacity, blur 4px → 0.
const tileCheck =
  "scale-[0.25] opacity-0 blur-[4px] transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-has-checked:scale-100 group-has-checked:opacity-100 group-has-checked:blur-[0px]";

const tile =
  "group relative flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-[border-color,background-color,scale] duration-150 ease-out hover:bg-muted/50 active:scale-[0.96] has-checked:border-primary/50 has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/50";

function ChoiceTiles({
  name,
  legend,
  options,
  defaultValue,
  columns = "sm:grid-cols-2",
}: {
  name: string;
  legend: string;
  options: { value: string; label: string; description: string; icon?: React.ComponentType<{ className?: string }> }[];
  defaultValue: string;
  columns?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-medium text-sm">{legend}</legend>
      <div className={cn("grid gap-2", columns)}>
        {options.map((option) => (
          <label key={option.value} className={tile}>
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              className="sr-only"
            />
            <span className="flex items-center gap-2 font-medium text-sm">
              {option.icon && <option.icon className="size-4 text-muted-foreground" />}
              {option.label}
            </span>
            <span className="pr-5 text-muted-foreground text-xs">{option.description}</span>
            <Check aria-hidden="true" className={cn("absolute top-3 right-3 size-4 text-primary", tileCheck)} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ProfileStep() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="onboarding-name">Full name</FieldLabel>
          <Input id="onboarding-name" defaultValue="Panelo Guy" autoComplete="name" />
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="onboarding-role">Role</FieldLabel>
          <NativeSelect id="onboarding-role" className="w-full" defaultValue="product">
            <NativeSelectOption value="founder">Founder</NativeSelectOption>
            <NativeSelectOption value="product">Product manager</NativeSelectOption>
            <NativeSelectOption value="engineering">Engineer</NativeSelectOption>
            <NativeSelectOption value="design">Designer</NativeSelectOption>
          </NativeSelect>
        </Field>
      </div>
      <ChoiceTiles
        name="focus"
        legend="What will your team use Panelo for?"
        defaultValue="product"
        options={[
          { value: "product", label: "Product delivery", description: "Roadmaps, specs, and releases" },
          { value: "engineering", label: "Engineering", description: "Sprints, bugs, and on-call" },
          { value: "client", label: "Client work", description: "Projects, approvals, and invoices" },
          { value: "ops", label: "Operations", description: "Requests, SOPs, and reporting" },
        ]}
      />
    </div>
  );
}

type Invite = { id: number; email: string; role: string };

export function InviteStep() {
  const [invites, setInvites] = useState<Invite[]>([
    { id: 1, email: "maya.chen@panelo.studio", role: "admin" },
    { id: 2, email: "", role: "member" },
  ]);

  function update(id: number, patch: Partial<Invite>) {
    setInvites((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function copyLink() {
    await navigator.clipboard.writeText("https://panelo.app/join/panelo-studio/7fK2qX");
    toast.success("Invite link copied", { description: "Anyone with the link joins as a member." });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {invites.map((invite, index) => (
          <div key={invite.id} className="flex items-center gap-2">
            <Input
              type="email"
              aria-label={`Email for invite ${index + 1}`}
              placeholder="name@company.com"
              value={invite.email}
              onChange={(event) => update(invite.id, { email: event.target.value })}
              autoComplete="off"
            />
            <NativeSelect
              aria-label={`Role for invite ${index + 1}`}
              value={invite.role}
              onChange={(event) => update(invite.id, { role: event.target.value })}
              className="w-32 shrink-0"
            >
              <NativeSelectOption value="admin">Admin</NativeSelectOption>
              <NativeSelectOption value="member">Member</NativeSelectOption>
              <NativeSelectOption value="guest">Guest</NativeSelectOption>
            </NativeSelect>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove invite ${index + 1}`}
              disabled={invites.length === 1}
              onClick={() => setInvites((items) => items.filter((item) => item.id !== invite.id))}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={invites.length >= 5}
          onClick={() => setInvites((items) => [...items, { id: Date.now(), email: "", role: "member" }])}
        >
          <Plus data-icon="inline-start" />
          Add another
        </Button>
        <Button size="sm" variant="outline" onClick={copyLink}>
          <Link2 data-icon="inline-start" />
          Copy invite link
        </Button>
      </div>
      {invites.length >= 5 && (
        <p className="text-muted-foreground text-xs">Invite up to 5 people here. Add more from Team settings.</p>
      )}
    </div>
  );
}

const integrations: { id: string; name: string; description: string; icon: SimpleIconType; connected: boolean }[] = [
  { id: "github", name: "GitHub", description: "Link PRs and commits to tasks", icon: siGithub, connected: true },
  { id: "linear", name: "Linear", description: "Two-way issue sync", icon: siLinear, connected: false },
  { id: "figma", name: "Figma", description: "Embed live design files", icon: siFigma, connected: false },
  { id: "notion", name: "Notion", description: "Import docs and wikis", icon: siNotion, connected: false },
];

export function IntegrationsStep() {
  const [status, setStatus] = useState<Record<string, "idle" | "connecting" | "connected">>(() =>
    Object.fromEntries(integrations.map((item) => [item.id, item.connected ? "connected" : "idle"])),
  );

  function connect(id: string, name: string) {
    setStatus((current) => ({ ...current, [id]: "connecting" }));
    // ponytail: simulated OAuth round-trip; replace with the provider's authorize redirect.
    setTimeout(() => {
      setStatus((current) => ({ ...current, [id]: "connected" }));
      toast.success(`${name} connected`);
    }, 900);
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {integrations.map((integration) => {
        const state = status[integration.id];
        return (
          <li key={integration.id} className="flex items-center gap-3 rounded-lg border p-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-md border bg-background">
              <SimpleIcon icon={integration.icon} className="size-4" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium text-sm">{integration.name}</span>
              <span className="truncate text-muted-foreground text-xs">{integration.description}</span>
            </div>
            {state === "connected" ? (
              <span className="flex items-center gap-1 font-medium text-success text-xs">
                <Check aria-hidden="true" className="size-3.5" />
                Connected
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={state === "connecting"}
                onClick={() => connect(integration.id, integration.name)}
              >
                {state === "connecting" && <Spinner data-icon="inline-start" />}
                {state === "connecting" ? "Connecting" : "Connect"}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectStep() {
  return (
    <div className="flex flex-col gap-5">
      <Field className="gap-1.5 sm:max-w-sm">
        <FieldLabel htmlFor="onboarding-project">Project name</FieldLabel>
        <Input id="onboarding-project" defaultValue="Q4 Launch" autoComplete="off" />
      </Field>
      <ChoiceTiles
        name="template"
        legend="Template"
        defaultValue="kanban"
        columns="sm:grid-cols-3"
        options={[
          { value: "kanban", label: "Kanban board", description: "To do, doing, done", icon: SquareKanban },
          { value: "roadmap", label: "Roadmap", description: "Quarters and milestones", icon: MapIcon },
          { value: "sprint", label: "Sprint cycle", description: "Two-week iterations", icon: Repeat },
        ]}
      />
    </div>
  );
}
