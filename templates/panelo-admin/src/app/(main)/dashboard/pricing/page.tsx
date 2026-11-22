import { Headset } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PlanComparison } from "./_components/plan-comparison";
import { PricingFaq } from "./_components/pricing-faq";
import { PricingPlans } from "./_components/pricing-plans";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
            Plans & Pricing
          </h1>
          <p className="text-muted-foreground text-sm">
            Pick the plan that fits your team. Upgrade, downgrade or cancel at any time.
          </p>
        </div>
        <Button size="sm" variant="outline">
          <Headset data-icon="inline-start" />
          Talk to sales
        </Button>
      </div>

      <PricingPlans />
      <PlanComparison />
      <PricingFaq />
    </div>
  );
}
