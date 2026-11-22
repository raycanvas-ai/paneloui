import { format, subDays, subHours, subMinutes } from "date-fns";
import { CircleCheck, CircleX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function getEvents(now: Date) {
  return [
    {
      id: 1,
      at: subMinutes(now, 12),
      method: "Password + authenticator",
      location: "Bengaluru, IN",
      ip: "106.51.72.14",
      ok: true,
    },
    { id: 2, at: subHours(now, 2), method: "Panelo for iOS", location: "Bengaluru, IN", ip: "49.207.180.3", ok: true },
    { id: 3, at: subDays(now, 1), method: "Password", location: "Lagos, NG", ip: "102.89.34.117", ok: false },
    { id: 4, at: subDays(now, 3), method: "Security key", location: "Singapore, SG", ip: "116.88.42.201", ok: true },
    { id: 5, at: subDays(now, 6), method: "Google SSO", location: "Bengaluru, IN", ip: "106.51.72.14", ok: true },
  ];
}

export function LoginHistory() {
  const events = getEvents(new Date());

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>Login history</CardTitle>
        <CardDescription>Sign-in attempts over the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="pl-4 font-normal text-muted-foreground">Date</TableHead>
              <TableHead className="font-normal text-muted-foreground">Method</TableHead>
              <TableHead className="font-normal text-muted-foreground">Location</TableHead>
              <TableHead className="font-normal text-muted-foreground">IP address</TableHead>
              <TableHead className="pr-4 text-right font-normal text-muted-foreground">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="pl-4 tabular-nums">{format(event.at, "MMM d, h:mm a")}</TableCell>
                <TableCell>{event.method}</TableCell>
                <TableCell className="text-muted-foreground">{event.location}</TableCell>
                <TableCell className="font-mono text-muted-foreground text-xs tabular-nums">{event.ip}</TableCell>
                <TableCell className="pr-4 text-right">
                  {event.ok ? (
                    <Badge className="bg-success/10 text-success">
                      <CircleCheck data-icon="inline-start" />
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <CircleX data-icon="inline-start" />
                      Blocked
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
