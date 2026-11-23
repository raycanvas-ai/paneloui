"use client";

import { useEffect, useState } from "react";

// After a deploy, a tab opened on the previous build can ask for a JavaScript chunk the new build no
// longer has. That isn't a bug in the page: the right answer is to load the current build. So a failed
// chunk reloads once by itself; anything else (or a second failure within a minute) shows the message.
const CHUNK_FAILURE = /ChunkLoadError|Loading (CSS )?chunk|Failed to load chunk|dynamically imported module|Importing a module script failed/i;
const KEY = "panelo:reloaded-for-chunk";

export function useReloadOnStaleChunk(error: Error) {
  const [reloading, setReloading] = useState(false);
  useEffect(() => {
    if (!CHUNK_FAILURE.test(`${error.name} ${error.message}`)) return;
    try {
      const last = Number(sessionStorage.getItem(KEY) ?? 0);
      if (Date.now() - last < 60_000) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      // No storage: still reload once; the loop guard is lost, not the fix.
    }
    setReloading(true);
    window.location.reload();
  }, [error]);
  return reloading;
}

/** The message both error boundaries show, in plain tokens so it works inside previews and the site alike. */
export function LoadError({ reloading }: { reloading: boolean }) {
  return (
    <div role="alert" className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background-primary-default p-6 text-center font-sans text-text-primary">
      <p className="text-title-3-semibold">{reloading ? "Loading the latest version…" : "This page couldn't load"}</p>
      {!reloading && (
        <>
          <p className="text-body-regular text-text-secondary">Reload to try again, or go back.</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-9 cursor-pointer rounded-lg bg-text-primary px-4 text-body-medium text-background-primary-default outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="h-9 cursor-pointer rounded-lg border border-border-button-default px-4 text-body-medium text-text-primary outline-none hover:border-border-button-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
