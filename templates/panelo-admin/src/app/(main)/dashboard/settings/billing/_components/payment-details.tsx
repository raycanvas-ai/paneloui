import { Plus } from "lucide-react";
import { siVisa } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PaymentDetails() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>Charged automatically at renewal.</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">
              <Plus data-icon="inline-start" />
              Add
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="grid h-9 w-12 shrink-0 place-items-center rounded-md border bg-background">
              <SimpleIcon icon={siVisa} className="size-7 fill-foreground" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="flex items-center gap-2 font-medium text-sm">
                Visa ending in <span className="tabular-nums">4242</span>
                <Badge variant="secondary">Default</Badge>
              </p>
              <p className="text-muted-foreground text-xs tabular-nums">Expires 08/2028</p>
            </div>
            <Button size="sm" variant="ghost">
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing contact</CardTitle>
          <CardDescription>Invoices and receipts go here.</CardDescription>
          <CardAction>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[6rem_minmax(0,1fr)] gap-y-2 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate">billing@panelo.studio</dd>
            <dt className="text-muted-foreground">Company</dt>
            <dd>Panelo Studio Pvt. Ltd.</dd>
            <dt className="text-muted-foreground">Tax ID</dt>
            <dd className="tabular-nums">GSTIN 29ABCDE1234F1Z5</dd>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
