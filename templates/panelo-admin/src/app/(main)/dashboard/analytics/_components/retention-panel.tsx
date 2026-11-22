import { cn } from "cn";
import { Repeat } from "lucide-react";

import { PANEL, PanelHead } from "@/app/(main)/dashboard/default/_components/overview/overview-chrome";

import { cohorts } from "./analytics-data";

/** Week numbers as values, not render indexes, so they make stable keys. */
const WEEKS = Array.from({ length: Math.max(...cohorts.map((cohort) => cohort.retained.length)) }, (_, week) => week);

/** One hue, weight by retention, so the heatmap reads in light, dark and every preset. */
function tint(percent: number) {
  return `color-mix(in oklab, var(--tone-primary) ${Math.round(12 + (percent / 100) * 78)}%, transparent)`;
}

export function RetentionPanel() {
  const weekOne = Math.round(
    cohorts.slice(0, -1).reduce((sum, cohort) => sum + cohort.retained[1], 0) / (cohorts.length - 1),
  );

  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col gap-4 p-4 sm:p-5")}>
      <PanelHead
        icon={<Repeat className="size-4 text-muted-foreground" strokeWidth={1.8} />}
        title="Weekly retention"
      />

      <p className="font-semibold text-2xl tabular-nums tracking-tight">
        {weekOne}% <span className="font-normal text-base text-muted-foreground">come back in week 1</span>
      </p>

      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[460px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="px-1 text-left font-normal">
                Cohort
              </th>
              {WEEKS.map((week) => (
                <th key={week} scope="col" className="font-normal">
                  Week {week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr key={cohort.week}>
                <th scope="row" className="whitespace-nowrap px-1 text-left font-normal">
                  {cohort.week}
                  <span className="ml-1.5 text-muted-foreground tabular-nums">
                    {cohort.size.toLocaleString("en-US")}
                  </span>
                </th>
                {WEEKS.map((week) => {
                  const value = cohort.retained[week];
                  return (
                    <td key={week} className="p-0">
                      {value === undefined ? (
                        <span className="block h-8 rounded-md bg-muted/40">
                          <span className="sr-only">Not yet available</span>
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "flex h-8 items-center justify-center rounded-md font-medium tabular-nums",
                            value >= 70 ? "text-primary-foreground" : "text-foreground",
                          )}
                          style={{ background: tint(value) }}
                        >
                          {value}%
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
