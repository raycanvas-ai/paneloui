import type { PostHog } from "posthog-js";

/**
 * Panelo's PostHog project (US cloud, project 766310). The token is public by design: it can send
 * events but never read them, so it lives in code rather than in build-time env plumbing.
 */
export const POSTHOG_KEY = "phc_B7oMudNCHv5Hx26MbqVywZZ5nCe5Wokm2376wuSdLqZx";

let client: Promise<PostHog> | undefined;

/**
 * Loads PostHog (~120 kB gzipped) once the page is idle, so it never sits in the first-load bundle or
 * delays hydration. posthog-js/slim with only the extensions used here measured no smaller: Turbopack
 * can't tree-shake its extension bundle, which has no `sideEffects: false`.
 * Production only (dev would pollute the data). Never inside an iframe: the catalogue frames /preview
 * pages, which would multiply pageviews, and same-origin frames still show in the parent's replay.
 * Never under automation either (Playwright sets navigator.webdriver).
 */
export function startAnalytics() {
  if (process.env.NODE_ENV !== "production" || window.self !== window.top || navigator.webdriver) return;
  const load = () => {
    client = import("posthog-js").then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        // First-party: Caddy forwards /ingest to PostHog (deploy/Caddyfile), so ad blockers don't drop it.
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        defaults: "2026-08-30",
        // Every visitor gets a profile, so returning anonymous visitors and their first-touch UTM/referrer
        // are kept for funnels and cohorts. Traffic is small; revisit if the event bill matters.
        person_profiles: "always",
        capture_pageview: "history_change",
        capture_pageleave: true,
        capture_exceptions: true,
        capture_dead_clicks: true,
        enable_heatmaps: true,
        capture_performance: { web_vitals: true, network_timing: true },
        // Replays mask every input; `.ph-no-capture` blocks licence keys and the account email entirely.
        session_recording: { maskAllInputs: true },
        // Not used, so their scripts are never fetched.
        disable_surveys: true,
        disable_product_tours: true,
        loaded: (ph) => {
          // Lets every event be split by release, so a landing-page change shows up as a before/after.
          ph.register({ deploy: process.env.NEXT_PUBLIC_DEPLOY_ID, theme: document.documentElement.classList.contains("dark") ? "dark" : "light" });
        },
      });
      return posthog;
    });
  };
  // Safari has no requestIdleCallback; the timeout caps how long a busy page can hold analytics back.
  if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 2000 });
  else setTimeout(load, 1500);
}

/** A named event. A no-op until PostHog loads, and always outside production. */
export function track(event: string, properties?: Record<string, unknown>) {
  void client?.then((ph) => ph.capture(event, properties));
}

/** Ties this browser's history to the signed-in account; the server already merged the sign-in itself. */
export function identify(user: { id: string; email?: string | null; name?: string | null }, properties?: Record<string, unknown>) {
  void client?.then((ph) => ph.identify(user.id, { email: user.email, name: user.name, ...properties }));
}

/** On sign-out, so the next person on this browser starts as a new visitor. */
export function resetAnalytics() {
  void client?.then((ph) => ph.reset());
}

/** Errors that React error boundaries catch never reach window.onerror, so the boundaries report them. */
export function captureError(error: Error, properties?: Record<string, unknown>) {
  void client?.then((ph) => ph.captureException(error, properties));
}
