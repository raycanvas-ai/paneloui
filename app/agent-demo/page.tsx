import type { Metadata } from "next";

import { AgentDemo } from "@/components/application/site/agent-demo";
import { pageMeta } from "@/components/application/site/seo";

export const metadata: Metadata = pageMeta(
  "/agent-demo",
  "AI Agent Dashboard Demo on Vercel's UI SDK",
  "Try a live React dashboard an AI agent operates: it reads the page and acts through the same controls you click, and asks before anything destructive.",
);

export default function AgentDemoPage() {
  return <AgentDemo />;
}
