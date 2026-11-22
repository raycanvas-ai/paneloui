import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { CopyButton } from "./copy-button";

const snippet = `curl https://api.panelo.app/v1/projects \\
  -H "Authorization: Bearer $PANELO_API_KEY"`;

export function UsageSnippet() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick start</CardTitle>
        <CardDescription>
          Send the key as a bearer token. Requests are limited to 600 per minute per key.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg border bg-muted/50">
          <pre className="scrollbar-thin overflow-x-auto py-3 pr-12 pl-3 font-mono text-xs leading-relaxed">
            <code>{snippet}</code>
          </pre>
          <CopyButton value={snippet} label="Copy example request" className="absolute top-1.5 right-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}
