import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { ActivityLog } from "./_components/activity-log";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
            Activity Log
          </h1>
          <p className="text-muted-foreground text-sm">
            Every sign-in, permission change and configuration update across the Panelo workspace.
          </p>
        </div>
        <Badge variant="outline" className="h-auto gap-1 rounded-sm px-1.5 py-0.5">
          <ShieldCheck />
          90-day retention
        </Badge>
      </div>

      <ActivityLog />
    </div>
  );
}
