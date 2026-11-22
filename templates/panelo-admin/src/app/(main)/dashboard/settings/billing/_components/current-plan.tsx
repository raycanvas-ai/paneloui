import { cn } from "cn";
import { addDays, format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const usage = [
  { label: "Seats", used: 23, limit: 30, format: (value: number) => value.toString() },
  { label: "Storage", used: 68.4, limit: 100, format: (value: number) => `${value} GB` },
  {
    label: "Automation runs",
    used: 44_870,
    limit: 50_000,
    format: (value: number) => value.toLocaleString("en-US"),
  },
];

export function CurrentPlan() {
  const renewsOn = format(addDays(new Date(), 41), "MMMM d, yyyy");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pro plan
          <Badge variant="outline">Annual</Badge>
        </CardTitle>
        <CardDescription>
          Renews on <span className="text-foreground tabular-nums">{renewsOn}</span>
        </CardDescription>
        <CardAction className="text-right">
          <p className="text-2xl leading-none tracking-tight tabular-nums">
            $1,380<span className="text-muted-foreground text-sm">/yr</span>
          </p>
          <p className="mt-1 text-muted-foreground text-xs tabular-nums">$60 per seat</p>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-5 sm:grid-cols-3">
        {usage.map((item) => {
          const percent = Math.round((item.used / item.limit) * 100);
          const nearLimit = percent >= 80;

          return (
            <div key={item.label} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-muted-foreground text-sm">{item.label}</span>
                <span className={cn("text-xs tabular-nums", nearLimit ? "text-warning" : "text-muted-foreground")}>
                  {percent}%
                </span>
              </div>
              <Progress
                value={percent}
                aria-label={`${item.label} usage`}
                className={cn("h-1.5", nearLimit && "*:data-[slot=progress-indicator]:bg-warning-solid")}
              />
              <p className="text-sm tabular-nums">
                {item.format(item.used)} <span className="text-muted-foreground">of {item.format(item.limit)}</span>
              </p>
              {nearLimit && <p className="text-warning text-xs">Near your limit. Upgrade or add a top-up.</p>}
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <p className="text-muted-foreground text-xs">Need more runs? Business includes 250,000 per month.</p>
        <div className="flex gap-2">
          <Button variant="ghost">Cancel plan</Button>
          <Button>Upgrade</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
