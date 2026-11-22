import { Fragment } from "react";

import { Check, Minus } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { comparison, plans, RECOMMENDED_PLAN } from "./pricing-data";

function Value({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <>
        <Check aria-hidden="true" className="mx-auto size-4 text-primary" />
        <span className="sr-only">Included</span>
      </>
    );
  }

  if (value === false) {
    return (
      <>
        <Minus aria-hidden="true" className="mx-auto size-4 text-muted-foreground/60" />
        <span className="sr-only">Not included</span>
      </>
    );
  }

  return <span className="tabular-nums">{value}</span>;
}

export function PlanComparison() {
  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="pb-4">
        <CardTitle className="font-normal">Compare plans</CardTitle>
        <CardDescription>Every plan includes unlimited tasks, calendar sync and the mobile apps.</CardDescription>
      </CardHeader>
      <Table className="min-w-[36rem] table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-2/5 pl-4">Feature</TableHead>
            {plans.map((plan) => (
              <TableHead
                key={plan.id}
                className={
                  plan.id === RECOMMENDED_PLAN ? "text-center text-primary last:pr-4" : "text-center last:pr-4"
                }
              >
                {plan.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparison.map((section) => (
            <Fragment key={section.group}>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableCell colSpan={plans.length + 1} className="pl-4 font-medium text-muted-foreground text-xs">
                  {section.group}
                </TableCell>
              </TableRow>
              {section.rows.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="whitespace-normal pl-4">{row.feature}</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.id} className="text-center last:pr-4">
                      <Value value={row.values[plan.id]} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
