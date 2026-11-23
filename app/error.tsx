"use client";

import { LoadError, useReloadOnStaleChunk } from "@/components/application/site/load-error";

/** Any page's error boundary: a stale chunk after a deploy reloads itself; other errors get the message. */
export default function PageError({ error }: { error: Error & { digest?: string } }) {
  return <LoadError reloading={useReloadOnStaleChunk(error)} />;
}
