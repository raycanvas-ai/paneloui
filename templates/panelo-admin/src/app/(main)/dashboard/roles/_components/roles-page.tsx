"use client";

import { useState } from "react";

import Link from "next/link";

import { cn } from "cn";
import { Plus } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

import { RoleDetail } from "./role-detail";
import { RoleList } from "./role-list";
import { initialRoles, type Role } from "./roles-data";

/** Same accents and canvas as the default overview so roles reads as part of the product. */
const TONE_VARS = "[--tone-primary:var(--primary)] [--tone-secondary:var(--chart-2)]";

const PILL = "h-8 gap-1.5 rounded-full bg-card px-3.5 text-sm shadow-xs hover:bg-card";

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedId, setSelectedId] = useState(initialRoles[1].id);
  const [dirty, setDirty] = useState(false);
  // An action that would drop unsaved edits waits here until the user confirms.
  const [pending, setPending] = useState<(() => void) | null>(null);

  const guard = (action: () => void) => {
    if (dirty) setPending(() => action);
    else action();
  };

  const selected = roles.find((role) => role.id === selectedId) ?? roles[0];
  const update = (id: string, patch: Partial<Role>) =>
    setRoles((current) => current.map((role) => (role.id === id ? { ...role, ...patch } : role)));

  const duplicate = () => {
    const copy: Role = {
      ...selected,
      id: `custom-${Date.now()}`,
      name: `${selected.name} copy`,
      system: false,
      members: [],
    };
    setRoles((current) => [...current, copy]);
    setSelectedId(copy.id);
    toast.success(`Created “${copy.name}”`, { description: "Rename it and adjust permissions, then save." });
  };

  const remove = () => {
    setRoles((current) => current.filter((role) => role.id !== selected.id));
    setSelectedId(roles[0].id);
    toast.success(`Deleted “${selected.name}”`);
  };

  const removeMember = (email: string) => {
    const role = selected;
    const member = role.members.find((item) => item.email === email);
    if (!member) return;
    update(role.id, { members: role.members.filter((item) => item.email !== email) });
    toast(`${member.name} removed from ${role.name}`, {
      action: {
        label: "Undo",
        onClick: () =>
          setRoles((current) =>
            current.map((item) => (item.id === role.id ? { ...item, members: [...item.members, member] } : item)),
          ),
      },
    });
  };

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-muted p-4 sm:p-5", TONE_VARS)}
      data-content-padding="false"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        {/* Mobile keeps clearance for the layout's floating sidebar trigger. */}
        <div className="pl-10 md:pl-0">
          <h1 className="font-semibold text-2xl tracking-tight">Roles &amp; permissions</h1>
          <p className="mt-0.5 text-muted-foreground text-sm">
            {roles.length} roles · decide who can see, create, and change each part of the workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className={PILL}>
            <Link href="/dashboard/users">Users</Link>
          </Button>
          <Button className="h-8 rounded-full px-3.5" onClick={() => guard(duplicate)}>
            <Plus data-icon="inline-start" />
            Create role
          </Button>
        </div>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <RoleList
          roles={roles}
          selectedId={selected.id}
          onSelect={(id) => (id === selected.id ? undefined : guard(() => setSelectedId(id)))}
        />
        <RoleDetail
          key={selected.id}
          role={selected}
          canRemove={(role) => role.id !== "owner" || role.members.length > 1}
          onDuplicate={() => guard(duplicate)}
          onDirtyChange={setDirty}
          onDelete={remove}
          onRemoveMember={removeMember}
          onSave={(patch) => {
            update(selected.id, patch);
            toast.success(`Saved “${patch.name}”`);
          }}
        />
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => (open ? undefined : setPending(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits to “{selected.name}” haven&apos;t been saved. Leaving now throws them away.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                pending?.();
                setPending(null);
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
