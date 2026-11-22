"use client";

import { useState } from "react";

import { KeyRound } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { toast } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { type ApiKey, CreateKeyDialog } from "./create-key-dialog";

const initialKeys: ApiKey[] = [
  {
    id: "k1",
    name: "Production backend",
    prefix: "pnl_live_",
    lastFour: "3f9a",
    scopes: ["projects:read", "projects:write"],
    createdAt: "Mar 12, 2026",
    lastUsed: "4 minutes ago",
  },
  {
    id: "k2",
    name: "Zapier sync",
    prefix: "pnl_live_",
    lastFour: "b21c",
    scopes: ["projects:read", "members:read"],
    createdAt: "Jun 2, 2026",
    lastUsed: "Yesterday",
  },
  {
    id: "k3",
    name: "Finance export",
    prefix: "pnl_live_",
    lastFour: "08de",
    scopes: ["billing:read"],
    createdAt: "Aug 28, 2026",
    lastUsed: null,
  },
];

export function ApiKeysTable() {
  const [keys, setKeys] = useState(initialKeys);

  function revoke(key: ApiKey) {
    setKeys((current) => current.filter((item) => item.id !== key.id));
    toast.success(`Revoked “${key.name}”`, { description: "Requests using this key now return 401." });
  }

  return (
    <Card className={keys.length > 0 ? "pb-0" : undefined}>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <CardDescription>
          <span className="tabular-nums">{keys.length}</span> of 10 keys in use
        </CardDescription>
        <CardAction>
          <CreateKeyDialog onCreate={(key) => setKeys((current) => [key, ...current])} />
        </CardAction>
      </CardHeader>

      <CardContent className={keys.length > 0 ? "px-0" : undefined}>
        {keys.length === 0 ? (
          <Empty className="border">
            <EmptyHeader className="animate-stage">
              <EmptyMedia variant="icon">
                <KeyRound />
              </EmptyMedia>
              <EmptyTitle>No API keys</EmptyTitle>
              <EmptyDescription>Create a key to connect Panelo to your backend, Zapier, or CI.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="animate-stage stage-1">
              <CreateKeyDialog onCreate={(key) => setKeys([key])} />
            </EmptyContent>
          </Empty>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-4 font-normal text-muted-foreground">Name</TableHead>
                <TableHead className="font-normal text-muted-foreground">Key</TableHead>
                <TableHead className="font-normal text-muted-foreground">Scopes</TableHead>
                <TableHead className="font-normal text-muted-foreground">Created</TableHead>
                <TableHead className="font-normal text-muted-foreground">Last used</TableHead>
                <TableHead className="pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="pl-4 font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs">
                      {key.prefix}
                      <span aria-hidden="true">••••</span>
                      <span className="sr-only">ending in </span>
                      {key.lastFour}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {key.scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="font-mono font-normal">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{key.createdAt}</TableCell>
                  <TableCell className={key.lastUsed ? "tabular-nums" : "text-muted-foreground"}>
                    {key.lastUsed ?? "Never"}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          Revoke
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke “{key.name}”?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Any integration using this key stops working immediately. This can't be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction variant="destructive" onClick={() => revoke(key)}>
                            Revoke key
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
