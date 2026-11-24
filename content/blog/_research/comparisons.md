# Keyword research: comparisons and alternatives (decision-time queries)

Researched 2026-11-24 for Panelo UI (new, low-authority domain). No paid tools: discovery = Google autocomplete (165 seeds, 862 on-topic suggestions after noise filtering), difficulty = manual SERP inspection via web search (~30 queries), facts = vendor pages, GitHub API, npm registry. Volume is unknown; autocomplete depth (how many suffix variants Google offers, e.g. "... reddit", "... 2026", "... performance") is used as a rough demand proxy.

Reddit could not be fetched directly (blocked to this crawler). Reddit presence is inferred from autocomplete ("shadcn vs mui reddit", "heroui vs shadcn reddit", etc.), which Google only suggests when people search for it.

Panelo facts used below were checked in the repo: Panelo's 8 free charts are hand-built SVG/React with no Recharts/d3/visx dependency (`components/panelo/blocks/charts/*.tsx` import only React, lucide-react, `@ui-sdk/react` and Panelo UI parts); components use `react-aria-components`; `package.json` pins `@ui-sdk/react` `0.1.0-beta.2`.

---

## 0. Verified competitor facts (as of 2026-11-24)

Status column: "last push" = GitHub `pushed_at`; "npm" = latest dist-tag and its publish date from registry.npmjs.org. All GitHub/npm lookups done today.

| Name | URL | License / pricing | Status (verified today) | Source |
|---|---|---|---|---|
| shadcn/ui | ui.shadcn.com | MIT, free | Active. `shadcn` CLI 4.23.0 (2026-10-27); repo pushed 2026-11-23. **Base UI became the default for new projects in July 2026**; Radix still supported, `-b radix` flag; registries can pin with `registry:base`. Charts = Recharts v3, copy-paste. | https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default ; https://ui.shadcn.com/docs/components/chart ; https://github.com/shadcn-ui/ui |
| Tremor | tremor.so | Apache-2.0 (repos). Vercel said Tremor Blocks would be free/open source under MIT. | **Acquired by Vercel, announced 2025-01-22.** `@tremor/react` latest 3.18.7 published **2025-01-13** (no release since), peer deps `react ^18`, deps `recharts ^2`. Copy-paste repo (tremorlabs/tremor) last commit 2025-10-10 (CI cleanup); last feature work Apr 2025 (Tailwind v4). Open PR "Upgrade to React 19 (recharts 3…)" since 2026-06-11, unmerged. Site still says "Tremor is joining Vercel". | https://vercel.com/blog/vercel-acquires-tremor ; https://www.npmjs.com/package/@tremor/react ; https://github.com/tremorlabs/tremor ; https://github.com/tremorlabs/tremor-npm |
| MUI (Material UI + MUI X) | mui.com | Core MIT free; MUI X Pro $299/dev/yr, Premium $599/dev/yr (annual; perpetual option exists) | Active. `@mui/material` 9.6.0 (2026-11-23); `@mui/x-charts` 9.18.1 (2026-11-16, MIT community tier). | https://mui.com/pricing/ ; https://github.com/mui/material-ui |
| Chakra UI | chakra-ui.com | MIT, free | Active. `@chakra-ui/react` 3.38.0 (2026-11-03). v3 uses Ark UI primitives. | https://github.com/chakra-ui/chakra-ui |
| Mantine | mantine.dev | MIT, free | Active. `@mantine/core` and `@mantine/charts` 9.8.2 (2026-11-20). | https://github.com/mantinedev/mantine |
| Ant Design | ant.design | MIT, free | Active. `antd` 6.7.2 (2026-11-23); `@ant-design/charts` 2.6.7 (2025-12-23). | https://github.com/ant-design/ant-design |
| HeroUI (formerly NextUI) | heroui.com | **Apache-2.0** (not MIT, which several comparison pages claim). HeroUI Pro: perpetual licences (Web / Mobile / Super Hero / Team per-seat); prices not shown in page text. | Active. `@heroui/react` 3.2.8 (2026-11-22). | https://github.com/heroui-inc/heroui ; https://www.heroui.pro/pricing |
| Radix Themes | radix-ui.com/themes | MIT, free | Slowing: `@radix-ui/themes` 3.3.0 (2026-01-31); repo last push 2026-04-11. | https://github.com/radix-ui/themes |
| Base UI | base-ui.com | MIT, free | Active. Package renamed to `@base-ui/react` (1.9.0, 2026-10-09); old `@base-ui-components/react` deprecated. | https://github.com/mui/base-ui |
| daisyUI | daisyui.com | MIT, free | Active. `daisyui` 5.8.2 (2026-11-20). CSS-only Tailwind plugin, any framework. | https://github.com/saadeghi/daisyui |
| Park UI | park-ui.com | MIT, free | Slowing: repo last push 2026-04-10. Built on Ark UI + Panda CSS. | https://github.com/chakra-ui/park-ui |
| Recharts | recharts.org | MIT | Active. 3.11.1 (2026-11-23). Engine under shadcn charts, Tremor, Mantine charts. | https://github.com/recharts/recharts |
| Chart.js | chartjs.org | MIT | Active. 4.6.2 (2026-11-23); `react-chartjs-2` 5.3.1 (2025-10-27). Canvas, framework-agnostic. | https://github.com/chartjs/Chart.js |
| Nivo | nivo.rocks | MIT | Quiet: `@nivo/core` 0.99.0 published 2025-05-23 (no npm release in 18 months); repo push 2026-07-21. | https://github.com/plouc/nivo |
| visx (Airbnb) | airbnb.io/visx | MIT | `@visx/visx` 4.0.0 (2026-06-11); repo push 2026-06-22. Low-level D3 primitives. | https://github.com/airbnb/visx |
| Apache ECharts | echarts.apache.org | Apache-2.0 | 6.1.0 (2026-05-19). | https://github.com/apache/echarts |
| Tailwind Plus (incl. Catalyst UI kit) | tailwindcss.com/plus | Was one-time: $299 personal (Catalyst alone $149). | **Closed to new customers.** Tailwind Labs joined Shopify on 2026-09-09; "closing sign ups for new customers"; existing customers keep access; Tailwind CSS stays MIT. /plus now shows a login form. | https://tailwindcss.com/blog/tailwind-is-joining-shopify ; https://tailwindcss.com/plus/templates/catalyst |
| shadcnblocks | shadcnblocks.com | Lifetime one-time: Pro $149, Premium $299 (adds Admin Kit, templates, Figma), Elite $399; Premium Team (10 seats) $599 | Active. **Acquired Kibo UI (announced 2025-10-28)**; kibo repo now `shadcnblocks/kibo` (MIT). Admin Kit = Next.js 16, 139 pages. | https://www.shadcnblocks.com/pricing ; https://www.shadcnblocks.com/blog/announcing-kibo-ui-acquisition ; https://www.shadcnblocks.com/blog/shadcn-admin-kit |
| shadcn.io | shadcn.io | Independent, **not affiliated with shadcn/ui**. Free account for components; Pro is subscription: $49/mo or $389/yr individual (lifetime $899 in structured data); Team $99/mo; Org $199/mo | Active. | https://www.shadcn.io/pricing |
| shadcn/studio | shadcnstudio.com | Free community tier; one-time Basic $99, Pro $199, Team $449 (15 seats), Enterprise $849 | Active; has Admin Kit / admin dashboard templates. | https://shadcnstudio.com/pricing |
| Magic UI | magicui.design | Free components MIT; Magic UI Pro $199 one-time (landing pages/templates, not dashboards) | Active, repo pushed 2026-11-23. | https://pro.magicui.design/ ; https://github.com/magicuidesign/magicui |
| Aceternity UI | ui.aceternity.com | Free 100+ components; Pro one-time: $169 (1-year), $199 lifetime, Team $1,590 (10 seats) | Active. Marketing/animation focus. | https://ui.aceternity.com/pricing |
| Origin UI → coss ui | coss.com/ui | MIT | **Origin UI rebranded as coss ui (Cal.com's design system), built on Base UI.** Old Origin UI collection kept with limited maintenance. Repo `cosscom/ui` pushed 2026-11-24. | https://coss.com/ui/docs/roadmap ; https://github.com/cosscom/ui |
| Tailark | tailark.com | Free tier; one-time Essentials $249, Complete $299, Team $499 | Active (blocks repo pushed 2026-07-29). **Marketing blocks only, no dashboards.** | https://tailark.com/pricing ; https://github.com/tailark/blocks |
| Untitled UI React | untitledui.com/react | Free core (repo MIT; site says "free to use in commercial projects for one user"); PRO one-time: Solo $349, Studio $999 (8 users), Business $2,499, Enterprise $8,999 | Active, repo pushed 2026-11-18. React Aria + Tailwind. | https://www.untitledui.com/pricing ; https://github.com/untitleduico/react |
| TailAdmin | tailadmin.com | Free edition MIT; Pro one-time $59 / $119 / $299 per framework, bundle $149–$699 | Active (free React repo pushed 2026-11-17). Tailwind template, **not shadcn-based**. | https://tailadmin.com/pricing ; https://github.com/TailAdmin/free-react-tailwind-admin-dashboard |
| Horizon UI | horizon-ui.com | Free Chakra version MIT; Pro exists (pricing page returned HTTP 402, not verified) | Free Chakra repo last push 2025-01-13. Also a shadcn + Next.js AI boilerplate. | https://github.com/horizon-ui/horizon-ui-chakra |
| shadcn-admin (satnaing) | github.com/satnaing/shadcn-admin | MIT, free | Repo pushed 2026-09-10. Most-cited free shadcn admin template. | https://github.com/satnaing/shadcn-admin |
| next-shadcn-dashboard-starter (Kiranism) | github.com/Kiranism/next-shadcn-dashboard-starter | MIT, free | Repo pushed 2026-11-15; Next.js 16, positions itself "AI-first". | https://github.com/Kiranism/next-shadcn-dashboard-starter |
| Vercel's UI SDK | ui-sdk.dev | Apache-2.0 | Repo `vercel-labs/ui` pushed 2026-11-24. **`@ui-sdk/react` latest is 0.1.0-beta.16 (2026-11-23)**; Panelo pins beta.2 (BRIEF says beta.2: say "beta" without a version number in posts). | https://github.com/vercel-labs/ui ; https://www.npmjs.com/package/@ui-sdk/react |

Official shadcn registry directory (`ui.shadcn.com/r/registries.json`, 593 entries today) lists `@aceternity`, `@coss`, `@kibo-ui`, `@magicui`, `@reui`, `@shadcnblocks`, `@tailark`. **`@panelo` is not listed.**

---

## (a) Keyword table: top 20

KD = difficulty judged from the live top 10: L = thin/aggregator/stale pages, M = mix of vendor blogs and dev.to with some strong domains, H = strong domains plus heavy listicle saturation. "AIO" = likelihood of an AI overview/answer box (all comparison queries got synthesized answers in testing; noted only where the answer engine already has a settled consensus).

| # | Keyword (+ close variants) | Intent | KD + reason | Top domains seen | Winnable (new domain) | Proposed title + honest angle |
|---|---|---|---|---|---|---|
| 1 | **tremor ui alternative** / tremor react alternative / is tremor still maintained / tremor react 19 / tremor tailwind v4 | Commercial | **L.** Bare "tremor alternative" is a medical SERP, so dev intent is under-served; the dev SERP is adminlte, Product Hunt alternatives, LogRocket tutorials, GitHub forks. Nobody states the npm/React 19 facts. | adminlte.io, producthunt.com, blog.logrocket.com, stackshare, github forks | **Yes** | "Tremor alternatives in 2026: is Tremor still maintained?" State verified facts (last npm 2025-01-13, peer React ^18, Recharts ^2, React 19 PR open). Options: shadcn/ui charts, Recharts direct, Mantine charts, MUI X Charts, Panelo UI charts. Fair: Tremor Blocks are free/MIT and its 35+ components cover more than Panelo's 8 charts. |
| 2 | **tremor vs shadcn charts** / tremor vs shadcn ui / tremor vs recharts | Comparison | **L.** adminlte, pkgpulse, thefrontkit, freecodecamp; one public migration commit (openstatus). | adminlte.io, pkgpulse.com, thefrontkit.com, freecodecamp.org, tanstack.com | **Yes** | "Tremor vs shadcn/ui charts: which to use in 2026". Both sit on Recharts; differences are install model, React 19 / Tailwind v4 / Recharts 3 support, theming. Include a migration checklist. Panelo UI as a third option only in a short section. |
| 3 | **shadcnblocks alternative** / shadcn blocks alternative / is shadcn blocks worth it / shadcn premium blocks | Commercial | **L.** Product Hunt alternatives, Peerlist review, adminlte, SaaSHub, G2 (for shadcn/studio). No verified pricing comparison exists. | producthunt.com, peerlist.io, adminlte.io, saashub.com, g2.com | **Yes** | "shadcnblocks alternatives: shadcn block libraries by price and focus". Verified price table (shadcnblocks, shadcn/studio, shadcn.io, Tailark, Magic UI Pro, Aceternity Pro, Panelo UI). Fair: shadcnblocks has far more blocks and a 139-page Admin Kit; Panelo UI is dashboards-only and small. |
| 4 | **shadcn charts vs recharts** / shadcn charts recharts / shadcn chart library / best shadcn charts | Informational | **L-M.** Official docs rank, then shadcn.io, freecodecamp, dev.to, a Medium piece. Most pages miss that they are the same engine. | ui.shadcn.com, shadcn.io, freecodecamp.org, dev.to, reui.io | **Yes/Maybe** | "shadcn/ui charts vs Recharts: same engine, different job". Explain ChartContainer/theming layer, Recharts v3, when to drop down to Recharts, when to pick a non-Recharts option (ECharts for big data; hand-built SVG like Panelo UI's charts for fixed designs). Fair: Recharts covers far more chart types. |
| 5 | **recharts vs nivo vs visx** / recharts vs chart.js / recharts vs nivo / recharts vs visx / nivo vs visx | Comparison | **M.** LogRocket, pkgpulse, npm-compare, Speakeasy (2022), Capital One (old), TanStack comparison. Many pages are stale (2021-2022). | blog.logrocket.com, pkgpulse.com, npm-compare.com, speakeasy.com, tanstack.com | **Maybe** (freshness is the edge) | "Recharts vs Chart.js vs Nivo vs visx for React dashboards (2026)". Use today's npm dates (Nivo no release since May 2025; visx 4.0 Jun 2026; Recharts 3.11 and Chart.js 4.6.2 this week). Panelo UI only as a note: its charts use none of these. |
| 6 | **tailwind plus alternative** / tailwind ui alternative / catalyst ui alternative / tailwind plus free alternative | Commercial | **M.** AlternativeTo, Tailgrids, Untitled UI, daisyUI, dev.to, DesignRevision, DevToolPicks. Vendor listicles, most written before the Sept 2026 closure. | alternativeto.net, tailgrids.com, untitledui.com, daisyui.com, dev.to | **Maybe** (news-driven) | "Tailwind Plus is closed to new customers: Catalyst alternatives for app and dashboard UI". Cite the Shopify post. Narrow to the app-UI half (Catalyst): shadcn/ui, Untitled UI React, shadcnblocks, shadcn/studio, Panelo UI. Fair: Tailwind CSS itself is unaffected; existing buyers keep access. |
| 7 | **best shadcn registries** / best shadcn component libraries / libraries like shadcn / shadcn registry list / awesome shadcn | Commercial | **M.** dev.to listicles (several low quality), shadcn.io/awesome, 21st.dev, official directory, Medium. | dev.to, shadcn.io, 21st.dev, ui.shadcn.com, medium.com | **Maybe** | "Best shadcn/ui registries in 2026, by category (verified)". Category table (primitives, marketing, animation, dashboards, charts) with licence, price and today's maintenance status, including the acquisitions (Kibo UI → shadcnblocks, Origin UI → coss ui). Panelo UI listed in the dashboards row only. |
| 8 | **shadcn vs heroui** / heroui vs shadcn reddit / shadcn vs nextui | Comparison | **M-L.** daisyUI compare pages, DesignRevision, Better Stack, Tailgrids, a Reddit mirror. Several state HeroUI is MIT; it is Apache-2.0. | daisyui.com, designrevision.com, betterstack.com, tailgrids.com | **Maybe/Yes** | "shadcn/ui vs HeroUI (v3) in 2026". Fair, fact-checked: licence, React Aria vs Base UI/Radix, package vs copy-paste, HeroUI Pro. Panelo mention: shadcn-side add-ons for dashboards. |
| 9 | **shadcn vs mantine** / mantine vs shadcn 2026 / shadcn or mantine reddit | Comparison | **M.** dev.to ("Why I chose Mantine… for every dashboard"), Hashnode, Subframe, DesignRevision, small blogs. | dev.to, hashnode.com, subframe.com, designrevision.com | **Maybe** | "shadcn/ui vs Mantine for dashboards". Mantine wins on breadth (charts, dates, hooks built in, v9). shadcn wins on owned code and Tailwind. Show which dashboard pieces you add on the shadcn side. |
| 10 | **shadcn radix vs base ui** / shadcn base ui vs radix / radix vs base ui | Informational | **M.** Official shadcn changelog, WorkOS, 21st.dev, dev.to, shadcn/studio, shadcnspace. Fresh topic (default switched July 2026). | ui.shadcn.com, workos.com, 21st.dev, dev.to, shadcnstudio.com | **Maybe** | "shadcn/ui now defaults to Base UI: what it means for registries you install". Angle nobody covers: third-party registries (`registry:base`), mixing Base UI, Radix and React Aria in one app. Panelo UI uses React Aria and installs into its own folder. |
| 11 | **nextjs dashboard template with ai assistant** / ai agent dashboard template / ai agent dashboard ui | Commercial | **L-M.** v0 templates, Vercel templates, ThemeForest, Liveblocks example, 21st.dev, adminlte. Nothing on agents *operating* the UI. | v0.app, vercel.com, themeforest.net, liveblocks.io, 21st.dev | **Yes** | "AI agent dashboard templates for Next.js compared". Separate "chat panel on a dashboard" from "agent that can operate the dashboard" (Panelo UI via Vercel's UI SDK, beta). Honest: UI SDK is beta; most listed templates have no agent control. Publish after Dec 1 templates. |
| 12 | **shadcn vs mui** / shadcn vs mui for dashboards / shadcn vs mui vs antd / shadcn vs mui performance | Comparison | **H.** 20+ results: daisyUI (2 slots), dev.to, 21st.dev, vercel.com/i, shadcn/studio, adminlte, DesignRevision, OpenReplay, Django Stars. Strong demand (many autocomplete suffixes). | daisyui.com, dev.to, 21st.dev, vercel.com, shadcnstudio.com | **No** for head term; **Maybe** for "for dashboards" | "shadcn/ui vs MUI for data-heavy dashboards". Narrow to data grid, charts, date pickers: MUI X Pro is $299/dev/yr; the shadcn side is TanStack Table plus blocks. Fair: MUI X Data Grid is far ahead for big grids. |
| 13 | **shadcn vs ant design** / ant design vs shadcn reddit | Comparison | **M.** shadcn/studio, StackShare, OSS Insight, Subframe, toolradar, adminlte, Indie Hackers. | shadcnstudio.com, subframe.com, toolradar.com, adminlte.io | **Maybe** | "shadcn/ui vs Ant Design for admin panels". antd v6 has free Table/Form/Tree; shadcn gives owned code. |
| 14 | **untitled ui vs shadcn** / untitled ui alternative / untitled ui free alternative | Comparison | **M.** The vendor's own post ranks #1; then Slashdot, Tailgrids, daisyUI. | untitledui.com, slashdot.org, tailgrids.com | **Maybe** | "Untitled UI React vs shadcn/ui: a neutral comparison". Fair: Untitled UI's 5k+ components and Figma parity are real strengths; price $349+ one-time. |
| 15 | **tailadmin alternative** / tailadmin vs shadcn / tailadmin free vs pro | Commercial | **L.** adminlte, Product Hunt, AlternativeTo. Low volume. | adminlte.io, producthunt.com, alternativeto.net | **Yes** (low volume) | "TailAdmin vs shadcn/ui dashboards". TailAdmin is a full template ($59–$299 per framework, not shadcn); shadcn options are composable. |
| 16 | **mui x charts vs recharts** / recharts vs mui x charts | Comparison | **L.** No direct head-to-head page in the top 10; LogRocket and SaaSHub. | blog.logrocket.com, saashub.com, mui.com | **Yes** (low volume) | Short post or section of #5. MUI X Charts is MIT community / paid Pro; best if you already use MUI. |
| 17 | **best shadcn dashboard template** / shadcn admin dashboard template free / free shadcn dashboard | Commercial | **M.** adminlte (many slots), dev.to listicles, WrapPixel, Vercel templates, GitHub repos, shadcn/studio. | adminlte.io, dev.to, wrappixel.com, vercel.com, github.com | **Maybe** (after Dec 1) | "Best shadcn/ui dashboard templates (free and paid), tested". Include satnaing/shadcn-admin and Kiranism (MIT), shadcnblocks Admin Kit, shadcn/studio, and Panelo UI's free template once it ships. Keep it a real comparison, not a Panelo page. |
| 18 | **shadcn vs daisyui** / shadcn vs chakra ui | Comparison | **M.** daisyui.com owns 2 slots per query; 21st.dev, dev.to, Subframe, DesignRevision. | daisyui.com, 21st.dev, dev.to, subframe.com | **Maybe**, low Panelo relevance | Lower priority. Only worth writing as part of a hub "shadcn/ui vs X" page. |
| 19 | **best react chart library (2026)** / best react chart library for dashboards | Commercial | **H.** FusionCharts (2 slots), LogRocket, Syncfusion, dev.to, Svitla, BairesDev. Vendor-owned. | fusioncharts.com, blog.logrocket.com, syncfusion.com, dev.to | **No** (head) | Skip the head term; #5 targets the winnable long tail. |
| 20 | **best react component library 2026** / best react ui library for dashboard / shadcn alternatives 2026 | Commercial | **H.** UXPin, Builder.io, Telerik, HeroUI blog, Aceternity guide, Untitled UI, Tailgrids, Better Stack, AlternativeTo. AIO consensus is settled (MUI default, shadcn for custom). | uxpin.com, builder.io, telerik.com, untitledui.com, tailgrids.com | **No** | Do not target. Earn mentions inside these listicles instead (see surfaces). |

Not recommended: "magic ui vs aceternity", "aceternity ui alternative", "magic ui alternatives". Real demand, but landing-page animation intent with no dashboard fit for Panelo UI.

### Ranked shortlist (write in this order)
1. Tremor alternatives / is Tremor maintained (#1)
2. Tremor vs shadcn/ui charts (#2)
3. shadcnblocks alternatives, price table (#3)
4. shadcn/ui charts vs Recharts (#4)
5. Recharts vs Chart.js vs Nivo vs visx for dashboards (#5)
6. Tailwind Plus closed: Catalyst alternatives (#6, time-sensitive)
7. Best shadcn/ui registries by category (#7)
8. shadcn/ui vs HeroUI v3 (#8)
9. shadcn/ui vs Mantine for dashboards (#9)
10. AI agent dashboard templates compared (#11, after Dec 1)

---

## (b) Citation / AEO / GEO surfaces that recur

| Surface | Why it matters | Action for Panelo UI |
|---|---|---|
| **Official shadcn registry directory** (`ui.shadcn.com/directory`, `ui.shadcn.com/r/registries.json`) | Built into the CLI with no config. Every competitor registry is listed (`@shadcnblocks`, `@magicui`, `@aceternity`, `@tailark`, `@coss`, `@kibo-ui`, `@reui`). `@panelo` is missing. | Submit `@panelo`. Highest value, lowest effort. |
| **GitHub awesome lists**: birobirobiro/awesome-shadcn-ui (~19–21k stars per third-party trackers), plus forks; shadcn.io/awesome/registries (31 curated registries) | Show up for "awesome shadcn", "shadcn registry list", and AI engines cite them. | PR into awesome-shadcn-ui (Components, Dashboards, Charts sections); request a shadcn.io listing. |
| **dev.to listicles** | Show up in nearly every SERP here ("best shadcn dashboards", "shadcn alternatives", "best shadcn block libraries", "top 10 free shadcn templates"). Low barrier; AI engines cite them often. | Cross-post canonical versions of #2, #4, #5. Ask listicle authors to add Panelo UI to dashboard sections. |
| **Reddit** (r/reactjs, r/nextjs, r/shadcn; inferred) | Autocomplete offers "reddit" variants for shadcn vs mui / mantine / heroui / daisyui / antd, shadcn alternatives, registries, shadcnblocks, shadcn studio, recharts alternative, best react chart library. | Answer existing threads with the Tremor maintenance facts and chart comparisons. No drive-by promotion. |
| **Comparison and alternatives aggregators**: AlternativeTo, Product Hunt "alternatives", daisyui.com/compare, DesignRevision (/compare, /alternatives, ships `.md` copies for LLMs), StackShare, SaaSHub, G2, Slashdot | Fill slots 3–10 on most "vs" and "alternative" queries. | Create Panelo UI listings on AlternativeTo, Product Hunt, SaaSHub and G2, set as an alternative to Tremor, shadcnblocks and shadcn/studio. |
| Vendor "vs" hubs: vercel.com/i/* (shadcn vs material-ui, shadcn vs radix), 21st.dev/blog, adminlte.io (many template roundups), shadcnstudio.com/blog | Rank top 5 for shadcn comparisons; adminlte dominates template roundups. | Outreach to adminlte (they run "tremor dashboard templates" and "shadcn admin dashboard templates" posts). |
| npm-compare.com, pkgpulse.com, LogRocket | Own chart-library comparison slots. | Hard to influence; out-rank pkgpulse on freshness. |

---

## Notes and caveats
- Volume is unmeasured. Treat KD as a SERP-quality judgment from one US snapshot.
- Every 2026 roundup in these SERPs is vendor-authored or affiliate-driven. Fair, sourced comparisons are the real differentiator for a new domain.
- Keep Panelo UI's weak points explicit in posts: 32 items (15 free), 8 charts with fixed designs and sample data rather than a general charting API, React-only, UI SDK in beta, templates not out until Dec 1.

## Sources
- https://vercel.com/blog/vercel-acquires-tremor
- https://www.npmjs.com/package/@tremor/react (registry.npmjs.org/@tremor/react)
- https://github.com/tremorlabs/tremor ; https://github.com/tremorlabs/tremor-npm
- https://www.tremor.so
- https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- https://ui.shadcn.com/docs/components/chart
- https://ui.shadcn.com/r/registries.json
- https://tailwindcss.com/blog/tailwind-is-joining-shopify
- https://tailwindcss.com/plus/templates/catalyst
- https://devtoolpicks.com/blog/best-tailwind-plus-alternatives-indie-hackers-2026 (pre-closure prices; secondary)
- https://mui.com/pricing/
- https://www.heroui.pro/pricing ; https://github.com/heroui-inc/heroui
- https://www.shadcnblocks.com/pricing ; https://www.shadcnblocks.com/blog/announcing-kibo-ui-acquisition ; https://www.shadcnblocks.com/blog/shadcn-admin-kit
- https://www.shadcn.io/pricing
- https://shadcnstudio.com/pricing
- https://pro.magicui.design/
- https://ui.aceternity.com/pricing
- https://coss.com/ui/docs/roadmap ; https://github.com/cosscom/ui
- https://tailark.com/pricing
- https://www.untitledui.com/pricing
- https://tailadmin.com/pricing
- GitHub API (repos/*) and npm registry lookups for: shadcn-ui/ui, mui/material-ui, chakra-ui/chakra-ui, mantinedev/mantine, ant-design/ant-design, heroui-inc/heroui, radix-ui/themes, mui/base-ui, saadeghi/daisyui, chakra-ui/park-ui, recharts/recharts, chartjs/Chart.js, plouc/nivo, airbnb/visx, apache/echarts, magicuidesign/magicui, untitleduico/react, TailAdmin/free-react-tailwind-admin-dashboard, horizon-ui/horizon-ui-chakra, shadcnblocks/kibo, satnaing/shadcn-admin, Kiranism/next-shadcn-dashboard-starter, tailark/blocks, vercel-labs/ui
- SERP snapshots (2026-11-24) for each keyword in table (a)

---

## (c) Raw autocomplete list (Google, en-US, noise-filtered; seed → suggestions)

- **shadcn vs**: shadcn vs tailwind; shadcn vs radix; shadcn vs; shadcn vs mui; shadcn vs material ui; shadcn vs mantine; shadcn vs base ui; shadcn vs daisyui; shadcn vs react; shadcn vs radix ui
- **shadcn ui vs**: shadcn ui vs material ui; shadcn ui vs mui; shadcn ui vs tailwind; shadcn ui vs radix; shadcn ui vs daisyui; shadcn ui vs; shadcn ui vs tailwind css; shadcn ui vs bootstrap
- **shadcn vs mui**: shadcn vs mui; shadcn vs mui reddit; shadcn vs mui performance; shadcn or mui; shadcn ui vs mui; shadcn vs mui vs antd; shadcn vs mui vs chakra; shadcn ui vs mui reddit; shadcn vs react mui
- **shadcn vs chakra**: shadcn vs chakra; shadcn vs chakra ui; shadcn or chakra ui; shadcn or chakra; shadcn vs mui vs chakra; shadcn vs mantine vs chakra
- **shadcn vs mantine**: shadcn vs mantine; shadcn vs mantine ui; shadcn or mantine; shadcn or mantine reddit; shadcn vs mantine vs chakra; mui vs shadcn vs mantine
- **shadcn vs ant design**: shadcn or ant design; shadcn ui vs ant design; ant design vs shadcn reddit
- **shadcn vs heroui**: shadcn vs heroui; shadcn or heroui; shadcn ui vs heroui
- **shadcn vs radix**: shadcn vs radix; shadcn vs radix ui; shadcn vs radix reddit; shadcn vs radix themes; shadcn radix vs base; shadcn radix vs base ui; shadcn base ui vs radix; shadcn radix vs base reddit; shadcn base ui vs radix ui; shadcn and radix
- **shadcn vs daisyui**: shadcn vs daisyui; shadcn vs daisyui reddit; shadcn or daisyui; shadcn ui vs daisyui; shadcn svelte vs daisyui; flowbite vs shadcn vs daisyui
- **shadcn vs park ui**: shadcn vs park ui
- **shadcn alternative**: shadcn alternatives; shadcn alternatives 2026; shadcn alternatives reddit; shadcn alternative for angular; shadcn alternative for react native; shadcn alternatives free; shadcn alternative for react; shadcn alternative for vue; shadcn alternatives 2025; shadcn alternative for svelte
- **shadcn ui alternative**: shadcn ui alternatives; shadcn ui alternative for react; shadcn ui alternative for angular; shadcn ui alternative for vue; shadcn ui alternative reddit; shadcn ui alternative 2026; shadcn ui replacement; shadcn ui library alternative; shadcn ui components alternative; shadcn ui kit alternative
- **shadcn alternatives**: shadcn alternatives; shadcn alternatives 2026; shadcn alternatives reddit; shadcn alternatives free; shadcn alternatives 2025; shadcn alternatives for react; shadcn alternatives for angular; shadcn alternatives vue; shadcn alternatives for svelte; shadcn alternatives for react native
- **tremor alternative**: tremor alternative; tremor ui alternative
- **tremor vs shadcn**: tremor vs shadcn; tremor vs shadcn ui; tremor vs shadcn charts
- **tremor react**: tremor react; tremor react charts; tremor react 19; tremor react dashboard; tremor reactjs; tremor react npm; tremor react components; tremor react tailwind; tremor react ui; tremor react tailwind css
- **tremor charts**: tremor charts; tremor charts react; tremor charts library; tremor js charts; tremor shadcn charts; tremor ui charts; tremor so charts; tremor vs shadcn charts; has there been an earth tremor tonight
- **tremor ui**: tremor ui; tremor ui library; tremor ui kit; tremor ui components; tremor ui react; tremor ui framework; tremor ui template; tremor ui figma; tremor ui ux; tremor ui mcp
- **recharts vs**: recharts vs chartjs; recharts vs echarts; recharts vs plotly; recharts vs highcharts; recharts vs tanstack charts; recharts vs d3; recharts vs mui x charts; recharts vs apache echarts; recharts vs visx; recharts vs apexcharts
- **recharts alternative**: recharts alternatives; recharts alternative react; recharts alternative reddit; recharts alternative for vue
- **recharts vs chart.js**: recharts vs chart.js; recharts vs chart js performance; recharts or chart js; recharts vs chart js vs d3; chart js vs recharts reddit; echarts vs recharts; highcharts vs recharts
- **recharts vs nivo**: recharts vs nivo; recharts or nivo
- **recharts vs visx**: recharts vs visx; recharts or visx
- **nivo vs**: nivo vs recharts; nivo vs chart.js; nivo vs echarts; nivo vs d3; nivo vs; nivo vs visx
- **visx vs**: visx vs recharts; visx vs d3; visx vs echarts; visx vs chartjs; visx vs; visx vs nivo
- **chart.js vs**: chart.js vs d3.js; chart.js vs plotly; chart.js vs plotly.js; chart.js vs echarts; chart.js vs recharts; chart.js vs apexcharts; chart js vs d3; chart js vs highcharts; chart js vs; chart js vs apache echarts
- **best react chart library**: best react chart library; best react chart library 2026; best react chart library 2025; best react chart library reddit; best react chart library free; best react graph library; top react charts library; best react native chart library; best react js chart library; best react gantt chart library
- **react chart library**: react chart library; react chart library 2026; react chart library open source; react chart library 2025; react chart library free; react chart library reddit; react chart library npm; react chart library best; react chart library tailwind; react chart library comparison
- **shadcn charts vs**: shadcn charts vs recharts
- **shadcnblocks alternative**: shadcnblocks alternative
- **shadcn blocks**: shadcn blocks; shadcn blocks free; shadcn blocks dashboard; shadcn blocks github; shadcn blocks ui; shadcn blocks vs components; shadcn blocks admin; shadcn blocks navbar; shadcn blocks login; shadcn blocks figma
- **shadcn blocks alternative**: shadcn blocks alternative
- **magic ui alternative**: magic ui alternatives; magic ui alternative reddit; magic ui free alternative
- **aceternity ui alternative**: aceternity ui alternative; aceternity ui alternative free
- **aceternity vs**: aceternity vs magic ui; aceternity vs; aceternity vs shadcn; aceternity ui vs; aceternity ui vs shadcn
- **magic ui vs**: magic ui vs shadcn; magic ui vs aceternity; magic ui vs
- **origin ui alternative**: origin ui alternative
- **tailark**: tailark; tailark ui; tailark pro; tailark free; tailark templates; tailark components; tailark shadcn; tailark blocks; tailark alternatives; tailark hero section
- **shadcn.io**: shadcn.io; shadcn.io components; shadcn.io templates; shadcn.io backgrounds; shadcn.io blocks; shadcn.io vs shadcn.com; shadcn io reddit; shadcn io ai; shadcn io mcp; shadcn io github
- **best shadcn**: best shadcn component library; best shadcn themes; best shadcn registries; best shadcn libraries; best shadcn presets; best shadcn figma library; best shadcn ui library; best shadcn templates; best shadcn components; best shadcn ui
- **best shadcn component library**: best shadcn component library; best shadcn ui component library
- **best shadcn ui libraries**: best shadcn ui libraries; top shadcn ui libraries; best shadcn ui component libraries; best shadcn based ui library; best ui libraries like shadcn; most popular ui libraries; most popular react ui libraries
- **best shadcn templates**: best shadcn templates; best shadcn dashboard templates; best shadcn ui templates
- **best shadcn dashboard**: best shadcn dashboards; best shadcn dashboard template; best shadcn admin dashboard; best shadcn ui dashboard; best free shadcn dashboard
- **shadcn dashboard template**: shadcn dashboard templates; shadcn dashboard template github; shadcn dashboard template nextjs; shadcn dashboard template figma; shadcn dashboard template react; shadcn admin template; shadcn login template; shadcn admin template nextjs; shadcn admin template free; shadcn admin template github
- **shadcn admin template**: shadcn admin template; shadcn admin template free; shadcn admin template github; shadcn admin template nextjs; shadcn admin template download github; shadcn admin template react; shadcn admin template figma; shadcn dashboard template; shadcn dashboard template github; shadcn dashboard template nextjs
- **best react component library**: best react component library; best react component library 2026; best react component library 2025; best react component library reddit; best react component library free; best react component library with tailwind; best react component library for dashboard; best react component library for mobile; best reactjs component library; top react component library
- **best react ui library**: best react ui library; best react ui library 2026; best react ui library for dashboard; best react ui library 2025; best react ui library reddit; best react ui library with tailwind; best react ui library free; best react ui library for mobile; best react ui library for landing page; best react ui library for ecommerce
- **best react component library 2026**: best react component library 2026; top react component libraries 2026; best react ui component library 2026; best react native component library 2026; best react components library 2026 react bits
- **best react dashboard template**: best react dashboard templates; best react dashboard templates free; best react admin template; best react admin template free; best react admin dashboard templates; top react admin templates; best react js admin template; dashboard template examples; dashboard template ideas
- **best react admin template**: best react admin template; best react admin template free; top react admin templates; best react admin dashboard; best react admin panel; best react admin dashboard templates; best react js admin template; best free react admin dashboard; best admin panel template in react js
- **react admin dashboard template free**: react admin dashboard template free; react admin dashboard template free tailwind css; react admin dashboard template free download; react admin dashboard template free github; reactjs admin dashboard templates free; react admin panel template free; react admin panel template free download; react admin panel template free github; react tailwind admin dashboard template free; react js admin dashboard template free download
- **best admin dashboard template**: best admin dashboard template; best admin dashboard template free; best admin dashboard template free download; best admin dashboard template html; best admin dashboard template 2026; best admin panel template; top admin dashboard template; best admin panel template free download; best admin panel template in react js; best admin panel template bootstrap free download
- **untitled ui alternative**: untitled ui alternative; untitled ui free alternative
- **untitled ui vs**: untitled ui vs shadcn; untitled ui vs; untitled ui vs mui; untitled ui vs tailwind +; untitled ui vs relume; untitled ui free vs pro; untitled ui vs material ui; untitled ui vs align ui
- **tailadmin alternative**: tail admin alternative; tailadmin free alternative
- **tailadmin vs**: tailadmin vs; tailadmin vs shadcn; tailadmin free vs pro
- **horizon ui**: horizon ui; horizon ui pro; horizon ui dashboard
- **tailwind plus alternative**: tailwind plus alternative; tailwind plus free alternative; alternatives to tailwind css
- **tailwind ui alternative**: tailwind ui alternatives; tailwind ui free alternative; tailwind ui examples
- **tailwind ui vs**: tailwind ui vs shadcn; tailwind ui vs daisyui; tailwind ui vs bootstrap; tailwind ui vs flowbite; tailwind ui vs; tailwind ui vs tailwind css; tailwind ui vs material ui; tailwind ui examples
- **mui alternative**: mui alternatives; mui alternatives for react; mui alternatives for react native; mui datagrid alternatives; mui x alternative; mui table alternatives; mui datatables alternative
- **mui vs**: mui vs ui; mui vs shadcn; mui vs tailwind
- **chakra ui alternative**: chakra ui alternatives
- **mantine vs**: mantine vs shadcn; mantine vs mui; mantine vs; mantine vs series; mantine vs tailwind; mantine vs material ui; mantine vs bootstrap; mantine vs antd; mantine vs ant design
- **mantine alternative**: mantine alternatives; mantine ui alternative; mantine react table alternative
- **ant design alternative**: ant design alternatives; ant design pro alternative; ant design x alternative; is ant design free
- **heroui vs**: heroui vs shadcn; heroui vs mui; heroui vs mantine; heroui vs daisyui; heroui vs; heroui vs shadcn ui; heroui vs shadcn reddit; heroui vs material ui; heroui vs tailwind
- **daisyui vs**: daisyui vs shadcn; daisyui vs tailwind; daisyui vs bootstrap; daisyui vs flowbite; daisyui vs; daisyui vs bulma; daisyui vs mantine; daisyui vs shadcn ui; daisyui vs shadcn reddit; daisyui vs mui
- **radix themes vs**: radix themes vs shadcn; radix themes vs primitives; radix themes vs tailwind; radix ui themes vs primitives; radix ui themes vs shadcn; radix review
- **radix vs**: radix vs base ui; radix vs shadcn; radix vs radix pro; radix vs no radix; radix vs react aria; radix vs mui
- **park ui vs**: park ui vs shadcn
- **base ui vs**: base ui vs radix ui; base ui vs react aria; base ui vs shadcn; base ui vs mui; base ui vs radix ui vs react aria; base ui vs material ui; base ui vs; base ui vs headless ui; base ui vs radix ui performance
- **tailwind dashboard template**: tailwind dashboard template; tailwind dashboard template free; tailwind dashboard template free download; tailwind dashboard template github; tailwind dashboard template free html; tailwind dashboard template free github; tailwind dashboard template html; tailwind dashboard template free react; tailwind admin template; tailwind admin template free
- **nextjs dashboard template**: nextjs dashboard template; nextjs dashboard template free; nextjs dashboard template github; nextjs dashboard template shadcn; nextjs dashboard template with ai assistant; next js dashboard template free github; next js dashboard template free download; nextjs admin template free; nextjs admin template github; nextjs admin template shadcn
- **next js admin template**: next js admin template; next js admin template free; next js admin template github; next js admin template free download; next js admin template themeforest; next js admin template shadcn; next js admin template free github; next js admin template open source; next js admin template tailwind; next js admin template with typescript & shadcn ui
- **react dashboard components**: react dashboard components; react dashboard components library; react dashboard components free; react login components; react dashboard elements; react dashboard ui components; react admin dashboard components; react native dashboard components; react tailwind dashboard components; react components login page
- **dashboard component library**: dashboard component library; react dashboard component library; dashboard ui component library; best dashboard component library
- **tremor alternatives**: tremor alternatives
- **tremor ui alternative**: tremor ui alternative
- **tremor raw**: tremor raw
- **tremor vercel**: tremor vercel; tremor.acquired by vercel
- **tremor blocks**: tremor blocks
- **tremor so**: tremor so
- **tremor npm**: tremor npm; tremor npm package; npm tremor react; tremor package details
- **is tremor**: is tremoring a word
- **shadcn chart**: shadcn charts; shadcn chart library; shadcn chart components; shadcn chart ui; shadcn charts figma; shadcn charts and graphs; shadcn chart colors; shadcn charts examples
- **shadcn charts**: shadcn charts; shadcn charts library; shadcn charts figma; shadcn charts and graphs; shadcn charts ui; shadcn charts examples; shadcn charts vue; shadcn charts vs recharts; shadcn charts install; shadcn charts recharts
- **best shadcn chart**: best shadcn charts; best shadcn table
- **shadcn chart library**: shadcn chart library; shadcn table library; shadcn graph library
- **shadcn dashboard**: shadcn dashboard; shadcn dashboard templates; shadcn dashboard examples; shadcn dashboard blocks; shadcn dashboard github; shadcn dashboard ui; shadcn dashboard cards; shadcn dashboard design; shadcn dashboard components; shadcn dashboard demo
- **shadcn studio**: shadcn studio; shadcn studio mcp; shadcn studio pro; shadcn studio components; shadcn studio admin; shadcn studio github; shadcn studio builder; shadcn studio figma; shadcn studio discount code; shadcn studio reddit
- **shadcn ui kit**: shadcn ui kit; shadcn ui kit figma; shadcn ui kit pro; shadcn ui kit pro download; shadcn ui kit free download; shadcn ui kit free; shadcn ui kit dashboard; shadcn ui kit download; shadcn ui kit github; shadcn ui kit pro free download
- **shadcn pro**: shadcn progress bar; shadcn progress; shadcn pro; shadcn project; shadcn profile; shadcn profile page; shadcn prose; shadcn pro blocks; shadcn prompt input; shadcn product card
- **shadcn premium**: shadcn premium; shadcn premium templates; shadcn premium components; shadcn premium blocks; shadcn premium themes; shadcn premium dashboard; shadcn premium ui; shadcn tv premium; shadcnblocks premium shadcn ui kit
- **shadcn paid**: shadcn paid; shadcn paid components; shadcn paid templates; shadcn paid version; shadcn ui paid; shadcn is free or paid
- **shadcn ui blocks free**: shadcn ui blocks free
- **shadcn registry**: shadcn registry; shadcn registry mcp; shadcn registry directory; shadcn registry list; shadcn registry template; shadcn registry json; shadcn registry github; shadcn registry url; shadcn registry example; shadcn registry starter
- **shadcn registries**: shadcn registries; shadcn registry list; shadcn registries reddit; shadcn registries.json; best shadcn registries; shadcn ui registry; top shadcn registries; shadcn vue registries; shadcn mcp registries; popular shadcn registries
- **best shadcn registries**: best shadcn registries; top shadcn registries; popular shadcn registries; best shadcn component registries
- **awesome shadcn**: awesome shadcn; awesome shadcn ui; awesome shadcn github; awesome shadcn components; awesome shadcn svelte; awesome shadcn ui github; awesome shadcn vue; awesome shadcn themes; awesome shadcn registry; awesome shadcn blocks
- **untitled ui react**: untitled ui react; untitled ui react pro; untitled ui react components; untitled ui react free; untitled ui react native; untitled ui react pro solo; untitled ui react github; untitled ui react library; untitled ui react icons; untitled ui react download
- **untitled ui vs shadcn**: untitled ui vs shadcn
- **tailwind plus vs**: tailwind plus vs shadcn; tailwind plus vs; tailwind plus vs daisyui; tailwind plus vs flowbite; tailwind plus vs bootstrap; tailwind css vs plus
- **catalyst ui**: catalyst ui; catalyst ui kit; catalyst ui tailwind; catalyst ui kit zip download; catalyst ui kit zip; catalyst ui kit download; catalyst ui kit free download; catalyst ui kit figma; catalyst ui figma
- **catalyst vs shadcn**: catalyst vs shadcn; tailwind catalyst vs shadcn; catalyst ui vs shadcn
- **react aria vs**: react aria vs base ui; react aria vs radix; react aria vs shadcn; react aria vs radix ui; react aria vs react spectrum; react aria vs mui; react aria vs; react aria vs ariakit; react aria vs ark ui; react aria vs mantine
- **magic ui pro**: magic ui pro; magic ui pro free; magic ui pro font; magic ui pro template; magic ui promo code; magic ui progress bar; magic ui pro components; magic ui progressive blur; magic ui scroll progress; magic ui affiliate program
- **origin ui**: origin ui; origin ui react; origin ui shadcn; origin ui github; origin ui kit; origin ui library
- **coss ui**: coss ui; coss ui vs shadcn; coss ui github; coss ui tabs; coss ui table; coss ui sidebar; coss ui figma; coss ui reddit; coss ui origin; coss ui mcp
- **aceternity ui pro**: aceternity ui pro; aceternity ui pro free download; aceternity ui pro free
- **shadcnblocks**: shadcnblocks; shadcnblocks premium; shadcnblocks admin kit; shadcnblocks mcp; shadcnblocks pro; shadcnblocks admin; shadcnblocks vs; shadcnblocks reddit; shadcnblocks github; shadcnblocks dashboard
- **shadcnblocks vs**: shadcnblocks vs; shadcn blocks vs components
- **shadcn ui vs tailwind ui**: shadcn ui vs tailwind ui; shadcn ui tailwind ui; tailwind ui examples
- **chakra vs**: chakra vs shadcn
- **chakra ui vs**: chakra ui vs shadcn; chakra ui vs material ui; chakra ui vs tailwind; chakra ui vs mantine; chakra ui vs mui; chakra ui vs; chakra ui vs tailwind css; chakra ui vs bootstrap; chakra ui vs shadcn reddit
- **mui vs shadcn**: mui vs shadcn; mui vs shadcn ui; mui vs shadcn reddit; mui or shadcn; react mui vs shadcn; mui vs shadcn vs mantine; mui vs shadcn vs tailwind; mui material vs shadcn; mui or shadcn ui
- **ant design vs**: ant design vs material ui; ant design vs mui; ant design vs shadcn; ant design vs mantine; ant design vs shadcn ui; ant design vs tailwind; ant design vs; ant design vs bootstrap; ant design vs chakra ui; ant design vs tailwind css
- **mantine vs shadcn**: mantine vs shadcn; mantine vs shadcn ui; mantine vs shadcn 2026; mantine or shadcn; mantine or shadcn reddit; mantine ui shadcn; mantine ui vs shadcn reddit; mantine vs shadcn vs mui; mantine vs chakra vs shadcn
- **best ui library for nextjs**: best ui library for nextjs; best ui library for nextjs reddit; best ui framework for nextjs; best ui component library for nextjs; best free ui library for nextjs; best tailwind ui library for nextjs; best ui library for react next js; most popular react ui libraries; most popular ui libraries; next js vs nuxt js vs nestjs
- **best component library for nextjs**: best component library for nextjs; best ui component library for nextjs; best free component library for nextjs
- **best ui library for react 2026**: best ui library for react 2026; best ui framework for react 2026; best ui library for react native 2026; best ui component library for react 2026; most popular react ui libraries; react ui examples; react most popular ui framework
- **react ui library comparison**: react ui library comparison; react native ui library comparison; react ui examples; most popular react ui libraries; react ui components examples
- **shadcn ui pros and cons**: shadcn ui pros and cons
- **is shadcn worth it**: is shadcn worth it; is shadcn worth it reddit; is shadcn blocks worth it; is shadcn studio worth it; is shadcn ui kit worth it
- **why shadcn**: why shadcn; why shadcn is so popular; why shadcn ui; why shadcn is bad; why shadcn uses oklch; shadcn why use; shadcn why no cursor pointer; why use shadcn ui; why is shadcn good; why is shadcn free
- **should i use shadcn**: should i use shadcn; should i use shadcn ui; should i use shadcn reddit; can i use shadcn in react native; can i use shadcn in react; can i use shadcn in angular; can i use shadcn without tailwind; can i use shadcn ui in react native; can i use shadcn without typescript; can i use shadcn without react
- **shadcn or**: shadcn org chart; shadcn or mui; shadcn or tailwind; shadcn origin ui; shadcn or radix; shadcn or material ui; shadcn origin; shadcn or daisyui; shadcn or mantine; shadcn ordered list
- **ai ready components**: ai ready components; ai ready component library
- **ai agent dashboard**: ai agent dashboard; ai agent dashboard ui; ai agent dashboard design; ai agent dashboard github; ai agent dashboard examples; ai agent dashboard reddit; ai agent dashboard ui design; ai agent dashboard template; ai agent dashboard servicenow; ai agent dashboard ideas
- **agent ready ui**: agent ready ui
- **react admin vs**: react admin vs refine; react admin vs; react admin vs adminjs; react admin vs refine reddit; react admin vs tailadmin; react admin or refine
- **best dashboard ui kit**: best dashboard ui kit; best dashboard ui kit figma
- **best saas dashboard template**: best saas dashboard templates; best saas dashboard examples; saas dashboard examples; dashboard template examples; saas best examples
- **best nextjs dashboard template**: best next js dashboard template; best nextjs admin template; next js dashboard example; dashboard template examples; next js layout example; next js best practices
- **best tailwind dashboard template**: best tailwind dashboard template; best tailwind admin template; best free tailwind admin template; dashboard template examples
- **free shadcn dashboard**: free shadcn dashboard; free shadcn dashboard template; free shadcn admin dashboard; free shadcn ui dashboard; best free shadcn dashboard
- **shadcn admin dashboard**: shadcn admin dashboard; shadcn admin dashboard template; shadcn admin dashboard github; shadcn admin dashboard template free; shadcn admin dashboard free; shadcn admin dashboard nextjs; shadcn admin dashboard demo; shadcn admin dashboard example; shadcn admin dashboard ui; shadcn admin dashboard starter
- **best free react admin template**: best free react admin template; best free react admin dashboard; best free react dashboard templates
- **tailadmin**: tailadmin; tailadmin react; tailadmin pro; tailadmin github; tailadmin angular; tailadmin dashboard; tailadmin next.js; tailadmin free; tailadmin vue; tailadmin template
- **untitled ui**: untitled ui; untitled ui react; untitled ui icons; untitled ui figma; untitled ui design system; untitled ui vs shadcn; untitled ui components; untitled ui kit; untitled ui discount code; untitled ui mcp
- **ui libraries like shadcn**: ui libraries like shadcn; ui frameworks like shadcn; best ui libraries like shadcn; react ui libraries like shadcn; ui component library like shadcn; react native ui library like shadcn; most popular ui libraries
- **libraries like shadcn**: libraries like shadcn; libraries like shadcn ui; component libraries like shadcn; other libraries like shadcn; react libraries like shadcn; best ui libraries like shadcn; react ui libraries like shadcn
- **like shadcn but**: shadcn like button; like dissolves like adalah; like dissolves like examples; like vs alike; like o like h meaning
- **shadcn for vue**: shadcn for vue; shadcn for vue js; shadcn for vue 3; shadcn for vue reddit; shadcn ui for vue; shadcn alternative for vue; shadcn ui for vue js; shadcn equivalent for vue; shadcn vue mcp; shadcn vue github
- **kibo ui**: kibo ui; kibo ui patterns; kibo ui shadcn; kibo ui mcp; kibo ui github; kibo ui components; kibo ui figma; kibo ui table; kibo ui tree; kibo ui calendar
- **reui**: reui
- **shadcn charts vs tremor**: tremor vs shadcn charts
- **tremor vs recharts**: tremor vs recharts
- **echarts vs recharts**: echarts vs recharts; charts vs recharts; echarts or recharts; apache echarts vs recharts; echarts for react vs recharts
- **apexcharts vs recharts**: apexcharts vs recharts; react apexcharts vs recharts
- **visx vs d3**: visx vs d3
- **nivo charts**: nivo charts; nivo charts react; nivo charts examples; nivo charts npm; nivo charts documentation; nivo charts website; nivo charts github; nivo charts react example; nivo charts docs; nivo charts library
- **dashboard chart library**: dashboard chart library; dashboard chart examples; dashboard chart types
