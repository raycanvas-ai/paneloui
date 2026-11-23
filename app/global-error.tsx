"use client";

import "@/styles/globals.css";

import { LoadError, useReloadOnStaleChunk } from "@/components/application/site/load-error";

/** The root layout's own boundary: replaces the whole document, so it brings its html and body. */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  const reloading = useReloadOnStaleChunk(error);
  return (
    <html lang="en-US">
      <body>
        <LoadError reloading={reloading} />
      </body>
    </html>
  );
}
