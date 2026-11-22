import { KeyRound, MessageSquareText, ShieldCheck, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";

const methods = [
  {
    id: "totp",
    title: "Authenticator app",
    description: "1Password · added Mar 4, 2026",
    icon: Smartphone,
    enabled: true,
    action: "Reconfigure",
  },
  {
    id: "passkey",
    title: "Security key",
    description: "YubiKey 5C NFC · last used yesterday",
    icon: KeyRound,
    enabled: true,
    action: "Manage",
  },
  {
    id: "sms",
    title: "Text message",
    description: "Less secure. Use as a fallback only.",
    icon: MessageSquareText,
    enabled: false,
    action: "Set up",
  },
];

export function TwoFactorCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>Required for every owner and admin in Panelo Studio.</CardDescription>
        <CardAction>
          <Badge className="bg-success/10 text-success">
            <ShieldCheck data-icon="inline-start" />
            Enabled
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <ItemGroup className="gap-2">
          {methods.map((method) => (
            <Item key={method.id} variant="outline" size="sm">
              <ItemMedia>
                <div className="grid size-9 place-items-center rounded-md border bg-background">
                  <method.icon aria-hidden="true" className="size-4 text-muted-foreground" />
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {method.title}
                  {method.enabled ? (
                    <span className="font-normal text-success text-xs">Active</span>
                  ) : (
                    <span className="font-normal text-muted-foreground text-xs">Not set up</span>
                  )}
                </ItemTitle>
                <ItemDescription>{method.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="sm" variant={method.enabled ? "ghost" : "outline"}>
                  {method.action}
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>

        <div className="flex flex-col gap-2 rounded-lg bg-muted/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground tabular-nums">8 of 10</span> recovery codes left
          </p>
          <Button size="sm" variant="outline">
            View recovery codes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
