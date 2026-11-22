"use client";

import { useState } from "react";

import Link from "next/link";

import { cn } from "cn";
import { ArrowLeft, ArrowRight, Check, CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { IntegrationsStep, InviteStep, ProfileStep, ProjectStep } from "./step-panels";

const steps = [
  {
    title: "Your profile",
    summary: "Name, role, and focus",
    description: "Tell us how you'll use Panelo so we can tailor your workspace.",
    Panel: ProfileStep,
  },
  {
    title: "Invite your team",
    summary: "Bring in collaborators",
    description: "Panelo works best with the people you ship with. You can always invite more later.",
    Panel: InviteStep,
  },
  {
    title: "Connect tools",
    summary: "Sync where work happens",
    description: "Link the tools your team already uses. Panelo pulls in issues, PRs, and designs.",
    Panel: IntegrationsStep,
  },
  {
    title: "Create a project",
    summary: "Start from a template",
    description: "Pick a starting point. Every template is fully editable once it's created.",
    Panel: ProjectStep,
  },
];

export function OnboardingFlow() {
  // The profile step is filled during sign-up, so a real first run lands on step two.
  const [completed, setCompleted] = useState<Set<number>>(() => new Set([0]));
  const [current, setCurrent] = useState(1);
  const [finished, setFinished] = useState(false);

  const isLast = current === steps.length - 1;
  const { Panel } = steps[current];

  function advance() {
    setCompleted((items) => new Set(items).add(current));
    if (isLast) setFinished(true);
    else setCurrent(current + 1);
  }

  if (finished) {
    return (
      <Card className="items-center px-6 py-12 text-center">
        <div className="animate-stage grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <CircleCheck aria-hidden="true" className="size-6" />
        </div>
        <div className="flex max-w-md flex-col gap-2">
          <h2 className="animate-stage stage-1 font-medium text-xl tracking-tight">Panelo Studio is ready</h2>
          <p className="animate-stage stage-2 text-muted-foreground text-sm">
            Your team has been invited and your first project is set up. Invites expire in 7 days.
          </p>
        </div>
        <div className="animate-stage stage-3 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/kanban" prefetch={false}>
              Open project
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/default" prefetch={false}>
              Go to dashboard
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="animate-stage stage-2 flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step <span className="tabular-nums">{current + 1}</span> of {steps.length}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {completed.size} of {steps.length} complete
          </span>
        </div>
        <Progress value={(completed.size / steps.length) * 100} aria-label="Setup progress" className="h-1.5" />
      </div>

      <div className="animate-stage stage-3 grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="Setup steps">
          <ol className="flex flex-col gap-1">
            {steps.map((step, index) => {
              const done = completed.has(index);
              const active = index === current;

              return (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => setCurrent(index)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.96]",
                      active && "bg-muted hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full border font-medium text-xs tabular-nums",
                        done && "border-success/30 bg-success/10 text-success",
                        !done && active && "border-primary bg-primary text-primary-foreground",
                        !done && !active && "text-muted-foreground",
                      )}
                    >
                      {done ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className={cn("font-medium text-sm", !active && !done && "text-muted-foreground")}>
                        {step.title}
                      </span>
                      <span className="truncate text-muted-foreground text-xs">
                        {done ? "Completed" : step.summary}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{steps[current].title}</CardTitle>
            <CardDescription>{steps[current].description}</CardDescription>
          </CardHeader>
          {/* Keyed so each step replays the staged entrance; steps change a handful of times per workspace. */}
          <CardContent key={current} className="animate-stage">
            <Panel />
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
              <ArrowLeft data-icon="inline-start" />
              Back
            </Button>
            <div className="flex gap-2">
              {!isLast && (
                <Button variant="outline" onClick={() => setCurrent(current + 1)}>
                  Skip
                </Button>
              )}
              <Button onClick={advance}>
                {isLast ? "Finish setup" : "Continue"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
