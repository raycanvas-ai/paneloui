"use client";

import { GitHubStars } from "@/components/application/site/github-stars";
import { lazy, Suspense, useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiArrowDownSFill,
  RiArrowRightLine,
  RiCheckLine,
  RiFileCopyLine,
  RiFlashlightFill,
  RiSparkling2Line,
} from "@remixicon/react";

import { PreviewCard } from "@/components/application/app-shell/components-catalog";
import { ALL_ENTRIES, COMPONENT_SECTIONS } from "@/components/application/docs/components-index";
import { AGENT_DEMO } from "@/components/application/docs/docs-shell";
import { ScreenFrame } from "@/components/application/docs/preview-frames";
import { pill, SiteTabPanel, SiteTabs } from "@/components/application/site/site-ui";
import { ThemeToggle } from "@/components/application/theme/theme-toggle";
import { Logo } from "@/components/foundations/brand/logo";
import { BalanceChart } from "@/components/panelo/blocks/charts/balance-chart";
import { RevenueChart } from "@/components/panelo/blocks/charts/revenue-chart";
import { TrendsChart } from "@/components/panelo/blocks/charts/trends-chart";
import { Button } from "@/components/panelo/ui/button";
import { Progress, ProgressLabel } from "@/components/panelo/ui/progress";
import { Switch } from "@/components/panelo/ui/switch";
import { cx } from "@/utils/cx";
import { PRO_PARTS } from "@pro";

/** A piece of a pro screen, or null in a clone without components/panelo/pro. */
const proPart = (name: string): ComponentType | null => {
  const load = PRO_PARTS[name];
  return load ? lazy(() => load().then((Part) => ({ default: Part }))) : null;
};
const ProStatCard = proPart("stat-card");
const ProCrmTable = proPart("crm-table");
const ProSidebar = proPart("app-sidebar");

const byHref = (href: string) => ALL_ENTRIES.find((e) => e.href === href)!;
const sectionOf = (id: string) => COMPONENT_SECTIONS.find((s) => s.id === id)?.entries ?? [];
const proCount = ALL_ENTRIES.filter((e) => e.tier === "pro").length;
const freeCount = ALL_ENTRIES.length - proCount;

const NAV = [
  { label: "Components", href: "/components" },
  { label: "Templates", href: "/components#dashboard-pages" },
  { label: "Agent demo", href: AGENT_DEMO },
  { label: "Pricing", href: "#pricing" },
];

const STACK = [
  ["React", "19.2"],
  ["Next.js", "16"],
  ["Tailwind CSS", "v4"],
  ["Vercel UI SDK", "beta"],
  ["Recharts", "v3"],
];

/** A Panelo component on a card surface; `data-panelo` themes it through the token bridge. */
function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div data-panelo className={cx("overflow-hidden rounded-[14px] border border-site-hairline bg-card p-4 text-foreground", className)}>
      {children}
    </div>
  );
}

/** For components that draw their own surface: themed, no extra card. */
function Bare({ children }: { children: ReactNode }) {
  return (
    <div data-panelo className="text-foreground">
      {children}
    </div>
  );
}

/** A centred section title over two lines, with an optional line under it. */
function SectionHead({ title, body }: { title: ReactNode; body?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 text-center">
      <h2 className="text-site-heading text-balance text-site-ink">{title}</h2>
      {body && <div className="mt-4 max-w-[560px] text-site-lead text-pretty text-site-muted">{body}</div>}
    </div>
  );
}

function SiteHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLocaleLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        router.push("/components?search");
      }
    };
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [router]);

  return (
    <header
      className={cx(
        "sticky top-0 z-40 border-b bg-site-page/85 backdrop-blur-md transition-colors duration-200",
        scrolled ? "border-site-hairline" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1056px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring">
            <Logo size={20} />
            <span className="text-site-question text-site-ink">Panelo UI</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className={pill("ghost", "sm", "h-8 px-[11px]")}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <GitHubStars className="hidden lg:inline-flex" />
          <ThemeToggle appearance="segmented" size="small" className="hidden sm:inline-flex" />
          <Link href="#pricing" className={cx(pill("pro"), "hidden sm:inline-flex")}>
            <RiFlashlightFill aria-hidden />
            Get Pro
          </Link>
          <Link href="/components" className={pill("primary")}>
            Browse components
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-[1008px] flex-col items-center px-6 pt-14 text-center sm:pt-24">
      <Link
        href="/components"
        className="inline-flex h-[30px] items-center gap-2 rounded-full bg-site-pill ps-1 pe-3 text-site-body text-site-muted transition-colors hover:bg-site-pill-hover"
      >
        <span className="rounded-full bg-site-ring px-2 text-site-chip text-site-ink">{freeCount} free</span>
        {ALL_ENTRIES.length} components, blocks &amp; pages
        <RiArrowRightLine className="size-3.5" aria-hidden />
      </Link>
      <h1 className="mt-5 max-w-[760px] text-site-display-sm text-balance text-site-ink sm:text-site-display">Dashboards AI agents can operate</h1>
      <p className="mt-4 max-w-[660px] text-site-lead text-pretty text-site-muted">
        React components, charts and full dashboard pages, built on Vercel&apos;s UI SDK.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link href="/components" className={pill("primary", "lg")}>
          Browse components
        </Link>
        <Link href={AGENT_DEMO} className={pill("secondary", "lg")}>
          Try the agent demo
        </Link>
      </div>
    </section>
  );
}

/** The CRM template's revenue chart with the headline it sits under on that page. */
function RevenueLines({ className }: { className?: string }) {
  return (
    <Panel className={className}>
      <p className="text-sm text-muted-foreground">Total Revenue</p>
      <p className="mb-3 text-2xl font-semibold tracking-tight">$21,572.99</p>
      <RevenueChart />
    </Panel>
  );
}

/** What the assistant shows before a destructive step: it acts only after Approve. */
function ApprovalCard() {
  return (
    <Panel className="flex flex-col gap-3">
      <span className="flex items-center gap-2 text-sm font-medium">
        <RiSparkling2Line className="size-4 text-primary" aria-hidden />
        Assistant wants to
      </span>
      <p className="text-sm text-muted-foreground">Delete the Twitter Brand Monitor workflow. This can&apos;t be undone.</p>
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" data-agent-confirm="Delete the Twitter Brand Monitor workflow">
          Approve
        </Button>
        <Button size="sm" variant="outline">
          Decline
        </Button>
      </div>
    </Panel>
  );
}

const PERMISSIONS: [string, boolean][] = [
  ["Pause workflows", true],
  ["Change filters", true],
  ["Delete without asking", false],
];

function PermissionsCard() {
  return (
    <Panel className="flex flex-col gap-3.5">
      <span className="text-sm font-medium">Agent permissions</span>
      {PERMISSIONS.map(([label, on]) => (
        <label key={label} className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          {label}
          <Switch defaultChecked={on} aria-label={label} />
        </label>
      ))}
    </Panel>
  );
}

const AGENT_STEPS: [string, number | null][] = [
  ["Reading the dashboard", 100],
  ["Filtering active workflows", 60],
  ["Waiting for your approval", null],
];

function AgentProgress() {
  return (
    <Panel className="flex flex-col gap-3.5">
      {AGENT_STEPS.map(([label, value]) => (
        <Progress key={label} value={value} className="flex flex-col gap-1.5">
          <ProgressLabel className="text-sm text-muted-foreground">{label}</ProgressLabel>
        </Progress>
      ))}
    </Panel>
  );
}

/**
 * The hero's wall of live components: two rows of fixed-height tiles on a canvas
 * wider than the page, centred, fading out at both edges.
 */
function Showcase() {
  return (
    <section
      aria-label="Live components"
      className="mt-16 w-full overflow-x-clip pb-4 [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
    >
      <div className="relative left-1/2 flex w-[1900px] -translate-x-1/2 flex-col items-center gap-3.5">
        <div className="flex h-[344px] items-start gap-3.5 [&>*]:shrink-0">
          <div className="h-full w-[420px]">
            <Panel className="h-full">
              <BalanceChart compact />
            </Panel>
          </div>
          <div className="h-full w-[520px]">
            <Panel className="h-full">
              <TrendsChart />
            </Panel>
          </div>
          <div className="h-full w-[560px]">
            <RevenueLines className="h-full" />
          </div>
        </div>
        <div className="flex h-[540px] items-start gap-3.5 [&>*]:shrink-0">
          <div className="flex w-[400px] flex-col gap-3.5">
            {ProStatCard ? (
              <Bare>
                <Suspense>
                  <ProStatCard />
                </Suspense>
              </Bare>
            ) : null}
            <ApprovalCard />
          </div>
          {ProCrmTable ? (
            <Panel className="flex h-[540px] w-[790px] p-0">
              <Suspense>
                <ProCrmTable />
              </Suspense>
            </Panel>
          ) : null}
          {ProSidebar ? (
            <Panel className="h-[540px] w-[260px] p-0">
              <Suspense>
                <ProSidebar />
              </Suspense>
            </Panel>
          ) : null}
          <div className="flex w-[400px] flex-col gap-3.5">
            <PermissionsCard />
            <AgentProgress />
          </div>
        </div>
      </div>
    </section>
  );
}

function BuiltWith() {
  return (
    <section aria-label="Built with" className="mx-auto mt-20 flex w-full max-w-[1096px] flex-col items-center gap-5 px-6">
      <p className="text-site-body text-site-muted">Built with</p>
      <ul className="flex flex-wrap items-baseline justify-center gap-x-12 gap-y-4">
        {STACK.map(([name, version]) => (
          <li key={name} className="flex items-baseline gap-1.5 text-site-plan text-site-faint">
            {name}
            <span className="text-site-count">{version}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const INSTALL_ITEMS = ["dashboard-pages-11", "agent-ui", "sidebars-1", "calendars-2", "agent-kit", "login-pages-1"];

/** The registry command, its item name cycling through real registry items. */
function InstallLine() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % INSTALL_ITEMS.length), 2200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <code className="font-mono text-site-body text-site-muted">
      <span className="text-site-faint">$ </span>npx shadcn@latest add <span className="text-site-pro-text">@panelo/{INSTALL_ITEMS[i]}</span>
    </code>
  );
}

const LIBRARY_TABS = [
  { value: "pages", label: "Dashboard pages", hrefs: ["dashboard-pages-10", "dashboard-pages-11", "dashboard-pages-8", "dashboard-pages-12", "dashboard-pages-7", "dashboard-pages-9"] },
  { value: "calendars", label: "Calendars", hrefs: ["calendars-1", "calendars-2"] },
  { value: "charts", label: "Charts", hrefs: ["sales-trend", "revenue-chart", "trends-chart", "balance-chart", "contribution-chart", "link-graph"] },
  { value: "blocks", label: "Blocks", hrefs: ["sidebars-1", "elements-1", "elements-2", "login-pages-1"] },
]

function LibrarySection() {
  const [tab, setTab] = useState(LIBRARY_TABS[0].value);
  return (
    <section className="mx-auto mt-36 flex w-full max-w-[1144px] flex-col items-center px-6">
      <SectionHead
        title={
          <>
            Components first,
            <br />
            whole dashboards too
          </>
        }
        body={<InstallLine />}
      />
      <SiteTabs center label="Library" items={LIBRARY_TABS} value={tab} onValueChange={setTab} className="mt-8 w-full">
        {LIBRARY_TABS.map((item) => (
          <SiteTabPanel key={item.value} value={item.value} className="pt-8">
            {tab === item.value && (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {item.hrefs.map((slug) => (
                  <PreviewCard key={slug} entry={byHref(`/components/${slug}`)} />
                ))}
              </div>
            )}
          </SiteTabPanel>
        ))}
      </SiteTabs>
      <Link href="/components" className={cx(pill("secondary", "lg"), "mt-10")}>
        Explore all components
      </Link>
    </section>
  );
}

const TEMPLATE_TABS = [
  { value: "dashboard-pages-10", label: "Workflow builder" },
  { value: "dashboard-pages-11", label: "AI automation" },
  { value: "dashboard-pages-8", label: "Finance" },
  { value: "dashboard-pages-12", label: "Marketing" },
  { value: "dashboard-pages-7", label: "Team inbox" },
  { value: "dashboard-pages-9", label: "Task board" },
];

function ScreensSection() {
  const [tab, setTab] = useState(TEMPLATE_TABS[0].value);
  return (
    <section className="mx-auto mt-36 flex w-full max-w-[1056px] flex-col items-center px-6">
      <SectionHead
        title={
          <>
            Complete pages,
            <br />
            not just parts
          </>
        }
      />
      <SiteTabs center label="Templates" items={TEMPLATE_TABS} value={tab} onValueChange={setTab} className="mt-8 w-full">
        {TEMPLATE_TABS.map((item) => (
          <SiteTabPanel key={item.value} value={item.value} className="pt-8">
            {tab === item.value && (
              <div className="rounded-[16px] border border-site-hairline bg-site-surface p-1.5">
                <div className="relative aspect-[1280/855] overflow-hidden rounded-[10px] bg-site-preview ring-1 ring-site-hairline ring-inset">
                  <ScreenFrame>
                    <iframe src={`/preview/${item.value}`} title={`${item.label} template`} loading="lazy" className="size-full border-0" />
                  </ScreenFrame>
                </div>
              </div>
            )}
          </SiteTabPanel>
        ))}
      </SiteTabs>
      <Link href="#pricing" className={cx(pill("pro", "lg"), "mt-10")}>
        <RiFlashlightFill aria-hidden />
        {sectionOf("dashboard-pages").length} pages in Pro – from $249 once
      </Link>
    </section>
  );
}

const AGENT_KIT = "npx shadcn@latest add @panelo/agent-kit";

function AgentSection() {
  const [copied, setCopied] = useState(false);
  return (
    <section className="mx-auto mt-36 flex w-full max-w-[1056px] flex-col items-center px-6">
      <SectionHead
        title={
          <>
            Built for agents,
            <br />
            not just for clicks
          </>
        }
        body="Every control is a UI SDK part. The assistant reads the page, acts through it, and asks before anything destructive."
      />
      <div className="mt-10 grid w-full grid-cols-1 gap-3.5 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-[16px] border border-site-hairline bg-site-surface p-1.5">
          <div className="relative h-[460px] overflow-hidden rounded-[10px] bg-site-preview ring-1 ring-site-hairline ring-inset">
            <iframe src={AGENT_DEMO} title="Automation dashboard with its AI assistant" loading="lazy" className="size-full border-0" />
          </div>
        </div>
        <div className="flex flex-col rounded-[16px] border border-site-hairline bg-site-surface p-5">
          <h3 className="text-site-body-medium text-site-ink">Add the assistant in one line</h3>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-site-pill p-3">
            <code className="min-w-0 flex-1 font-mono text-site-body break-words text-site-ink">{AGENT_KIT}</code>
            <button
              type="button"
              aria-label="Copy the agent kit install command"
              onClick={async () => {
                await navigator.clipboard.writeText(AGENT_KIT);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              }}
              className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-site-muted outline-none hover:text-site-ink focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              {copied ? <RiCheckLine className="size-3.5" aria-hidden /> : <RiFileCopyLine className="size-3.5" aria-hidden />}
            </button>
          </div>
          <p className="mt-4 text-site-text text-site-muted">
            The UI SDK agent bridge with approval prompts, a chat hook and a Claude-powered <code className="font-mono text-site-ink">/api/agent</code>{" "}
            route. Agents act through the same parts your clicks use.
          </p>
          <div className="mt-auto pt-6">
            <Link href={AGENT_DEMO} target="_blank" rel="noreferrer" className={pill("secondary", "lg", "h-9 px-4")}>
              Open the demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const CHARTS: { title: string; description: string; href: string; chart: ReactNode }[] = [
  { title: "Revenue lines", description: "Two revenue series with keyboard-navigable points and a hover readout.", href: "/components/revenue-chart", chart: <RevenueLines /> },
  { title: "Marketing trends", description: "Three series with a period menu and a crosshair readout.", href: "/components/trends-chart", chart: <Bare><TrendsChart /></Bare> },
  { title: "Current balance", description: "Stacked monthly bars with a category breakdown on hover.", href: "/components/balance-chart", chart: <Bare><BalanceChart compact /></Bare> },
];

function ChartsSection() {
  return (
    <section className="mx-auto mt-36 flex w-full max-w-[1056px] flex-col items-center px-6">
      <SectionHead
        title={
          <>
            Charts that make
            <br />
            your data worth reading
          </>
        }
      />
      <div className="mt-10 grid w-full grid-cols-1 gap-3.5 lg:grid-cols-2">
        {CHARTS.map((item) => (
          <article key={item.href} className="relative flex flex-col rounded-[16px] border border-site-hairline bg-site-surface p-1.5">
            <div className="relative flex h-[340px] flex-col justify-center overflow-hidden rounded-[10px] bg-site-preview p-4 ring-1 ring-site-hairline ring-inset">
              {item.chart}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-transparent to-site-preview" />
            </div>
            <div className="px-3 pt-3.5 pb-4">
              <h3 className="text-site-question text-site-ink">
                <Link href={item.href} className="outline-none after:absolute after:inset-0 after:rounded-[16px] focus-visible:after:ring-2 focus-visible:after:ring-border-focus-ring">
                  {item.title}
                </Link>
              </h3>
              <p className="mt-1 text-site-text text-site-muted">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const PLANS = [
  {
    name: "Free",
    blurb: "The free components and blocks, yours to keep.",
    price: "$0",
    note: "forever",
    chip: `${freeCount} free items`,
    cta: "Browse components",
    href: "/components",
    features: ["Lifetime access", "Unlimited projects", "All free blocks", "UI SDK parts", "Light and dark themes"],
  },
  {
    name: "Essentials",
    blurb: "For solo founders shipping polished dashboards.",
    price: "$249",
    was: "$349",
    note: "once",
    chip: "1 seat",
    cta: "Buy Essentials",
    href: "/checkout?plan=essentials",
    features: ["Everything in Free", "Premium blocks", "AI assistant kit", "Premium code snippets", "Regular updates", "Priority support"],
  },
  {
    name: "Complete",
    blurb: "The whole system: blocks, elements and full pages.",
    price: "$299",
    was: "$399",
    note: "once",
    chip: "Most popular",
    cta: "Get Complete",
    href: "/checkout?plan=complete",
    featured: true,
    features: ["Everything in Essentials", "Full dashboard pages", "Sidebars and headers", "Dashboard elements", "Settings pages", "Analytics pages"],
  },
  {
    name: "Team",
    blurb: "For teams and agencies building at scale.",
    price: "$499",
    was: "$799",
    note: "once",
    chip: "10 seats",
    cta: "Get Team",
    href: "/checkout?plan=team",
    features: ["Everything in Complete", "10 team members", "High-priority support"],
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="mx-auto mt-36 flex w-full max-w-[1144px] scroll-mt-20 flex-col items-center px-6">
      <SectionHead title="Pay once, own the code" body="One payment, no subscription. Every component is copied into your project as source, so it stays yours." />
      <div className="mt-10 grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cx(
              // Every card carries a 1px border so the featured one doesn't sit 1px lower than its neighbours.
              "flex flex-col rounded-[16px] border p-5",
              plan.featured ? "border-site-hairline bg-site-surface shadow-site-raised" : "border-transparent bg-site-pill",
            )}
          >
            <span className="text-site-plan text-site-ink">{plan.name}</span>
            <span className="mt-1 text-site-text text-site-muted">{plan.blurb}</span>
            <div className="mt-5 flex items-baseline gap-2">
              {plan.was && <span className="text-site-plan text-site-faint line-through">{plan.was}</span>}
              <span className="text-site-price text-site-ink">{plan.price}</span>
              <span className="text-site-lead text-site-muted">/{plan.note}</span>
            </div>
            <div className="mt-2 h-6">
              {plan.chip && (
                <span className={cx("inline-flex h-6 items-center rounded-full px-2.5 text-site-body", plan.featured ? "bg-site-pro text-site-pro-text shadow-site-pro" : "bg-site-pill text-site-muted")}>
                  {plan.chip}
                </span>
              )}
            </div>
            <ul className="mt-5 flex flex-col gap-2.5 border-t border-site-hairline pt-5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-site-text text-site-ink">
                  <span className={cx("mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full", plan.featured ? "bg-site-pro text-site-pro-icon" : "bg-site-surface text-site-muted")}>
                    <RiCheckLine className="size-3" aria-hidden />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <Link href={plan.href} className={pill(plan.featured ? "primary" : "secondary", "lg", "h-10 w-full")}>
                {plan.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "What makes Panelo agent-ready?",
    a: "Every control is a part from Vercel's UI SDK. An agent reads the page as a list of named controls and acts through the same component API your clicks use, so it never guesses at pixels. Destructive actions are marked, and the agent has to ask you first.",
  },
  {
    q: "Do I need an AI API key?",
    a: "Not for the components: they are plain React and work without any model. Only the in-app assistant (agent-kit) calls a model, and it needs ANTHROPIC_API_KEY on your server.",
  },
  {
    q: "How do I install a component?",
    a: 'Add "@panelo": "https://panelo.com/r/{name}.json" under registries in components.json, then run npx shadcn@latest add @panelo/<item>. The source lands in your project.',
  },
  {
    q: "Does it work in my shadcn/ui project?",
    a: "Yes. Panelo installs with the shadcn CLI into components/panelo-ui, next to your components/ui, so nothing collides.",
  },
  { q: "Do I own the code?", a: "Yes. It is copied into your repository as source. Change anything." },
  { q: "Is Pro a one-time payment?", a: "Yes. Pay once, no subscription, and keep the code forever." },
  { q: "Does it support dark mode?", a: "Every component, block and template ships light and dark, driven by the same tokens." },
];

function FaqSection() {
  return (
    <section className="mx-auto mt-36 flex w-full max-w-[1056px] flex-col items-center px-6">
      <SectionHead title="Frequently asked questions" />
      <div className="mt-8 w-full max-w-[640px]">
        {FAQ.map((item, i) => (
          <details key={item.q} open={i === 0} className="group border-b border-site-hairline">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-site-question text-site-ink outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring [&::-webkit-details-marker]:hidden">
              {item.q}
              <RiArrowDownSFill className="size-4 shrink-0 text-site-faint transition-transform duration-200 group-open:rotate-180" aria-hidden />
            </summary>
            <p className="pb-5 text-site-text text-pretty text-site-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Library",
    links: [
      { label: "Dashboard pages", href: "/components#dashboard-pages" },
      { label: "Profile pages", href: "/components#profile-pages" },
      { label: "Charts", href: "/components#charts" },
      { label: "Calendars", href: "/components#calendars" },
    ],
  },
  {
    title: "Blocks",
    links: [
      { label: "Sidebars", href: "/components#sidebars" },
      { label: "Elements", href: "/components#elements" },
      { label: "Login pages", href: "/components#login-pages" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Agent demo", href: AGENT_DEMO },
      { label: "Templates", href: "/components#dashboard-pages" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
];

function SiteFooter() {
  return (
    <footer className="mx-auto mt-36 w-full max-w-[1056px] px-6 pt-6 pb-20">
      <div className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex w-fit items-center gap-2">
            <Logo size={16} />
            <span className="text-site-question text-site-ink">Panelo UI</span>
          </Link>
          <p className="max-w-[260px] text-site-body text-site-muted">Agent-ready React dashboards – built on Vercel&apos;s UI SDK.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-8 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-1.5">
              <span className="text-site-body-medium text-site-ink">{column.title}</span>
              {column.links.map((link) => (
                <Link key={link.label} href={link.href} className="text-site-body text-site-muted transition-colors hover:text-site-ink">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <p className="mt-14 text-site-body text-site-muted">© 2026 Panelo UI</p>
    </footer>
  );
}

/** panelo.com's home: the marketing page, every section built from the library's own live components. */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-site-page font-sans text-site-ink">
      <SiteHeader />
      <main>
        <Hero />
        <Showcase />
        <BuiltWith />
        <LibrarySection />
        <ScreensSection />
        <AgentSection />
        <ChartsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
