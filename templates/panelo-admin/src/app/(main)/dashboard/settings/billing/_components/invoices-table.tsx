import { format, subMonths } from "date-fns";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type InvoiceStatus = "paid" | "open" | "refunded";

const statusStyles: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-success/10 text-success" },
  open: { label: "Due", className: "bg-warning/10 text-warning" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground" },
};

function getInvoices(now: Date) {
  return [
    { id: "PNL-2026-0912", date: now, description: "Seat add-on · 3 seats", amount: 180, status: "open" as const },
    {
      id: "PNL-2026-0801",
      date: subMonths(now, 1),
      description: "Pro plan · annual",
      amount: 1380,
      status: "paid" as const,
    },
    {
      id: "PNL-2026-0714",
      date: subMonths(now, 2),
      description: "Automation runs top-up",
      amount: 45,
      status: "paid" as const,
    },
    {
      id: "PNL-2026-0603",
      date: subMonths(now, 3),
      description: "Seat add-on · 2 seats",
      amount: 120,
      status: "refunded" as const,
    },
    {
      id: "PNL-2025-0801",
      date: subMonths(now, 13),
      description: "Pro plan · annual",
      amount: 1200,
      status: "paid" as const,
    },
  ];
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function InvoicesTable() {
  const invoices = getInvoices(new Date());

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Download receipts for your records.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            <Download data-icon="inline-start" />
            Export all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="pl-4 font-normal text-muted-foreground">Invoice</TableHead>
              <TableHead className="font-normal text-muted-foreground">Date</TableHead>
              <TableHead className="font-normal text-muted-foreground">Description</TableHead>
              <TableHead className="text-right font-normal text-muted-foreground">Amount</TableHead>
              <TableHead className="font-normal text-muted-foreground">Status</TableHead>
              <TableHead className="pr-4">
                <span className="sr-only">Download</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="pl-4 font-mono text-xs tabular-nums">{invoice.id}</TableCell>
                <TableCell className="tabular-nums">{format(invoice.date, "MMM d, yyyy")}</TableCell>
                <TableCell className="text-muted-foreground">{invoice.description}</TableCell>
                <TableCell className="text-right tabular-nums">{currency.format(invoice.amount)}</TableCell>
                <TableCell>
                  <Badge className={statusStyles[invoice.status].className}>{statusStyles[invoice.status].label}</Badge>
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Button size="icon-sm" variant="ghost" aria-label={`Download invoice ${invoice.id}`}>
                    <Download />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
