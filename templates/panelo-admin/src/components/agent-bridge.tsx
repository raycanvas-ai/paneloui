"use client";

import { useEffect } from "react";

import { createAgent, registerTools } from "@ui-sdk/react/agent";

/**
 * Connects every ui-sdk control on the page to agents: `window.agent` for scripts and tests,
 * and WebMCP tools for browsers that expose `document.modelContext`.
 */
export function AgentBridge() {
  useEffect(() => {
    const agent = createAgent();
    Object.assign(window, { agent });
    // Steps on controls marked `data-agent-confirm` wait for the person; everything else runs.
    return registerTools(agent, { allow: (step) => !step.confirm });
  }, []);
  return null;
}
