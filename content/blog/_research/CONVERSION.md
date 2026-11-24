# Conversion layer: every post must lead to an install, then to Pro

Goal: every reader leaves with a Panelo item in their project. Free install first, Pro is the second step. Stay honest: only claim what the item really does. Read the item's source in `components/panelo/blocks/**`, or its live JSON at https://www.paneloui.com/r/<slug>.json, before describing it. Pro items: describe only from their catalogue description (llms.txt), never their code.

## The 4 pieces (add to every post, keep everything else)

1. **Frontmatter**: add
   ```yaml
   cta:
     free: [<registry slug>, ...]   # e.g. activity-heatmap
     pro: [<catalogue slug>, ...]   # e.g. dashboard-pages-3
   ```
2. **"Skip the build" box**, placed immediately AFTER the 40–60 word answer paragraph (the answer must stay first for snippets):
   ```md
   > **Skip the build:** [Item Name](https://www.paneloui.com/components/<slug>) is a free, MIT-licensed shadcn/ui block that <does exactly the thing this post explains>. Add it with `npx shadcn@latest add @panelo/<slug>` ([registry setup](https://www.paneloui.com/#install-step-below)), then change anything: the source is yours.
   ```
   Use the real registry setup: `"@panelo": "https://www.paneloui.com/r/{name}.json"` under `registries` in components.json (link the closing section for the snippet instead of a fake anchor). If the post's free item isn't a component (for example `panelo-theme` or `agent-kit`), say what it is truthfully.
3. **One contextual mention inside the body**, at the step where the reader does the hardest or most tedious part. One sentence plus a link, no hard sell.
4. **Closing section before `## FAQ`**: `## Get this working in your app` with:
   - the 2-line components.json registry snippet and the exact `npx shadcn@latest add @panelo/<slug>` command(s);
   - "See it live" links to the catalogue page(s) (and /agent-demo for agent posts);
   - the Pro step: one or two specific Pro pages that extend this exact use case, by name and link, with a one-line honest description from the catalogue, and "Panelo Pro is a one-time payment with no subscription: [see plans](https://www.paneloui.com/#pricing)." Don't state a price number.
   - Agent posts: also "templates launch December 1, 2026" only if relevant (`/templates`).

Rules: no fake urgency, no "best", no testimonials, no invented features. The body must remain useful without Panelo. Keep the post's existing internal links valid; total paneloui.com links may exceed 6 now. Update `wordCount`. No hype words (revolutionary, game-changing, unlock, seamless, delve, leverage, robust).

## Mapping (post → free item(s) → Pro page(s))

| Post | Free | Pro |
|---|---|---|
| vercel-ui-sdk-explained | agent-kit (+ /agent-demo) | dashboard-pages-11 AI Automation Dashboard |
| ui-sdk-vs-ai-sdk | agent-kit | dashboard-pages-11 |
| ui-sdk-react-tutorial | agent-kit | dashboard-pages-11 |
| what-is-agent-ready-ui | agent-kit (+ /agent-demo) | dashboard-pages-11, dashboard-pages-2 AI Workflow Builder |
| computer-use-vs-browser-agents-vs-in-app-agents | agent-kit | dashboard-pages-11 |
| ai-agent-approval-ui | agent-kit | dashboard-pages-11 |
| copilotkit-vs-assistant-ui-vs-ai-elements | agent-kit | dashboard-pages-2 |
| generative-ui-vs-agentic-ui | agent-kit | dashboard-pages-2 |
| webmcp-react-ui-sdk | agent-kit | dashboard-pages-11 |
| is-shadcn-built-on-ui-sdk | agent-kit | dashboard-pages-11 |
| shadcn-heatmap-chart | activity-heatmap | dashboard-pages-3 Overview Analytics |
| shadcn-github-contribution-graph | contribution-chart | dashboard-pages-12 Marketing Analytics |
| shadcn-charts-vs-recharts | revenue-chart | dashboard-pages-3 |
| how-to-create-a-shadcn-registry | revenue-chart (install one to see a production registry) | Pro registry access (@panelo-pro), dashboard-pages-3 |
| shadcn-private-registry-auth | revenue-chart | @panelo-pro access, dashboard-pages-1 Companies CRM Table |
| shadcn-ai-agent-components | agent-kit, elements-2 | dashboard-pages-11 |
| shadcn-dashboard-nextjs-16 | revenue-chart, pie-chart, balance-chart | dashboard-pages-3 |
| shadcn-scheduler-calendar | dashboard-pages-13 Home Care Schedule | calendars-1 Time Tracking, calendars-2 Issue Calendar |
| shadcn-finance-dashboard | balance-chart | dashboard-pages-8 Custom Finance Dashboard |
| shadcn-multi-step-signup-form | login-pages-2 Sign Up Flow | dashboard-pages-5 Project Overview, sidebars-1 App Sidebar |
| best-shadcn-registries | revenue-chart, activity-heatmap | dashboard-pages-3 |
| tremor-alternative | revenue-chart, balance-chart | dashboard-pages-3 |
| tremor-vs-shadcn-charts | revenue-chart | dashboard-pages-3 |
| shadcnblocks-alternative | login-pages-1, revenue-chart | dashboard-pages-1, dashboard-pages-3 |
| react-chart-libraries-for-dashboards | revenue-chart, pie-chart | dashboard-pages-3 |
| tailwind-plus-catalyst-alternative | login-pages-1, revenue-chart | dashboard-pages-5, sidebars-1 |
| shadcn-vs-heroui | login-pages-1, revenue-chart | dashboard-pages-3 |
| shadcn-vs-mantine-dashboards | balance-chart, dashboard-pages-13 | dashboard-pages-3, dashboard-pages-12 |
| recharts-alternative | revenue-chart, pie-chart | dashboard-pages-3 |
| nextjs-ai-agent-dashboard-templates | agent-kit (+ /templates Dec 1) | dashboard-pages-11 |
| github-contribution-graph-react | contribution-chart | dashboard-pages-12 |
| 3d-isometric-contribution-graph-react | contribution-chart, link-graph | dashboard-pages-12 |
| react-punch-card-chart | activity-heatmap | dashboard-pages-12 |
| recharts-dark-mode-tailwind | panelo-theme, revenue-chart | dashboard-pages-3 |
| accessible-charts-react | balance-chart, activity-heatmap | dashboard-pages-3 |
| split-screen-login-page-react | login-pages-1, login-pages-3 | dashboard-pages-5, sidebars-1 |
| shadcn-kpi-cards | sales-trend (chart inside a KPI card; no free KPI card) | dashboard-pages-3, dashboard-pages-12, dashboard-pages-9 |
| tailwind-merge-custom-classes | panelo-theme (+ a block, if verified it ships its own class merging) | dashboard-pages-3 |
| tailwind-theme-vs-theme-inline | panelo-theme | dashboard-pages-3 |
| tailwind-v4-dark-mode-not-working | panelo-theme, revenue-chart | dashboard-pages-3 |
| tailwind-v4-custom-colors-not-working | panelo-theme | dashboard-pages-3 |
| tailwind-semantic-color-tokens | panelo-theme | dashboard-pages-3 |
| agents-md-design-system | revenue-chart (blocks built to the rules) | dashboard-pages-3 |
| tailwind-rtl-logical-properties | login-pages-1 (only claim RTL if verified) | dashboard-pages-7 Team Inbox |
| progressive-blur-scroll-fade-css | profile-pages-1 Designer Profile | profile-pages-2 Team Member Profile |
| tailwind-v4-multiple-themes | panelo-theme | dashboard-pages-3 |
| tailwind-v4-focus-ring | revenue-chart (keyboard navigation) | dashboard-pages-9 Task Board (keyboard moves) |
| why-shadcn-uses-oklch | panelo-theme | dashboard-pages-3 |
| design-tokens-tailwind-v4 | panelo-theme | dashboard-pages-3 |
| tailwind-v4-type-scale | login-pages-3 Painted Login | dashboard-pages-5 |
