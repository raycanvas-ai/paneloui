"use client";

import { useState } from "react";

import { Plus, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { CopyButton } from "./copy-button";

const SCOPES = [
  { id: "projects:read", description: "List projects and tasks" },
  { id: "projects:write", description: "Create and update tasks" },
  { id: "members:read", description: "Read workspace members" },
  { id: "billing:read", description: "Read invoices and usage" },
] as const;

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastFour: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string | null;
};

export function CreateKeyDialog({ onCreate }: { onCreate: (key: ApiKey) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["projects:read"]);
  const [touched, setTouched] = useState(false);
  const [created, setCreated] = useState<{ key: ApiKey; secret: string } | null>(null);
  const secret = created?.secret;

  const nameError = touched && name.trim().length < 3 ? "Give the key a name of at least 3 characters." : null;
  const scopeError = touched && scopes.length === 0 ? "Pick at least one scope." : null;

  function reset() {
    setName("");
    setScopes(["projects:read"]);
    setTouched(false);
    setCreated(null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (name.trim().length < 3 || scopes.length === 0) return;

    const value = `pnl_live_${crypto.randomUUID().replaceAll("-", "")}`;
    setCreated({
      secret: value,
      key: {
        id: crypto.randomUUID(),
        name: name.trim(),
        prefix: "pnl_live_",
        lastFour: value.slice(-4),
        scopes,
        createdAt: "Just now",
        lastUsed: null,
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Reset on open so the secret view doesn't flip back to the form while the dialog fades out.
        if (next) {
          reset();
        } else if (created) {
          // Commit on close, not on submit: the empty state that renders this dialog unmounts once a key exists.
          onCreate(created.key);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          Create key
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {secret ? (
          <>
            <DialogHeader>
              <DialogTitle>Copy your new key</DialogTitle>
              <DialogDescription>Store it somewhere safe, like a secrets manager.</DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-1 rounded-lg border bg-muted/50 py-1 pr-1 pl-3">
              <code className="min-w-0 flex-1 truncate font-mono text-xs">{secret}</code>
              <CopyButton value={secret} label="Copy API key" />
            </div>

            <p className="flex items-start gap-2 text-sm text-warning">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              You won't be able to see this key again after closing this dialog.
            </p>

            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form noValidate onSubmit={submit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>Keys act on behalf of Panelo Studio, not your personal account.</DialogDescription>
            </DialogHeader>

            <Field className="gap-1.5" data-invalid={!!nameError}>
              <FieldLabel htmlFor="key-name">Name</FieldLabel>
              <Input
                id="key-name"
                placeholder="e.g. Zapier production"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={!!nameError}
                autoComplete="off"
              />
              {nameError && <FieldError>{nameError}</FieldError>}
            </Field>

            <FieldSet className="gap-2">
              <FieldLegend variant="label">Scopes</FieldLegend>
              {SCOPES.map((scope) => (
                <Field key={scope.id} orientation="horizontal">
                  <Checkbox
                    id={`scope-${scope.id}`}
                    checked={scopes.includes(scope.id)}
                    onCheckedChange={(checked) =>
                      setScopes((current) =>
                        checked ? [...current, scope.id] : current.filter((item) => item !== scope.id),
                      )
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`scope-${scope.id}`} className="font-mono font-normal text-xs">
                      {scope.id}
                    </FieldLabel>
                    <FieldDescription className="text-xs">{scope.description}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
              {scopeError && <FieldError>{scopeError}</FieldError>}
            </FieldSet>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Create key</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
