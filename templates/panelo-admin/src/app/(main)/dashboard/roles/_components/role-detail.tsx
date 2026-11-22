"use client";

import { useEffect, useState } from "react";

import { cn } from "cn";
import { Copy, Lock, Trash2, UserMinus, Users } from "lucide-react";

import { PANEL } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getInitials } from "@/lib/utils";

import { ACTIONS, ALL_PERMISSIONS, RESOURCES, type Role, togglePermission } from "./roles-data";

interface RoleDetailProps {
  readonly role: Role;
  /** The last owner can't be removed, or nobody could manage the workspace. */
  readonly canRemove: (role: Role) => boolean;
  readonly onSave: (patch: Pick<Role, "name" | "description" | "permissions">) => void;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
  readonly onRemoveMember: (email: string) => void;
  /** Lets the page confirm before anything that would remount this and drop the draft. */
  readonly onDirtyChange: (dirty: boolean) => void;
}

export function RoleDetail({
  role,
  canRemove,
  onSave,
  onDuplicate,
  onDelete,
  onRemoveMember,
  onDirtyChange,
}: RoleDetailProps) {
  // The parent remounts this per role, so the draft always starts from the saved role.
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [permissions, setPermissions] = useState(role.permissions);

  const locked = role.system;
  const dirty =
    name.trim() !== role.name ||
    description.trim() !== role.description ||
    permissions.join() !== role.permissions.join();

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const discard = () => {
    setName(role.name);
    setDescription(role.description);
    setPermissions(role.permissions);
  };

  return (
    <section aria-label={`${role.name} role`} className={cn(PANEL, "relative flex min-w-0 flex-col")}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          {locked ? (
            <>
              <h2 className="flex items-center gap-2 font-semibold text-xl tracking-tight">
                {role.name}
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-normal text-muted-foreground text-xs">
                  <Lock className="size-3" aria-hidden="true" />
                  System
                </span>
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">{role.description}</p>
            </>
          ) : (
            <div className="flex max-w-lg flex-col gap-1.5">
              <label htmlFor="role-name" className="sr-only">
                Role name
              </label>
              <input
                id="role-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="-mx-2 rounded-md bg-transparent px-2 py-0.5 font-semibold text-xl tracking-tight outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              <label htmlFor="role-description" className="sr-only">
                Role description
              </label>
              <input
                id="role-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this role for?"
                className="-mx-2 rounded-md bg-transparent px-2 py-0.5 text-muted-foreground text-sm outline-none placeholder:text-muted-foreground/60 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onDuplicate}>
            <Copy data-icon="inline-start" />
            Duplicate
          </Button>
          {locked ? null : (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-destructive hover:text-destructive"
              onClick={onDelete}
              disabled={role.members.length > 0}
              title={role.members.length > 0 ? "Move everyone out of this role before deleting it" : undefined}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {locked ? (
        <p className="mx-4 mt-4 flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-muted-foreground text-sm sm:mx-5">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          System roles can&apos;t be edited. Duplicate this role to start a custom one with the same permissions.
        </p>
      ) : null}

      <div className="grid gap-6 p-4 sm:p-5 2xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-medium text-sm">Permissions</h3>
            <span className="text-muted-foreground text-xs tabular-nums">
              {permissions.length} of {ALL_PERMISSIONS.length} granted
            </span>
          </div>

          {/* Narrow screens scroll the matrix inside the card instead of squeezing the columns. */}
          <div className="mt-3 overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground text-xs">
                  <th scope="col" className="px-3 py-2 text-left font-normal">
                    Resource
                  </th>
                  {ACTIONS.map((action) => (
                    <th key={action} scope="col" className="w-20 px-2 py-2 text-center font-normal capitalize">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((resource) => (
                  <tr key={resource.key} className="border-b last:border-b-0">
                    <th scope="row" className="px-3 py-2.5 text-left font-normal">
                      <p>{resource.label}</p>
                      <p className="text-muted-foreground text-xs">{resource.hint}</p>
                    </th>
                    {ACTIONS.map((action) => {
                      const key = `${resource.key}.${action}`;
                      return (
                        <td key={action} className="px-2 py-2.5 text-center">
                          {resource.actions.includes(action) ? (
                            <Checkbox
                              className="mx-auto"
                              checked={permissions.includes(key)}
                              disabled={locked}
                              aria-label={`${resource.label}: ${action}`}
                              onCheckedChange={(checked) =>
                                setPermissions((current) =>
                                  togglePermission(current, resource.key, action, checked === true),
                                )
                              }
                            />
                          ) : (
                            <>
                              <span className="text-muted-foreground/50" aria-hidden="true">
                                —
                              </span>
                              <span className="sr-only">Not applicable</span>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {locked ? null : <p className="mt-2 text-muted-foreground text-xs">Granting any action also grants view.</p>}
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-medium text-sm">Members</h3>
            <span className="text-muted-foreground text-xs tabular-nums">{role.members.length}</span>
          </div>

          {role.members.length === 0 ? (
            <div className="mt-3 flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
              <Users className="size-5 text-muted-foreground" strokeWidth={1.8} aria-hidden="true" />
              <p className="text-muted-foreground text-sm">No one has this role yet.</p>
              <p className="text-muted-foreground text-xs">Assign it from the Users screen.</p>
            </div>
          ) : (
            <ul className="-mx-2 mt-2 flex flex-col">
              {role.members.map((member) => (
                <li key={member.email} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{member.name}</p>
                    <p className="truncate text-muted-foreground text-xs">{member.email}</p>
                  </div>
                  {canRemove(role) ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full text-muted-foreground md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                      aria-label={`Remove ${member.name} from ${role.name}`}
                      onClick={() => onRemoveMember(member.email)}
                    >
                      <UserMinus className="size-3.5" />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {dirty ? (
        <div className="sticky bottom-0 mt-auto flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t bg-card/95 px-4 py-3 backdrop-blur sm:px-5">
          <p className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-warning-solid" aria-hidden="true" />
            Unsaved changes
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={discard}>
              Discard
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              disabled={!name.trim()}
              onClick={() => onSave({ name: name.trim(), description: description.trim(), permissions })}
            >
              Save role
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
