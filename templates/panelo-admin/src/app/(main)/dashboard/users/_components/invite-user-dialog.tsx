"use client";
import * as React from "react";

import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { filters, type UserRow, type UserTeam } from "./data";

const roles = filters.role.slice(1);
const teams = filters.team.slice(1) as UserTeam[];

/** "ada.lovelace@x.dev" -> "Ada Lovelace", so the roster reads consistently. */
function nameFromEmail(email: string) {
  return (
    email
      .split("@")[0]
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ") || email
  );
}

export function InviteUserDialog({
  taken,
  onInvite,
}: {
  readonly taken: string[];
  readonly onInvite: (user: UserRow) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState(roles[5] ?? roles[0]);
  const [team, setTeam] = React.useState<UserTeam>(teams[0]);
  const [error, setError] = React.useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid work email address.");
      return;
    }
    if (taken.includes(value)) {
      setError("That person is already on the roster.");
      return;
    }

    onInvite({
      name: nameFromEmail(value),
      email: value,
      role,
      status: "Pending invite",
      team,
      workspace: ["Panelo HQ"],
      joinedDate: format(new Date(), "dd MMM yyyy, h:mm a"),
      lastActive: Number.POSITIVE_INFINITY,
    });

    setEmail("");
    setError(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Invite people
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Invite people</DialogTitle>
            <DialogDescription>They land on the roster as a pending invite until they accept.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Work email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                aria-invalid={error !== null}
              />
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="invite-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="invite-team">Team</Label>
                <Select value={team} onValueChange={(value) => setTeam(value as UserTeam)}>
                  <SelectTrigger id="invite-team" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
