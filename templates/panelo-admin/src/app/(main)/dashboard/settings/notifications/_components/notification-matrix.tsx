"use client";

import { useState } from "react";

import { Lock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const channels = ["email", "push", "inApp"] as const;
type Channel = (typeof channels)[number];

const channelLabels: Record<Channel, string> = { email: "Email", push: "Push", inApp: "In-app" };

type EventRow = {
  id: string;
  title: string;
  description: string;
  defaults: Record<Channel, boolean>;
  locked?: Channel[];
};

const groups: { title: string; events: EventRow[] }[] = [
  {
    title: "Projects & tasks",
    events: [
      {
        id: "assigned",
        title: "Assigned to a task",
        description: "Someone gives you ownership of a task.",
        defaults: { email: true, push: true, inApp: true },
      },
      {
        id: "mentioned",
        title: "Mentioned in a comment",
        description: "@mentions in tasks, docs, and threads.",
        defaults: { email: false, push: true, inApp: true },
      },
      {
        id: "due",
        title: "Due date approaching",
        description: "24 hours before a task you own is due.",
        defaults: { email: true, push: false, inApp: true },
      },
    ],
  },
  {
    title: "Workspace",
    events: [
      {
        id: "joined",
        title: "New member joined",
        description: "An invite is accepted in Panelo Studio.",
        defaults: { email: false, push: false, inApp: true },
      },
      {
        id: "integration",
        title: "Integration disconnected",
        description: "Slack, GitHub, or Linear loses access.",
        defaults: { email: true, push: true, inApp: true },
      },
    ],
  },
  {
    title: "Billing",
    events: [
      {
        id: "invoice",
        title: "Invoice available",
        description: "Monthly invoice is ready to download.",
        defaults: { email: true, push: false, inApp: false },
      },
      {
        id: "payment-failed",
        title: "Payment failed",
        description: "Always emailed so your plan isn't interrupted.",
        defaults: { email: true, push: true, inApp: true },
        locked: ["email"],
      },
    ],
  },
];

const initialState = Object.fromEntries(
  groups.flatMap((group) => group.events.map((event) => [event.id, event.defaults])),
) as Record<string, Record<Channel, boolean>>;

export function NotificationMatrix() {
  const [prefs, setPrefs] = useState(initialState);

  function toggle(eventId: string, channel: Channel, value: boolean) {
    setPrefs((current) => ({ ...current, [eventId]: { ...current[eventId], [channel]: value } }));
  }

  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="pb-(--card-spacing)">
        <CardTitle>Notify me about</CardTitle>
        <CardDescription>Choose where each kind of update reaches you.</CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        {groups.map((group, index) => (
          <section key={group.title} aria-labelledby={`notification-group-${index}`}>
            <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,3.5rem)] items-center border-y bg-muted/50 px-4 py-2 sm:grid-cols-[minmax(0,1fr)_repeat(3,4.5rem)]">
              <h3 id={`notification-group-${index}`} className="font-medium text-muted-foreground text-xs">
                {group.title}
              </h3>
              {channels.map((channel) => (
                <span key={channel} aria-hidden="true" className="text-center text-muted-foreground text-xs">
                  {channelLabels[channel]}
                </span>
              ))}
            </div>

            <ul className="divide-y">
              {group.events.map((event) => (
                <li
                  key={event.id}
                  className="grid grid-cols-[minmax(0,1fr)_repeat(3,3.5rem)] items-center px-4 py-3 sm:grid-cols-[minmax(0,1fr)_repeat(3,4.5rem)]"
                >
                  <div className="flex min-w-0 flex-col gap-0.5 pr-2">
                    <span className="font-medium text-sm">{event.title}</span>
                    <span className="text-muted-foreground text-xs">{event.description}</span>
                  </div>
                  {channels.map((channel) => {
                    const locked = event.locked?.includes(channel);
                    return (
                      <div key={channel} className="flex items-center justify-center gap-1">
                        <Switch
                          size="sm"
                          checked={prefs[event.id][channel]}
                          disabled={locked}
                          onCheckedChange={(value) => toggle(event.id, channel, value)}
                          aria-label={`${event.title}: ${channelLabels[channel]}${locked ? " (required)" : ""}`}
                        />
                        {locked && <Lock aria-hidden="true" className="size-3 text-muted-foreground" />}
                      </div>
                    );
                  })}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
