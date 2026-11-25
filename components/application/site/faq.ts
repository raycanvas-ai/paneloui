// The questions the home page answers. Also published as FAQPage structured data (site/seo.tsx) and in
// /llms.txt, so the page, search engines and AI assistants all quote the same answers.

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Who builds Panelo UI?",
    a: "Raycanvas builds Panelo UI, backed by Shadcn Labs. The same team created Ruixen UI and snapcn.",
  },
  {
    q: "What makes Panelo agent-ready?",
    a: "Every control is a part from Vercel's UI SDK. An agent reads the page as a list of named controls and acts through the same component API your clicks use, so it never guesses at pixels. Destructive actions are marked, and the agent has to ask you first.",
  },
  {
    q: "Do I need an AI API key?",
    a: "Not for the components: they are plain React and work without any model. Only the in-app assistant (agent-kit) calls a model: an open model on Groq, with a free key from console.groq.com set as GROQ_API_KEY on your server.",
  },
  {
    q: "How do I install a component?",
    a: "Copy the command on its page, for example npx shadcn@latest add https://www.paneloui.com/r/stats-3.json, in npm, pnpm, yarn or bun. Or install by hand: the Manual tab lists the packages, the tokens and every file. Pro items install from @panelo-pro with your licence key; your account page has the exact lines. Either way the source lands in your project.",
  },
  {
    q: "Does it work in my shadcn/ui project?",
    a: "Yes. Panelo installs with the shadcn CLI into components/panelo-ui, next to your components/ui, so nothing collides.",
  },
  {
    q: "Do I own the code?",
    a: "Yes. It is copied into your repository as source. Change anything.",
  },
  {
    q: "Is Pro a one-time payment?",
    a: "Yes. Pay once, no subscription, and keep the code forever. 1 Year of Updates stops sending new Pro releases after a year; everything you installed stays yours.",
  },
  {
    q: "When do the templates arrive?",
    a: "December 1: three whole-app templates, one free and two in Pro. Every Pro plan includes the Pro ones, plans bought before launch too. 30+ more are in the works, with no dates yet: each ships when it's ready.",
  },
  {
    q: "Can I get a refund?",
    a: "No. All sales are final: Pro is source code, yours the moment you pay. Try the free components, previews and live agent demo first. See the refund policy.",
  },
  {
    q: "Does it support dark mode?",
    a: "Every component, block and template ships light and dark, driven by the same tokens.",
  },
];
