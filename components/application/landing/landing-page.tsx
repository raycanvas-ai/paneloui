"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiAddLine, RiArrowRightLine, RiCheckLine, RiCloseLine, RiDeleteBinLine, RiFileCopyLine, RiLoader4Line, RiSparkling2Line, RiVercelFill } from "@remixicon/react";
import { createAgent, type AgentComponent } from "@ui-sdk/react/agent";
import { elementOf } from "@ui-sdk/react/observe";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";

import { ALL_ENTRIES, COMPONENT_SECTIONS, installCommand } from "@/components/application/docs/components-index";
import { AGENT_DEMO } from "@/components/application/docs/docs-shell";
import { LAUNCH_OFF, PLANS } from "@/components/application/site/pricing";
import { ScreenFrame } from "@/components/application/docs/preview-frames";
import { AuthButton } from "@/components/application/site/auth-button";
import { GitHubStars } from "@/components/application/site/github-stars";
import { pill } from "@/components/application/site/site-ui";
import { ThemeToggle } from "@/components/application/theme/theme-toggle";
import { Logo } from "@/components/foundations/brand/logo";
import { ActivityHeatmap } from "@/components/panelo/blocks/charts/activity-heatmap";
import { BalanceChart } from "@/components/panelo/blocks/charts/balance-chart";
import { ContributionChart } from "@/components/panelo/blocks/charts/contribution-chart";
import { RevenueChart } from "@/components/panelo/blocks/charts/revenue-chart";
import { SalesTrendPanel } from "@/components/panelo/blocks/charts/sales-chart";
import { TrendsChart } from "@/components/panelo/blocks/charts/trends-chart";
import { Button } from "@/components/panelo/ui/button";
import { Progress, ProgressLabel } from "@/components/panelo/ui/progress";
import { Switch } from "@/components/panelo/ui/switch";
import { cx } from "@/utils/cx";
import { PRO_PARTS } from "@pro";

// Steps on anything marked `data-agent-confirm` wait for a person. The hero answers through
// `askPerson`; anywhere else on this page nobody is asked, so those steps are refused.
let askPerson: ((text: string, signal: AbortSignal) => Promise<boolean>) | null = null;

// The page's agent bridge. It only hears components made after it, so it is created when this
// module loads, in the browser only.
const agent =
  typeof window === "undefined"
    ? null
    : createAgent({
        allow: (step, { signal }) => !step.confirm || (askPerson ? askPerson(step.confirm, signal) : false),
      });

/** Whether the component behind an agent ref sits inside `box`. Refs that left the page throw. */
const inside = (box: Element, ref: string) => {
  try {
    return box.contains(elementOf(ref));
  } catch {
    return false;
  }
};
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** A piece of a pro screen, or null in a clone without components/panelo/pro. */
const proPart = (name: string): ComponentType | null => {
  const load = PRO_PARTS[name];
  return load ? lazy(() => load().then((Part) => ({ default: Part }))) : null;
};
const ProStatCard = proPart("stat-card");
const ProSidebar = proPart("app-sidebar");

const byHref = (href: string) => ALL_ENTRIES.find((e) => e.href === href)!;
const sectionOf = (id: string) => COMPONENT_SECTIONS.find((s) => s.id === id)?.entries ?? [];
const proCount = ALL_ENTRIES.filter((e) => e.tier === "pro").length;

// Root-relative hashes, so the header works the same on /templates as on the home page.
const NAV = [
  { label: "Components", href: "/components" },
  { label: "Templates", href: "/templates" },
  { label: "Agent demo", href: AGENT_DEMO },
  { label: "Pricing", href: "/#pricing" },
];

// One column, one gutter, one rhythm: every row of the page starts on the same edge.
export const CONTAINER = "mx-auto w-full max-w-[1152px] px-6";
export const SECTION = "py-20 sm:py-28";
export const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";
export const TEXT_LINK = cx("rounded-sm text-site-muted transition-colors duration-150 hover:text-site-ink", FOCUS);
// Entrances use @starting-style: no keyframes, and nothing moves under reduced motion.
const ENTER = "transition-[opacity,translate] duration-300 ease-out starting:translate-y-1 starting:opacity-0 motion-reduce:transition-none";

/** A Panelo component on a card surface; `data-panelo` themes it through the token bridge. */
function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div data-panelo className={cx("overflow-hidden rounded-xl border border-site-hairline bg-card p-4 text-foreground", className)}>
      {children}
    </div>
  );
}

/** For components that draw their own surface: themed, no extra card. */
function Bare({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div data-panelo className={cx("text-foreground", className)}>
      {children}
    </div>
  );
}

/** "Label →", the arrow nudging on hover. */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(TEXT_LINK, "group inline-flex items-center gap-1 text-site-body-medium", className)}>
      {children}
      <RiArrowRightLine className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
    </Link>
  );
}

/** A section's opening line: the claim in ink, its support in grey, one sentence at heading size. */
export function Heading({ title, body, className, as: Tag = "h2" }: { title: ReactNode; body: ReactNode; className?: string; as?: "h1" | "h2" }) {
  return (
    <Tag className={cx("max-w-[720px] text-site-heading text-balance sm:text-site-display-sm", className)}>
      <span className="text-site-ink">{title}</span> <span className="text-site-muted">{body}</span>
    </Tag>
  );
}

/**
 * One card anatomy for the whole page: a 6px mat around a stage on a concentric radius
 * (16 - 6 = 10), then a single sentence, its lead in ink.
 */
/** An identifier in running text. */
function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-body-2-regular text-site-ink">{children}</code>;
}

function Feature({ title, body, stage, className, children }: { title: ReactNode; body: ReactNode; stage?: string; className?: string; children: ReactNode }) {
  return (
    <article className={cx("flex min-w-0 flex-col rounded-2xl bg-site-surface p-1.5 ring-1 ring-site-hairline", className)}>
      <div className={cx("relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[10px] bg-site-preview p-6", stage)}>{children}</div>
      <p className="px-4.5 pt-4 pb-5 text-site-body text-pretty text-site-muted">
        <span className="text-site-body-medium text-site-ink">{title}</span> {body}
      </p>
    </article>
  );
}

/**
 * A product window, scaled from a 1280px-wide preview. Fitted to a phone that screen would
 * shrink to a quarter, so below `sm` it keeps a readable 720px and bleeds off the end edge.
 */
export function ScreenWindow({ children }: { children: ReactNode }) {
  return (
    <div className="-me-6 overflow-x-clip sm:me-0 sm:overflow-x-visible">
      <div className="w-[720px] rounded-2xl bg-site-surface p-1.5 shadow-site-raised ring-1 ring-site-hairline sm:w-auto">
        <div className="relative aspect-[1280/855] overflow-hidden rounded-[10px] bg-site-preview ring-1 ring-site-hairline">
          <ScreenFrame>{children}</ScreenFrame>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLocaleLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        router.push("/components?search");
      }
    };
    const onScroll = () => setScrolled(window.scrollY > 4);
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
        "sticky top-0 z-40 border-b bg-site-page/80 backdrop-blur-md transition-colors duration-200",
        scrolled ? "border-site-hairline" : "border-transparent",
      )}
    >
      <div className={cx(CONTAINER, "flex h-14 items-center justify-between gap-6")}>
        <div className="flex items-center gap-10">
          <Link href="/" className={cx("flex items-center gap-2 rounded-md", FOCUS)}>
            <Logo size={18} />
            <span className="text-site-body-medium text-site-ink">Panelo UI</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className={cx(TEXT_LINK, "text-site-body")}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <GitHubStars className="hidden lg:inline-flex" />
          {/* A short reveal: the page behind it is heavy (live wall, iframes), and the browser freezes it
              for the whole transition, so the default 820ms read as stuck. */}
          <ThemeToggle appearance="segmented" size="small" transitionDuration={280} className="hidden sm:inline-flex" />
          <AuthButton className="hidden sm:inline-flex" />
          <Link href="/components" className={pill("primary")}>
            Browse components
          </Link>
        </div>
      </div>
    </header>
  );
}

const FLOWS = [
  { name: "Email Support Router", meta: "Webhook · 12,847 runs" },
  { name: "Lead Scoring Pipeline", meta: "Schedule · 12,569 runs" },
  { name: "Twitter Brand Monitor", meta: "Schedule · 10,560 runs" },
];
const ALL_ON = Object.fromEntries(FLOWS.map((f) => [f.name, true]));
const TARGET = FLOWS[2].name;
const WORKFLOWS_ID = "landing-workflows";

type Step = { text: string; call: string; state: "run" | "ok" | "no" };
type Ask = { text: string; answer: (ok: boolean) => void };

function StepMark({ state }: { state: Step["state"] | "wait" }) {
  if (state === "run") return <RiLoader4Line className="size-4 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden />;
  if (state === "wait") return <span aria-hidden className="size-4 shrink-0 rounded-full border-[1.5px] border-dashed border-muted-foreground" />;
  return (
    <span
      aria-hidden
      className={cx(
        "grid size-4 shrink-0 place-items-center rounded-full",
        state === "ok" ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
      )}
    >
      {state === "ok" ? <RiCheckLine className="size-3" /> : <RiCloseLine className="size-3" />}
    </span>
  );
}

/**
 * The hero: a workflows card and its assistant, at full size. When it scrolls into view a
 * scripted agent works through the real bridge: it reads the card with `snapshot()`, pauses a
 * workflow with `act()`, then asks to delete it and waits for the person's answer.
 */
function AgentRun() {
  const stage = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState<Record<string, boolean>>(ALL_ON);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    askPerson = (text, signal) =>
      new Promise<boolean>((resolve) => {
        const answer = (ok: boolean) => {
          setAsk(null);
          resolve(ok);
        };
        signal.addEventListener("abort", () => answer(false));
        setAsk({ text, answer });
      });
    return () => {
      askPerson = null;
    };
  }, []);

  const remove = (name: string) => {
    setLeaving(name);
    window.setTimeout(() => setGone((g) => [...g, name]), 300);
  };

  const run = useCallback(async () => {
    if (!agent || !list.current) return;
    setBusy(true);
    setSteps([]);
    setOn(ALL_ON);
    setGone([]);
    setLeaving(null);
    await sleep(700);
    const box = list.current;
    if (!box) return;
    const push = (step: Step) => setSteps((s) => [...s, step]);
    const settle = (step: Partial<Step>) => setSteps((s) => s.map((x, i) => (i === s.length - 1 ? { ...x, ...step } : x)));

    const parts = agent.snapshot().filter((c) => inside(box, c.ref));
    push({
      text: `Read ${parts.length} controls`,
      call: "snapshot()",
      state: "ok",
    });
    await sleep(900);

    const toggle = parts.find((c) => c.component === "switch" && c.label === TARGET);
    push({
      text: `Pausing ${TARGET}`,
      call: "setChecked(false)",
      state: "run",
    });
    await sleep(700);
    if (toggle)
      await agent.act({
        steps: [{ ref: toggle.ref, action: "setChecked", args: [false] }],
      });
    settle({ text: `Paused ${TARGET}`, state: "ok" });
    await sleep(900);

    const del = parts.find((c) => c.component === "button" && c.label === `Delete ${TARGET}`);
    push({ text: `Delete ${TARGET}`, call: "press()", state: "run" });
    const result = del ? await agent.act({ steps: [{ ref: del.ref, action: "press" }] }) : null;
    settle(result?.ok ? { text: `Deleted ${TARGET}`, state: "ok" } : { text: `Kept ${TARGET}`, call: "declined", state: "no" });
    setBusy(false);
  }, []);

  // Plays once, when most of it is on screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        void run();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [run]);

  const active = FLOWS.filter((f) => !gone.includes(f.name) && on[f.name]).length;
  const status = ask ? "Needs you" : busy ? "Working" : steps.length ? "Done" : "Ready";

  return (
    <div ref={stage} className="flex w-full flex-col gap-4">
      <Panel className="p-0 shadow-site-raised">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-medium">Workflows</p>
          <p className="text-xs text-muted-foreground tabular-nums">{active} active</p>
        </div>
        <div ref={list} id={WORKFLOWS_ID}>
          {FLOWS.filter((f) => !gone.includes(f.name)).map((f) => (
            <div
              key={f.name}
              className={cx(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                leaving === f.name ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className={cx("flex items-center gap-3 border-t py-3 ps-4 pe-2.5 transition-colors duration-300", busy && f.name === TARGET && "bg-muted/60")}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{f.name}</p>
                    <p className="truncate text-xs text-muted-foreground tabular-nums">{on[f.name] ? f.meta : "Paused"}</p>
                  </div>
                  <Switch checked={on[f.name]} onCheckedChange={(next: boolean) => setOn((o) => ({ ...o, [f.name]: next }))} aria-label={f.name} />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground"
                    aria-label={`Delete ${f.name}`}
                    data-agent-confirm={`Delete the ${f.name} workflow`}
                    onClick={() => remove(f.name)}
                  >
                    <RiDeleteBinLine />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="flex min-h-[348px] flex-col p-0 shadow-site-raised">
        <div className="flex h-11 items-center gap-2 border-b ps-4 pe-2">
          <RiSparkling2Line className="size-4" aria-hidden />
          <p className="text-sm font-medium">Assistant</p>
          {busy || !steps.length ? (
            <p className="ms-auto pe-2 text-xs text-muted-foreground">{status}</p>
          ) : (
            <Button size="sm" variant="ghost" className="ms-auto h-7 px-2 text-xs text-muted-foreground" onClick={() => void run()}>
              Replay
            </Button>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <p className="max-w-[85%] self-end rounded-2xl rounded-ee-md bg-muted px-3 py-2 text-sm text-pretty">Pause the {TARGET}, then delete it.</p>
          <ol aria-live="polite" className="flex flex-col gap-2.5">
            {steps.map((s, i) => (
              <li key={i} className={cx("flex items-start gap-2.5 text-sm", ENTER)}>
                <span className="flex h-5 items-center">
                  <StepMark state={s.state === "run" && ask && i === steps.length - 1 ? "wait" : s.state} />
                </span>
                {/* The call sits beside its step, or drops under it when the card is narrow. */}
                <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                  <span>{s.text}</span>
                  <code className="font-mono text-xs text-muted-foreground">{s.call}</code>
                </span>
              </li>
            ))}
          </ol>
          {ask && (
            <div className={cx("rounded-lg border p-3", ENTER)}>
              <p className="text-sm font-medium">{ask.text}?</p>
              <p className="mt-0.5 text-xs text-muted-foreground">The agent waits for you. This can&apos;t be undone.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => ask.answer(true)}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => ask.answer(false)}>
                  Decline
                </Button>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

/**
 * A column of live components drifting on a loop: the set twice, the track shifted by half,
 * so the seam never shows. Hover pauses it; reduced motion holds it still. The second set is
 * inert, so keyboards and screen readers meet each component once.
 */
function Drift({ seconds, reverse, className, children }: { seconds: number; reverse?: boolean; className?: string; children: ReactNode }) {
  return (
    <div
      className={cx("h-full w-[340px] shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]", className)}
    >
      <div
        style={{
          animationDuration: `${seconds}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
        className="flex animate-[site-drift_60s_linear_infinite] flex-col hover:[animation-play-state:paused] motion-reduce:animate-none"
      >
        <div className="flex flex-col gap-4 pb-4">{children}</div>
        <div aria-hidden inert className="flex flex-col gap-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

const PROGRESS: [string, number | null][] = [
  ["Reading the dashboard", 100],
  ["Filtering active workflows", 60],
  ["Waiting for your approval", null],
];

/**
 * The hero's wall: real components at full size, edge to edge, drifting in alternate
 * directions around the one card that stays put, the live agent run.
 */
function Showcase() {
  return (
    <div className="relative mt-14 sm:mt-16 lg:h-[720px] lg:overflow-hidden lg:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="px-6 lg:absolute lg:inset-y-0 lg:left-1/2 lg:flex lg:-translate-x-1/2 lg:gap-5 lg:px-0">
        <Drift seconds={70} className="hidden xl:block">
          <Panel className="shadow-site-raised">
            <ContributionChart />
          </Panel>
          <ApprovalCard />
          <Panel className="shadow-site-raised">
            <ActivityHeatmap />
          </Panel>
        </Drift>
        <Drift seconds={58} reverse className="hidden lg:block">
          <Bare>
            <TrendsChart className="shadow-site-raised" />
          </Bare>
          <PermissionsCard />
          <Bare>
            <BalanceChart compact className="rounded-xl shadow-site-raised" />
          </Bare>
        </Drift>
        <div className="mx-auto flex max-w-[420px] items-center lg:w-[420px] lg:max-w-none">
          <AgentRun />
        </div>
        <Drift seconds={64} className="hidden lg:block">
          <Panel className="shadow-site-raised">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="mb-3 text-2xl font-semibold tracking-tight">$21,572.99</p>
            <RevenueChart />
          </Panel>
          {ProStatCard && (
            <Bare>
              <Suspense>
                <ProStatCard />
              </Suspense>
            </Bare>
          )}
          <Panel className="flex flex-col gap-3.5 shadow-site-raised">
            {PROGRESS.map(([label, value]) => (
              <Progress key={label} value={value} className="flex flex-col gap-1.5">
                <ProgressLabel className="text-sm text-muted-foreground">{label}</ProgressLabel>
              </Progress>
            ))}
          </Panel>
        </Drift>
        <Drift seconds={76} reverse className="hidden xl:block">
          {ProSidebar && (
            <Panel className="h-[560px] p-0 shadow-site-raised">
              <Suspense>
                <ProSidebar />
              </Suspense>
            </Panel>
          )}
          <Bare>
            <SalesTrendPanel />
          </Bare>
        </Drift>
      </div>
    </div>
  );
}

/** shadcn/ui's mark: two parallel strokes, in the current text colour. */
function ShadcnMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" aria-hidden className={className}>
      <path d="M208 128 128 208M192 40 40 192" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" />
    </svg>
  );
}

function Hero() {
  return (
    <section className="pt-16 sm:pt-24">
      <div className={cx(CONTAINER, "flex flex-col items-center text-center")}>
        <ArrowLink href={AGENT_DEMO}>New: watch an AI agent run a live dashboard</ArrowLink>
        <h1 className="mt-6 max-w-[920px] text-site-display-sm text-balance sm:text-site-display lg:text-[4.75rem] lg:leading-[1.02] lg:tracking-[-0.045em]">
          <span className="text-site-ink">Dashboards AI agents can operate.</span> <span className="text-site-muted">Your users click. Agents act.</span>
        </h1>
        <p className="mt-6 max-w-[720px] text-site-lead text-pretty text-site-muted">
          React components, charts and full pages on{" "}
          <span className="whitespace-nowrap text-site-ink">
            <RiVercelFill aria-hidden className="me-1 inline size-[0.85em] align-[-0.05em]" />
            Vercel&apos;s UI SDK
          </span>{" "}
          and{" "}
          <span className="whitespace-nowrap text-site-ink">
            <ShadcnMark className="me-1 inline size-[0.9em] align-[-0.1em]" />
            shadcn/ui
          </span>
          .
        </p>
        <div className="mt-9 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          <Link href="/components" className={pill("primary", "lg")}>
            Browse components
          </Link>
          <Link href={AGENT_DEMO} className={pill("secondary", "lg")}>
            Try the agent demo
          </Link>
        </div>
        <p className="mt-6 text-site-body text-site-faint">
          Built by{" "}
          <a href="https://raycanvas.ai" className={cx(TEXT_LINK, "inline-flex items-center gap-1 align-bottom text-site-ink")}>
            {/* The mark as a mask, so it takes the link's colour in both themes. */}
            <span
              aria-hidden
              className="inline-block size-3.5 bg-current"
              style={{ maskImage: "url(/brand/raycanvas-mark.svg)", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }}
            />
            Raycanvas
          </a>{" "}
          · in partnership with <span className="text-site-ink">shadcn labs</span>
        </p>
      </div>
      <Showcase />
      <p className={cx(CONTAINER, "mt-6 text-center text-site-body text-site-faint")}>
        The centre card is live: a scripted agent works it through the real UI SDK bridge.
      </p>
    </section>
  );
}

const json = (value: unknown) => (typeof value === "string" ? JSON.stringify(value) : String(value));

/**
 * `key: value` plus its trailing punctuation, keys quieter than values. One inline block,
 * so a narrow pane wraps between fields, never inside a key.
 */
function Field({ name, value, end = "," }: { name: string; value: unknown; end?: string }) {
  return (
    <>
      <span className="inline-block max-w-full indent-0">
        <span className="text-site-muted">{name}</span>
        <span className="text-site-faint">: </span>
        <span className="text-site-ink">{json(value)}</span>
        <span className="text-site-faint">{end}</span>
      </span>{" "}
    </>
  );
}

/** The hero card's switches as the agent reads them, re-read whenever that card changes. */
function SnapshotExcerpt() {
  const [rows, setRows] = useState<AgentComponent[]>([]);

  useEffect(() => {
    const box = document.getElementById(WORKFLOWS_ID);
    if (!agent || !box) return;
    const read = () => setRows(agent.snapshot().filter((c) => c.component === "switch" && inside(box, c.ref)));
    read();
    const watch = new MutationObserver(() => requestAnimationFrame(read));
    watch.observe(box, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-checked"],
    });
    return () => watch.disconnect();
  }, []);

  // Indents are in `ch`, the mono advance, so wrapped lines hang exactly under their key.
  return (
    <div className="w-full font-mono text-body-2-regular leading-6 text-site-faint">
      <p className="text-site-ink">agent.snapshot()</p>
      <p>[</p>
      {rows.map((c) => (
        <div key={c.ref} className="ps-[2ch]">
          <p className="ps-[2ch] -indent-[2ch]">
            {"{ "}
            <Field name="ref" value={c.ref} />
            <Field name="component" value={c.component} />
          </p>
          <p className="ps-[2ch]">
            <Field name="label" value={c.label} />
            <Field name="checked" value={c.checked} end=" }," />
          </p>
        </div>
      ))}
      <p className="ps-[2ch]">…</p>
      <p>]</p>
    </div>
  );
}

/** What the assistant shows before a destructive step: it acts only after Approve. */
function ApprovalCard() {
  return (
    <Panel className="flex w-full max-w-[340px] flex-col gap-3 shadow-site-raised">
      <span className="flex items-center gap-2 text-sm font-medium">
        <RiSparkling2Line className="size-4 text-muted-foreground" aria-hidden />
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
    <Panel className="flex w-full max-w-[340px] flex-col gap-3.5 shadow-site-raised">
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

const AGENT_KIT = "npx shadcn@latest add @panelo/agent-kit";
const KIT_PARTS = ["agent bridge, on UI SDK", "approval prompts", "chat hook", "/api/agent route, on Groq's free tier"];

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-h-10 w-full items-center gap-3 rounded-xl bg-site-surface py-1.5 ps-4 pe-1.5 shadow-site-raised ring-1 ring-site-hairline">
      <code className="min-w-0 flex-1 font-mono text-body-2-regular text-site-ink">
        <span className="text-site-faint select-none">$ </span>
        {command}
      </code>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy the install command"}
        onClick={async () => {
          await navigator.clipboard.writeText(command);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className={cx(
          "grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-site-muted transition-colors hover:bg-site-pill hover:text-site-ink",
          FOCUS,
        )}
      >
        {copied ? <RiCheckLine className="size-3.5" aria-hidden /> : <RiFileCopyLine className="size-3.5" aria-hidden />}
      </button>
    </div>
  );
}

function AgentSection() {
  return (
    <section className={cx(CONTAINER, SECTION)}>
      <Heading title="Built for agents, not just for clicks." body="The assistant reads the page and acts through the same parts you click." />
      <div className="mt-14 grid gap-4 lg:grid-cols-12">
        <Feature
          title="Reads the page, not pixels."
          body={
            <>
              <Code>snapshot()</Code> lists every control with its label, state and actions. This one follows the card above.
            </>
          }
          stage="items-start justify-start"
          className="lg:col-span-7"
        >
          <SnapshotExcerpt />
        </Feature>
        <Feature
          title="Asks before anything destructive."
          body={
            <>
              Steps on parts marked <Code>data-agent-confirm</Code> wait for a person.
            </>
          }
          className="lg:col-span-5"
        >
          <ApprovalCard />
        </Feature>
        <Feature
          title="Same parts, same callbacks."
          body={
            <>
              A switch an agent flips fires your <Code>onCheckedChange</Code>, with source <Code>&quot;agent&quot;</Code>.
            </>
          }
          className="lg:col-span-5"
        >
          <PermissionsCard />
        </Feature>
        <Feature title="One line adds the assistant." body="It lands in your project as source, like every other component." className="lg:col-span-7">
          <div className="w-full max-w-[440px]">
            <CopyCommand command={AGENT_KIT} />
            <ul className="mt-5 flex flex-col gap-1.5 ps-4 font-mono text-body-2-regular text-site-muted">
              {KIT_PARTS.map((part) => (
                <li key={part}>
                  <span className="text-site-faint select-none">+ </span>
                  {part}
                </li>
              ))}
            </ul>
          </div>
        </Feature>
      </div>
    </section>
  );
}

const INSTALL_ITEMS = ["dashboard-pages-11", "agent-kit", "sidebars-1", "calendars-2", "revenue-chart", "login-pages-1"];

/** The registry command, its item name cycling through real registry items. */
function InstallLine() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % INSTALL_ITEMS.length), 2200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <code className="font-mono text-body-2-regular text-site-muted">
      <span className="text-site-faint select-none">$ </span>npx shadcn@latest add{" "}
      <span className="text-site-ink">{installCommand(`/components/${INSTALL_ITEMS[i]}`).replace("npx shadcn@latest add ", "")}</span>
    </code>
  );
}

function ComponentsSection() {
  const revenue = byHref("/components/revenue-chart");
  const balance = byHref("/components/balance-chart");
  const name = (entry: typeof revenue) => (
    <Link href={entry.href} className={cx(FOCUS, "rounded-sm underline-offset-4 hover:underline")}>
      {entry.name}.
    </Link>
  );
  return (
    <section className={cx(CONTAINER, SECTION)}>
      <Heading title="Components first, whole dashboards too." body="Charts, blocks and pages, installed as source with the shadcn CLI." />
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <InstallLine />
        <ArrowLink href="/components">All {ALL_ENTRIES.length} components</ArrowLink>
      </div>
      <div className="mt-14 grid gap-4 lg:grid-cols-12">
        <Feature title={name(revenue)} body={revenue.description} stage="min-h-[360px]" className="lg:col-span-7">
          <Panel className="w-full shadow-site-raised">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="mb-3 text-2xl font-semibold tracking-tight">$21,572.99</p>
            <RevenueChart />
          </Panel>
        </Feature>
        <Feature title={name(balance)} body={balance.description} stage="min-h-[360px]" className="lg:col-span-5">
          <Bare className="w-full">
            <BalanceChart compact className="rounded-xl shadow-site-raised" />
          </Bare>
        </Feature>
      </div>
    </section>
  );
}

const TEMPLATE_TABS = [
  { value: "dashboard-pages-10", label: "Workflow builder" },
  { value: "dashboard-pages-8", label: "Finance" },
  { value: "dashboard-pages-12", label: "Marketing" },
  { value: "dashboard-pages-7", label: "Team inbox" },
  { value: "dashboard-pages-9", label: "Task board" },
];

/** Whole templates in one window, switched from a segmented control whose thumb slides. */
function TemplatesSection() {
  const [tab, setTab] = useState(TEMPLATE_TABS[0].value);
  return (
    <section id="pages" className={cx(CONTAINER, SECTION, "scroll-mt-14")}>
      <Heading title="Complete pages, not just parts." body={`${sectionOf("dashboard-pages").length} dashboard pages in Pro, from $129 once.`} />
      <Tabs value={tab} onValueChange={(next: string | null) => next !== null && setTab(next)} className="mt-10">
        <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList aria-label="Templates" className="relative flex w-max rounded-full bg-site-pill p-1">
            <TabsIndicator className="absolute top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-full bg-site-surface shadow-site-raised transition-[left,width] duration-300 ease-out motion-reduce:transition-none" />
            {TEMPLATE_TABS.map((item) => (
              <TabsTab
                key={item.value}
                value={item.value}
                className={cx(
                  "relative h-8 shrink-0 cursor-pointer rounded-full px-3.5 text-site-body-medium text-site-muted transition-colors duration-150 hover:text-site-ink data-selected:text-site-ink",
                  FOCUS,
                )}
              >
                {item.label}
              </TabsTab>
            ))}
          </TabsList>
        </div>
        {TEMPLATE_TABS.map((item) => (
          <TabsPanel key={item.value} value={item.value} className="mt-6 outline-none">
            {tab === item.value && (
              <ScreenWindow>
                <iframe src={`/preview/${item.value}`} title={`${item.label} template`} loading="lazy" className="size-full border-0" />
              </ScreenWindow>
            )}
          </TabsPanel>
        ))}
      </Tabs>
      <ArrowLink href="/templates" className="mt-8">
        Whole-app templates arrive December 1: three of them, one free
      </ArrowLink>
    </section>
  );
}

/**
 * Plans as cards on one grid. Every card stacks the same rows in the same order (name, line,
 * price, button, list), so names, prices and buttons line up across the row. The featured card
 * is lifted with a surface, ring and shadow, not colour.
 */
function PricingSection() {
  return (
    <section id="pricing" className={cx(CONTAINER, SECTION, "scroll-mt-14")}>
      <Heading title="Pay once, own the code." body={`No subscription, and $${LAUNCH_OFF} off every Pro plan while the launch lasts.`} />
      <ul className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <li
            key={plan.name}
            className={cx(
              "relative flex flex-col rounded-2xl p-6",
              plan.featured ? "bg-site-surface shadow-site-raised ring-1 ring-site-ring" : "bg-site-preview ring-1 ring-site-hairline ring-inset",
            )}
          >
            {/* Sits on the card's top edge, so it never shares a line with the plan name. */}
            {plan.featured && (
              <span className="absolute -top-[11px] left-1/2 inline-flex h-[22px] -translate-x-1/2 items-center rounded-full bg-site-ink px-2.5 text-site-chip whitespace-nowrap text-site-page">
                Most popular
              </span>
            )}
            <h3 className="text-site-plan text-site-ink">{plan.name}</h3>
            {/* Three lines reserved, so a shorter blurb doesn't lift this card's price above its neighbours'. */}
            <p className="mt-2 min-h-[4.125rem] text-site-body text-pretty text-site-muted">{plan.blurb}</p>
            <p className="mt-5 flex items-baseline gap-2 tabular-nums">
              {plan.price !== null && (
                <span className="text-site-plan text-site-faint line-through">
                  <span className="sr-only">Was </span>${plan.price + LAUNCH_OFF}
                </span>
              )}
              <span className="text-site-price text-site-ink">{plan.price === null ? "Free" : `$${plan.price}`}</span>
            </p>
            <p className="mt-1 text-site-body text-site-muted">{plan.price === null ? "No card required" : "Paid once, all in Pro"}</p>
            {/* Buying is a POST, so crawlers and link prefetching never open checkout sessions. */}
            {plan.plan ? (
              <form method="post" action="/checkout" className="mt-6">
                <input type="hidden" name="plan" value={plan.plan} />
                <button type="submit" className={pill(plan.featured ? "primary" : "secondary", "lg", "w-full")}>
                  {plan.cta}
                </button>
              </form>
            ) : (
              <Link href="/components" className={pill("secondary", "lg", "mt-6 w-full")}>
                {plan.cta}
              </Link>
            )}
            {/* The code is already on the checkout when it opens; this says so before the click. */}
            <p className="mt-3 flex h-5 items-center justify-center gap-1.5 text-site-chip text-site-muted">
              {plan.price !== null && (
                <>
                  <RiCheckLine className="size-3.5 text-site-faint" aria-hidden />${LAUNCH_OFF} off, applied at checkout
                </>
              )}
            </p>
            <ul className="mt-5 flex flex-col gap-2.5 border-t border-site-hairline pt-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-site-body text-site-ink">
                  <RiCheckLine className="mt-0.5 size-4 shrink-0 text-site-faint" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center text-site-body text-pretty text-site-muted">
        One-time payment through Dodo Payments, our merchant of record.{" "}
        <Link href="/legal/licence" className={cx(TEXT_LINK, "underline underline-offset-4")}>
          Licence
        </Link>{" "}
        ·{" "}
        <Link href="/legal/refunds" className={cx(TEXT_LINK, "underline underline-offset-4")}>
          Refunds
        </Link>
      </p>
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
    a: "Not for the components: they are plain React and work without any model. Only the in-app assistant (agent-kit) calls a model: an open model on Groq, with a free key from console.groq.com set as GROQ_API_KEY on your server.",
  },
  {
    q: "How do I install a component?",
    a: 'Add "@panelo": "https://www.paneloui.com/r/{name}.json" under registries in components.json, then run npx shadcn@latest add @panelo/<item>. Pro items install the same way from @panelo-pro with your licence key; your account page has the exact lines. The source lands in your project.',
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
    a: "December 1: three whole-app templates, one free and two in Pro. Every Pro plan includes the Pro ones, plans bought before launch too.",
  },
  {
    q: "Can I get a refund?",
    a: "Sales are final, since the source is yours the moment you install it: try the free components and live demos first. A duplicate charge, or a purchase we can't deliver, is refunded in full. See the refund policy.",
  },
  {
    q: "Does it support dark mode?",
    a: "Every component, block and template ships light and dark, driven by the same tokens.",
  },
];

function FaqSection() {
  return (
    <section className={cx(CONTAINER, SECTION, "grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,640px)] lg:gap-16")}>
      <Heading title="Questions." body="From install to dark mode." className="self-start lg:sticky lg:top-28" />
      <div className="border-t border-site-hairline">
        {FAQ.map((item) => (
          <details key={item.q} className="group border-b border-site-hairline">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-site-question text-site-ink outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring [&::-webkit-details-marker]:hidden">
              {item.q}
              <RiAddLine
                className="size-4 shrink-0 text-site-faint transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                aria-hidden
              />
            </summary>
            <p className="-mt-1 max-w-[580px] pb-6 text-site-text text-pretty text-site-muted">{item.a}</p>
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
      { label: "Templates", href: "/templates" },
      { label: "Agent demo", href: AGENT_DEMO },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Licence", href: "/legal/licence" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Refunds", href: "/legal/refunds" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-site-hairline">
      <div className={cx(CONTAINER, "flex flex-col gap-12 pt-16 pb-10 md:flex-row md:justify-between")}>
        <div className="flex flex-col gap-3">
          <Link href="/" className={cx("flex w-fit items-center gap-2 rounded-md", FOCUS)}>
            <Logo size={16} />
            <span className="text-site-body-medium text-site-ink">Panelo UI</span>
          </Link>
          <p className="max-w-[260px] text-site-body text-site-muted">Agent-ready React dashboards, built on Vercel&apos;s UI SDK.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-16 gap-y-10 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-2.5">
              <span className="text-site-body-medium text-site-ink">{column.title}</span>
              {column.links.map((link) => (
                <Link key={link.label} href={link.href} className={cx(TEXT_LINK, "w-fit text-site-body")}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className={cx(CONTAINER, "flex flex-wrap justify-between gap-x-6 gap-y-2 pb-12 text-site-body text-site-faint")}>
        <p>
          © 2026 Panelo UI · Built by{" "}
          <a href="https://raycanvas.ai" className={TEXT_LINK}>
            Raycanvas
          </a>{" "}
          in partnership with shadcn labs
        </p>
        <p>React 19 · Next.js 16 · Tailwind CSS v4 · Vercel UI SDK</p>
      </div>
    </footer>
  );
}

/** panelo.com's home: the marketing page, every section built from the library's own live components. */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-site-page font-sans text-site-ink">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <AgentSection />
        <ComponentsSection />
        <TemplatesSection />
        <PricingSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </div>
  );
}
