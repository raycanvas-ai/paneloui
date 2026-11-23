import type { Metadata } from "next";

import { AgentDemo } from "@/components/application/site/agent-demo";

export const metadata: Metadata = {
  title: "Agent demo",
  description: "A live dashboard an AI agent operates through Vercel's UI SDK: it reads the page and acts through the same controls you click.",
};

export default function AgentDemoPage() {
  return <AgentDemo />;
}
