import { startAnalytics } from "@/lib/analytics";

// Wrapped: a failure to start analytics must never stop the app from starting.
try {
  startAnalytics();
} catch {}
