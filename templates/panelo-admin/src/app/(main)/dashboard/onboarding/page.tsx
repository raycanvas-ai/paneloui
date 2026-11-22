import Link from "next/link";

import { Button } from "@/components/ui/button";

import { OnboardingFlow } from "./_components/onboarding-flow";

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          {/* First-run is a once-per-workspace moment, so the header gets a staged entrance. */}
          <h1 className="animate-stage font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
            Set up Panelo Studio
          </h1>
          <p className="animate-stage stage-1 text-muted-foreground text-sm">
            Four quick steps to get your team working together. Most people finish in about five minutes.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="animate-stage stage-1 self-start">
          <Link href="/dashboard/default" prefetch={false}>
            Skip for now
          </Link>
        </Button>
      </div>

      <OnboardingFlow />
    </div>
  );
}
