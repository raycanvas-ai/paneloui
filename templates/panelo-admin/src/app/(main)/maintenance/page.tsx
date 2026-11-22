import Link from "next/link";

import { cn } from "cn";
import { ArrowUpRight, CircleCheck, CircleDashed, Command } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { APP_CONFIG } from "@/config/app-config";

import { NotifyForm } from "./_components/notify-form";

type TaskStatus = "done" | "running" | "queued";

const tasks: { label: string; time: string; status: TaskStatus }[] = [
  { label: "Snapshot production databases", time: "09:04", status: "done" },
  { label: "Migrate billing ledger to the new schema", time: "09:41", status: "done" },
  { label: "Rebuild search indexes", time: "10:12", status: "running" },
  { label: "Roll out API gateway v3", time: "10:45", status: "queued" },
  { label: "Verify integrations and reopen access", time: "11:15", status: "queued" },
];

const STATUS: Record<TaskStatus, { label: string; className: string }> = {
  done: { label: "Done", className: "text-success" },
  running: { label: "In progress", className: "text-info" },
  queued: { label: "Queued", className: "text-muted-foreground" },
};

export default function MaintenancePage() {
  const done = tasks.filter((task) => task.status === "done").length;
  // A running task counts as half done so the bar moves while work is underway.
  const progress = Math.round(((done + 0.5) / tasks.length) * 100);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <div className="animate-stage stage-0 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Command className="size-4" aria-hidden="true" />
          </span>
          <span className="font-semibold text-base tracking-[-0.3px]">{APP_CONFIG.name}</span>
        </div>

        <div className="animate-stage stage-1 flex flex-col gap-3">
          <Badge className="bg-warning/10 text-warning">Scheduled maintenance</Badge>
          <h1 className="font-medium text-3xl leading-tight tracking-tight sm:text-4xl">
            We&apos;re upgrading {APP_CONFIG.name}
          </h1>
          <p className="text-muted-foreground">
            We&apos;re moving to faster database infrastructure. Your data is safe and nothing is lost. The app is read
            only until the upgrade finishes.
          </p>
        </div>

        <section
          aria-labelledby="maintenance-progress"
          className="animate-stage stage-2 flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="maintenance-progress" className="font-medium text-sm">
                Expected back by 11:30 UTC
              </h2>
              <p className="text-muted-foreground text-xs tabular-nums">Window 09:00 – 11:30 UTC</p>
            </div>
            <span className="font-medium text-2xl leading-none tracking-tight tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} aria-label="Maintenance progress" />

          <ol className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <li key={task.label} className="flex items-center gap-3 text-sm">
                <span className={cn("grid size-4 shrink-0 place-items-center", STATUS[task.status].className)}>
                  {task.status === "done" && <CircleCheck className="size-4" aria-hidden="true" />}
                  {task.status === "running" && <Spinner className="size-4" aria-hidden="true" />}
                  {task.status === "queued" && <CircleDashed className="size-4" aria-hidden="true" />}
                </span>
                <span className={cn("flex-1", task.status === "queued" && "text-muted-foreground")}>{task.label}</span>
                <span className={cn("text-xs", STATUS[task.status].className)}>{STATUS[task.status].label}</span>
                <span className="w-10 text-right text-muted-foreground text-xs tabular-nums">{task.time}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="animate-stage stage-3">
          <NotifyForm />
        </div>

        <p className="animate-stage stage-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
          <Link
            prefetch={false}
            href="/dashboard/help#status"
            className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
          >
            System status
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
          <a href="mailto:support@panelo.dev" className="underline-offset-4 hover:underline">
            support@panelo.dev
          </a>
        </p>
      </div>
    </main>
  );
}
