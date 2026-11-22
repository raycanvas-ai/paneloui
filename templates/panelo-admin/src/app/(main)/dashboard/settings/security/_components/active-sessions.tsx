"use client";

import { useState } from "react";

import { Laptop, Monitor, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { toast } from "@/components/ui/sonner";

const initialSessions = [
  {
    id: "s1",
    device: "MacBook Pro",
    client: "Chrome 141 on macOS",
    location: "Bengaluru, India",
    ip: "106.51.72.14",
    lastActive: "Active now",
    icon: Laptop,
    current: true,
  },
  {
    id: "s2",
    device: "iPhone 17",
    client: "Panelo for iOS 4.2",
    location: "Bengaluru, India",
    ip: "49.207.180.3",
    lastActive: "2 hours ago",
    icon: Smartphone,
    current: false,
  },
  {
    id: "s3",
    device: "Windows desktop",
    client: "Edge 140 on Windows 11",
    location: "Singapore",
    ip: "116.88.42.201",
    lastActive: "3 days ago",
    icon: Monitor,
    current: false,
  },
];

export function ActiveSessions() {
  const [sessions, setSessions] = useState(initialSessions);
  const others = sessions.filter((session) => !session.current);

  function revoke(id: string) {
    const session = sessions.find((item) => item.id === id);
    setSessions((items) => items.filter((item) => item.id !== id));
    toast.success(`Signed out of ${session?.device ?? "session"}`);
  }

  function revokeOthers() {
    setSessions((items) => items.filter((item) => item.current));
    toast.success("Signed out of all other sessions");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>Devices currently signed in to your account.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline" disabled={others.length === 0} onClick={revokeOthers}>
            Sign out others
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col">
          {sessions.map((session, index) => (
            <div key={session.id}>
              {index > 0 && <ItemSeparator />}
              <Item size="sm" className="px-0">
                <ItemMedia>
                  <div className="grid size-9 place-items-center rounded-md border bg-background">
                    <session.icon aria-hidden="true" className="size-4 text-muted-foreground" />
                  </div>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {session.device}
                    {session.current && <Badge className="bg-primary/10 text-primary">This device</Badge>}
                  </ItemTitle>
                  <ItemDescription className="text-xs">
                    {session.client} · {session.location} · <span className="tabular-nums">{session.ip}</span>
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="gap-3">
                  <span
                    className={
                      session.current ? "text-success text-xs" : "whitespace-nowrap text-muted-foreground text-xs"
                    }
                  >
                    {session.lastActive}
                  </span>
                  {!session.current && (
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Revoke ${session.device}`}
                      onClick={() => revoke(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </ItemActions>
              </Item>
            </div>
          ))}
        </div>

        {others.length === 0 && (
          <p className="animate-stage mt-2 rounded-lg bg-muted/60 px-3 py-2.5 text-muted-foreground text-sm">
            No other active sessions. Only this device is signed in.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
