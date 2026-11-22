"use client";

import { useState } from "react";

import { TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";

const WORKSPACE = "panelo-studio";

export function DangerZone() {
  const [confirmation, setConfirmation] = useState("");
  const confirmed = confirmation === WORKSPACE;

  return (
    <Card className="ring-destructive/25">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-base text-destructive">Danger zone</h2>
          <p className="text-muted-foreground text-sm">These actions are permanent and cannot be undone.</p>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-sm">Transfer ownership</p>
            <p className="text-muted-foreground text-sm">Hand Panelo Studio to another admin. You stay a member.</p>
          </div>
          <Button variant="outline" className="shrink-0">
            Transfer
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-sm">Delete workspace</p>
            <p className="text-muted-foreground text-sm">Removes 14 projects, 128 docs, and access for 23 members.</p>
          </div>

          <AlertDialog onOpenChange={(open) => !open && setConfirmation("")}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="shrink-0">
                Delete workspace
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive">
                  <TriangleAlert />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete Panelo Studio?</AlertDialogTitle>
                <AlertDialogDescription>
                  All projects, docs, and billing history are deleted immediately. Members lose access right away.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Field className="gap-1.5">
                <FieldLabel htmlFor="delete-confirmation" className="font-normal text-muted-foreground">
                  Type <span className="font-medium font-mono text-foreground">{WORKSPACE}</span> to confirm
                </FieldLabel>
                <Input
                  id="delete-confirmation"
                  autoComplete="off"
                  spellCheck={false}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </Field>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={!confirmed}
                  onClick={() => toast.error("Workspace deletion is disabled in this demo.")}
                >
                  Delete permanently
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
