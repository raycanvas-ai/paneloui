"use client";

import { useState } from "react";

import { cn } from "cn";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { CURRENT_PLAN, type Plan, plans, RECOMMENDED_PLAN } from "./pricing-data";

type Billing = "monthly" | "annual";

const maxSavings = Math.max(...plans.map((plan) => Math.round((1 - plan.annual / plan.monthly) * 100)));
const currentIndex = plans.findIndex((plan) => plan.id === CURRENT_PLAN);

// Segmented control: rounded-lg (10px) track with p-1 (4px) holds rounded-sm (6px) segments.
const segment =
  "h-7 rounded-sm px-3 text-muted-foreground transition-[background-color,color,box-shadow] duration-150 ease-out hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm";

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          spacing={1}
          value={billing}
          onValueChange={(value) => value && setBilling(value as Billing)}
          aria-label="Billing period"
          className="rounded-lg bg-muted p-1"
        >
          <ToggleGroupItem value="monthly" className={segment}>
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem value="annual" className={segment}>
            Annual
          </ToggleGroupItem>
        </ToggleGroup>
        <Badge className="bg-success/10 text-success tabular-nums">Save up to {maxSavings}% with annual billing</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <PlanCard key={plan.id} plan={plan} billing={billing} index={index} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, billing, index }: { plan: Plan; billing: Billing; index: number }) {
  const recommended = plan.id === RECOMMENDED_PLAN;
  const current = plan.id === CURRENT_PLAN;
  const price = billing === "annual" ? plan.annual : plan.monthly;
  const yearlySavings = (plan.monthly - plan.annual) * 12;
  const action = index > currentIndex ? "Upgrade" : "Downgrade";

  return (
    <Card className={cn("gap-6", recommended && "ring-2 ring-primary")}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{plan.name}</CardTitle>
          {recommended && <Badge>Most popular</Badge>}
          {current && <Badge variant="outline">Current plan</Badge>}
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl tabular-nums leading-none tracking-tight">${price}</span>
            <span className="text-muted-foreground text-sm">/ seat / month</span>
          </div>
          <p className="text-muted-foreground text-xs tabular-nums">
            {billing === "annual" ? (
              <>
                Billed ${plan.annual * 12} yearly · <span className="text-success">save ${yearlySavings}</span>
              </>
            ) : (
              <>Billed monthly · ${plan.annual} with annual billing</>
            )}
          </p>
        </div>

        <ul className="flex flex-col gap-2.5">
          {plan.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-2 text-sm">
              <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
              {highlight}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto border-t-0 bg-transparent pt-0">
        <Button
          className="w-full"
          variant={recommended ? "default" : "outline"}
          disabled={current}
          onClick={() =>
            toast.success(`${action} to ${plan.name} requested`, {
              description: `You'll be billed $${price} per seat, ${billing === "annual" ? "yearly" : "monthly"}.`,
            })
          }
        >
          {current ? "Your current plan" : `${action} to ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
