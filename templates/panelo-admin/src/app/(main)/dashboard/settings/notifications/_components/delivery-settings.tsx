"use client";

import { useState } from "react";

import { Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";

const digestOptions = [
  { value: "off", label: "Off" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

export function DeliverySettings() {
  const [digest, setDigest] = useState("daily");
  const [quietHours, setQuietHours] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery</CardTitle>
        <CardDescription>Batch low-priority updates and silence alerts outside working hours.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <p id="digest-label" className="font-medium text-sm">
              Email digest
            </p>
            <p className="text-muted-foreground text-sm">A summary of everything you didn't open.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Concentric radius: rounded-lg (10px) outer with p-1 (4px) → rounded-sm (6px) segments. */}
            <div role="radiogroup" aria-labelledby="digest-label" className="inline-flex rounded-lg bg-muted p-1">
              {digestOptions.map((option) => (
                <label
                  key={option.value}
                  className="relative cursor-pointer rounded-sm px-3 py-1 font-medium text-muted-foreground text-sm transition-[background-color,color,box-shadow] duration-150 ease-out hover:text-foreground has-checked:bg-background has-checked:text-foreground has-checked:shadow-xs has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
                >
                  <input
                    type="radio"
                    name="digest"
                    value={option.value}
                    checked={digest === option.value}
                    onChange={() => setDigest(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <NativeSelect aria-label="Digest delivery time" size="sm" defaultValue="08:00" disabled={digest === "off"}>
              <NativeSelectOption value="07:00">7:00 AM</NativeSelectOption>
              <NativeSelectOption value="08:00">8:00 AM</NativeSelectOption>
              <NativeSelectOption value="17:00">5:00 PM</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="quiet-hours" className="gap-1.5">
                <Moon aria-hidden="true" className="size-4 text-muted-foreground" />
                Quiet hours
              </FieldLabel>
              <FieldDescription>
                Push and in-app alerts wait until the window ends. Mentions still get through.
              </FieldDescription>
            </FieldContent>
            <Switch id="quiet-hours" checked={quietHours} onCheckedChange={setQuietHours} />
          </Field>

          <fieldset disabled={!quietHours} className="grid gap-4 disabled:opacity-50 sm:grid-cols-3">
            <legend className="sr-only">Quiet hours window</legend>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="quiet-from">From</FieldLabel>
              <Input id="quiet-from" type="time" defaultValue="20:00" className="tabular-nums" />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="quiet-to">To</FieldLabel>
              <Input id="quiet-to" type="time" defaultValue="08:00" className="tabular-nums" />
            </Field>
            <Field className="gap-1.5">
              <FieldLabel htmlFor="quiet-days">Applies on</FieldLabel>
              <NativeSelect id="quiet-days" className="w-full" defaultValue="weekdays">
                <NativeSelectOption value="everyday">Every day</NativeSelectOption>
                <NativeSelectOption value="weekdays">Weekdays</NativeSelectOption>
                <NativeSelectOption value="weekends">Weekends</NativeSelectOption>
              </NativeSelect>
            </Field>
          </fieldset>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <p className="text-muted-foreground text-xs">Times use India Standard Time (GMT+05:30).</p>
        <Button onClick={() => toast.success("Notification preferences saved")}>Save preferences</Button>
      </CardFooter>
    </Card>
  );
}
