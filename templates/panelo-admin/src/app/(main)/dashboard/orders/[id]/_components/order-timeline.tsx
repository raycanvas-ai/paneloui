import { cn } from "cn";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getOrderTimeline, type Order, type TimelineState } from "../../_components/orders-data";

const dotClasses: Record<TimelineState, string> = {
  done: "bg-success-solid",
  current: "bg-primary ring-4 ring-primary/15",
  upcoming: "bg-background ring-1 ring-border",
  failed: "bg-destructive",
};

const stateLabels: Record<TimelineState, string> = {
  done: "Completed",
  current: "In progress",
  upcoming: "Not started",
  failed: "Reversed",
};

export function OrderTimeline({ order }: { order: Order }) {
  const events = getOrderTimeline(order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col">
          {events.map((event, index) => (
            <li key={event.title} className="relative flex gap-3 pb-5 last:pb-0">
              {index < events.length - 1 && (
                <span aria-hidden="true" className="absolute top-4 bottom-0 left-[4.5px] w-px bg-border" />
              )}
              <span
                aria-hidden="true"
                className={cn("relative mt-1.5 size-2.5 shrink-0 rounded-full", dotClasses[event.state])}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className={cn("font-medium text-sm", event.state === "upcoming" && "text-muted-foreground")}>
                    {event.title}
                    <span className="sr-only">, {stateLabels[event.state]}</span>
                  </span>
                  {event.at && (
                    <time dateTime={event.at.toISOString()} className="text-muted-foreground text-xs tabular-nums">
                      {format(event.at, "d MMM, h:mm a")}
                    </time>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{event.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
