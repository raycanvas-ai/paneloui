import { handleAuth } from "@/lib/server/auth";

// Sign-in, callbacks, session and sign-out, all handled by Auth.js.
export const GET = handleAuth;
export const POST = handleAuth;
