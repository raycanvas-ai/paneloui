"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiAddLine, RiArrowRightLine, RiCheckLine, RiCloseLine, RiDeleteBinLine, RiFileCopyLine, RiLoader4Line, RiMenuLine, RiSparkling2Line, RiVercelFill } from "@remixicon/react";
import { createAgent, type AgentComponent } from "@ui-sdk/react/agent";
import { elementOf } from "@ui-sdk/react/observe";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";

import { ALL_ENTRIES, COMPONENT_SECTIONS, installCommand } from "@/components/application/docs/components-index";
import { AGENT_DEMO } from "@/components/application/docs/docs-shell";
import { FAQ } from "@/components/application/site/faq";
import { LAUNCH_OFF, PLANS } from "@/components/application/site/pricing";
import { ScreenFrame } from "@/components/application/docs/preview-frames";
import { AuthButton } from "@/components/application/site/auth-button";
import { CONTAINER, FOCUS, SECTION, TEXT_LINK } from "@/components/application/site/layout-classes";
import { GitHubLink } from "@/components/application/site/github-link";
import { pill } from "@/components/application/site/site-ui";
import { ThemeToggle } from "@/components/application/theme/theme-toggle";
import { Logo } from "@/components/foundations/brand/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/panelo/ui/sheet";
import { ActivityHeatmap } from "@/components/panelo/blocks/charts/activity-heatmap";
import { BalanceChart } from "@/components/panelo/blocks/charts/balance-chart";
import { ContributionChart } from "@/components/panelo/blocks/charts/contribution-chart";
import { RevenueChart } from "@/components/panelo/blocks/charts/revenue-chart";
import { SalesTrendPanel } from "@/components/panelo/blocks/charts/sales-chart";
import { TrendsChart } from "@/components/panelo/blocks/charts/trends-chart";
import { Button } from "@/components/panelo/ui/button";
import { Progress, ProgressLabel } from "@/components/panelo/ui/progress";
import { Switch } from "@/components/panelo/ui/switch";
import { track } from "@/lib/analytics";
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

// The layout classes live in a plain module so server pages (blog, 404) can use them too; a "use client"
// module's exports reach server components as references, not strings.
export { CONTAINER, FOCUS, SECTION, TEXT_LINK };

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
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className={cx(CONTAINER, "flex h-14 items-center justify-between gap-2 sm:gap-6")}>
        <div className="flex items-center gap-10">
          <Link href="/" className={cx("flex items-center gap-2 rounded-md", FOCUS)}>
            <Logo size={18} />
            <span className="text-site-body-medium text-site-ink">Panelo UI</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className={cx(TEXT_LINK, "text-site-body")}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <GitHubLink className="hidden lg:inline-flex" />
          {/* A short reveal: the page behind it is heavy (live wall, iframes), and the browser freezes it
              for the whole transition, so the default 820ms read as stuck. */}
          <ThemeToggle appearance="segmented" size="small" transitionDuration={280} className="hidden sm:inline-flex" />
          <AuthButton className="hidden sm:inline-flex" />
          <Link href="/#pricing" className={pill("primary")}>
            Get Pro
          </Link>
          <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className={pill("ghost", "sm", "w-7 px-0 lg:hidden")}>
            <RiMenuLine aria-hidden />
          </button>
        </div>
      </div>
      {/* Below lg the links move into a drawer: it slides, traps focus, closes on Escape or a swipe. */}
      <Sheet side="right" open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent className="w-72 max-w-[85vw] gap-0 rounded-none border-0 bg-site-page p-0 lg:hidden" overlayClassName="lg:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-14 items-center justify-between px-5">
            <Link href="/" onClick={() => setMenuOpen(false)} className={cx("flex items-center gap-2 rounded-md", FOCUS)}>
              <Logo size={18} />
              <span className="text-site-body-medium text-site-ink">Panelo UI</span>
            </Link>
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className={pill("ghost", "sm", "w-7 px-0")}>
              <RiCloseLine aria-hidden />
            </button>
          </div>
          <nav aria-label="Menu" className="flex flex-col border-t border-site-hairline px-5 py-3">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className={cx(TEXT_LINK, "py-3 text-site-question text-site-ink")}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-2 border-t border-site-hairline px-5 py-4">
            <ThemeToggle appearance="segmented" size="small" transitionDuration={280} />
            <AuthButton />
            <GitHubLink className="ms-auto" />
          </div>
        </SheetContent>
      </Sheet>
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
    <div className="relative mt-14 hidden sm:mt-16 lg:block lg:h-[720px] lg:overflow-hidden lg:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
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

// Home Care Schedule as a picture, not a live page: three widths per theme, so a phone fetches the 720px file.
const SCHEDULE_SIZES = "(min-width: 1136px) 1088px, calc(100vw - 48px)";
const scheduleSrcSet = (theme: "light" | "dark") => [720, 1280, 2560].map((w) => `/brand/home-care-schedule-${theme}-${w}.webp ${w}w`).join(", ");

function ScheduleShot() {
  const img = "block h-auto w-full rounded-lg ring-1 ring-site-hairline sm:rounded-[10px]";
  return (
    <Link
      href="/components/dashboard-pages-13"
      aria-label="Home Care Schedule, a free Panelo UI dashboard page"
      className={cx("block rounded-xl bg-site-surface p-1 shadow-site-raised ring-1 ring-site-hairline sm:rounded-2xl sm:p-1.5", FOCUS)}
    >
      {/* Light is the default theme, so it loads first; the dark file is lazy and only fetched once it's shown. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebPs with their own srcset */}
      <img src="/brand/home-care-schedule-light-1280.webp" srcSet={scheduleSrcSet("light")} sizes={SCHEDULE_SIZES} width={1280} height={855} alt="" fetchPriority="high" className={cx(img, "dark:hidden")} />
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebPs with their own srcset */}
      <img src="/brand/home-care-schedule-dark-1280.webp" srcSet={scheduleSrcSet("dark")} sizes={SCHEDULE_SIZES} width={1280} height={855} alt="" loading="lazy" className={cx(img, "hidden dark:block")} />
    </Link>
  );
}

function Hero() {
  return (
    <section className="pt-16 sm:pt-24">
      <div className={cx(CONTAINER, "flex flex-col items-center text-center")}>
        <Link href="/#pricing" className={cx("group inline-flex items-center gap-2 rounded-full bg-site-pro py-0.5 ps-0.5 pe-3 text-site-body-medium text-site-pro-text shadow-site-pro transition-[filter] duration-150 hover:brightness-[0.97]", FOCUS)}>
          <span className="rounded-full bg-linear-to-b from-site-banner-from to-site-banner-to px-2 py-px text-site-chip text-site-on-banner">${LAUNCH_OFF} OFF</span>
          Early-bird launch deal
          <RiArrowRightLine className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
        </Link>
        <h1 className="mt-6 max-w-[920px] text-site-display-sm text-balance sm:text-site-display lg:text-[4.75rem] lg:leading-[1.02] lg:tracking-[-0.045em]">
          <span className="text-site-ink">Dashboards AI agents can operate.</span> <span className="text-site-muted">Your users click. Agents act.</span>
        </h1>
        <p className="mt-6 max-w-[720px] text-site-lead text-pretty text-site-muted">
          React components, charts and full pages on{" "}
          <span className="whitespace-nowrap text-site-ink">
            <RiVercelFill aria-hidden className="me-1 inline size-[0.85em] align-[-0.05em]" />
            Vercel&apos;s UI SDK
          </span>
          . One{" "}
          <span className="whitespace-nowrap text-site-ink">
            <ShadcnMark className="me-1 inline size-[0.9em] align-[-0.1em]" />
            shadcn
          </span>{" "}
          command into any project, Base UI or Radix.
        </p>
        <div className="mt-9 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          <Link href="/components" className={pill("primary", "lg")}>
            Browse components
          </Link>
          <Link href={AGENT_DEMO} className={pill("secondary", "lg")}>
            Watch an agent run it
          </Link>
        </div>
      </div>
      {/* A whole free page in front of the carousel, from its top edge: the cards drift behind it and past its sides. */}
      <div className="relative">
        <div className={cx(CONTAINER, "relative z-10 mt-12 max-w-[1088px] sm:mt-14 lg:absolute lg:inset-x-0 lg:top-0 lg:-mt-8")}>
          <ScheduleShot />
        </div>
        <Showcase />
      </div>
      <p className={cx(CONTAINER, "mt-6 hidden text-center text-site-body text-site-faint lg:block")}>
        In front: Home Care Schedule, a free dashboard page. Behind it: Panelo&apos;s components, drifting.
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
          track("install_command_copied", { command, surface: "landing" });
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
      <Heading title="Complete pages, not just parts." body={`${ALL_ENTRIES.filter((e) => e.href.startsWith("/components/dashboard-pages-")).length} dashboard pages in Pro, from $129 once.`} />
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
                {/* Autocapture adds the plan to the click, so pricing clicks split by plan before checkout opens. */}
                <button type="submit" data-ph-capture-attribute-plan={plan.plan} className={pill(plan.featured ? "primary" : "secondary", "lg", "w-full")}>
                  {plan.cta}
                </button>
              </form>
            ) : (
              <Link href="/components" className={pill("secondary", "lg", "mt-6 w-full")}>
                {plan.cta}
              </Link>
            )}
            {/* The launch discount is built into the Dodo price, so checkout opens at this price with its code box free. */}
            <p className="mt-3 flex h-5 items-center justify-center gap-1.5 text-site-chip text-site-muted">
              {plan.price !== null && (
                <>
                  <RiCheckLine className="size-3.5 text-site-faint" aria-hidden />${LAUNCH_OFF} launch discount included
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

type FooterLink = { label: string; href: string };
type FooterGroup = { title: string; href?: string; links: FooterLink[]; more?: FooterLink };

const shipped = (id: string): FooterLink[] =>
  sectionOf(id)
    .filter((e) => e.status === "shipped")
    .map((e) => ({ label: e.name, href: e.href }));

const group = (id: string, title: string): FooterGroup => ({ title, href: `/components#${id}`, links: shipped(id) });

// The guides linked from every page: the pillar posts and the comparisons buyers search for.
const FOOTER_GUIDES: FooterLink[] = [
  { label: "Vercel's UI SDK explained", href: "/blog/vercel-ui-sdk-explained" },
  { label: "What is agent-ready UI?", href: "/blog/what-is-agent-ready-ui" },
  { label: "shadcn heatmap chart", href: "/blog/shadcn-heatmap-chart" },
  { label: "GitHub contribution graph in React", href: "/blog/github-contribution-graph-react" },
  { label: "Tremor alternative", href: "/blog/tremor-alternative" },
  { label: "shadcnblocks alternative", href: "/blog/shadcnblocks-alternative" },
  { label: "Tailwind Plus alternative", href: "/blog/tailwind-plus-catalyst-alternative" },
  { label: "Design tokens in Tailwind CSS v4", href: "/blog/design-tokens-tailwind-v4" },
];

// Five columns, each a stack of groups, so short lists sit under each other instead of leaving holes.
// Every component and the key guides get one link each: a way in from any page, for people and crawlers.
const FOOTER_COLUMNS: FooterGroup[][] = [
  [group("analytics", "Analytics"), group("tables", "Tables"), { ...group("workflows", "Workflows"), more: { label: "All components", href: "/components" } }],
  [group("charts", "Charts"), group("projects", "Projects"), group("inbox", "Inbox")],
  [group("calendars", "Calendars"), group("login-pages", "Logins"), group("profile-pages", "Profiles"), group("sidebars", "Sidebars"), group("elements", "Elements")],
  [{ title: "Guides", href: "/blog", links: FOOTER_GUIDES, more: { label: "All guides", href: "/blog" } }],
  [
    {
      title: "Product",
      links: [
        { label: "Components", href: "/components" },
        { label: "Templates", href: "/templates" },
        { label: "Agent demo", href: AGENT_DEMO },
        { label: "Pricing", href: "/#pricing" },
        { label: "Blog", href: "/blog" },
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
    {
      title: "Our network",
      links: [
        { label: "Raycanvas", href: "https://raycanvas.ai" },
        { label: "Shadcn Labs", href: "https://x.com/shadcnlabs" },
        { label: "Ruixen UI", href: "https://ruixen.com" },
        { label: "snapcn", href: "https://snapcn.dev" },
      ],
    },
  ],
];

const FOOTER_HEADING = "w-fit text-site-body-medium text-site-ink";

// The CTA's art: the two hands from Michelangelo's Creation of Adam (public domain, Wikimedia Commons), as a halftone.
// /brand/hands-density.png is baked offline from the fresco: each pixel is how dense the dots should be there
// (skin from its warmth against the plaster, his contour strokes cut as gaps between fingers, shading for form,
// and a fade away from the fingertips so it never ends in a hard edge). Dots are drawn here, at a fixed pitch, so
// they stay crisp at any width and take the theme's blue.
// touchX/touchY: where the fingertips meet; reach: how far above them the top of Adam's hand sits (shares of the map).
// Above that only God's upper arm remains, already faded to scattered dots, so the card may crop it.
const HANDS = { src: "/brand/hands-density.png", width: 830, height: 225, touchX: 386 / 830, touchY: 117 / 225, reach: 99 / 225 };
const PITCH = 3;
const DOT = 2;
// 8×8 Bayer matrix: an ordered dither, the even printed-grid look of the reference.
const BAYER8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
let handsMap: Promise<ImageData> | null = null;
const loadHands = () =>
  (handsMap ??= new Promise<ImageData>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = HANDS.width;
      c.height = HANDS.height;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, HANDS.width, HANDS.height));
    };
    img.onerror = reject;
    img.src = HANDS.src;
  }));

/**
 * Draws the hands behind a card's copy, fingertips meeting just above the card's heading, sized so the whole
 * picture fits inside the card. The copy keeps itself readable with a halo in the card's colour (TEXT_HALO).
 * On first view the dots settle in from the fingertips outward; not with reduced motion.
 */
function HalftoneHands() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const card = canvas?.parentElement;
    if (!canvas || !card) return;
    let dots: { x: number; y: number; delay: number }[] = [];
    let frame = 0;
    let revealed = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start = 0;

    const paint = (now: number) => {
      const ctx = canvas.getContext("2d")!;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getComputedStyle(canvas).color;
      // Before the card is seen nothing shows; once the reveal has run, everything does.
      const t = revealed ? Infinity : start ? now - start : -1;
      for (const d of dots) if (t >= d.delay) ctx.fillRect(d.x, d.y, DOT, DOT);
      if (start && !revealed) {
        if (t < 1200) frame = requestAnimationFrame(paint);
        else revealed = true;
      }
    };

    const layout = async () => {
      const map = await loadHands();
      const { width: w, height: h } = card.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Fingertips meet on the centre line, just above the heading; the art is as large as the room above allows
      // with Adam's hand whole, and never much wider than the card (on phones the arms fade out past the edges).
      const heading = card.querySelector("h2")?.getBoundingClientRect();
      const tx = w / 2;
      const ty = heading ? heading.top - card.getBoundingClientRect().top - 10 : h / 3;
      const aspect = HANDS.width / HANDS.height;
      const artH = Math.min((ty - 8) / HANDS.reach, (w * 1.1) / aspect);
      const artW = artH * aspect;
      const artX = tx - HANDS.touchX * artW;
      const artY = ty - HANDS.touchY * artH;
      const far = Math.hypot(w, h) / 2;
      dots = [];
      for (let j = 0, y = 0; y < h; j++, y += PITCH) {
        for (let i = 0, x = 0; x < w; i++, x += PITCH) {
          const u = Math.floor(((x - artX) / artW) * HANDS.width);
          const v = Math.floor(((y - artY) / artH) * HANDS.height);
          if (u < 0 || v < 0 || u >= HANDS.width || v >= HANDS.height) continue;
          const density = map.data[(v * HANDS.width + u) * 4] / 255;
          if (density <= (BAYER8[(j % 8) * 8 + (i % 8)] + 0.5) / 64) continue;
          // Settle in from the fingertips: nearer dots first, with a little scatter.
          const delay = (Math.hypot(x - tx, y - ty) / far) * 900 + ((i * 73856093) ^ (j * 19349663)) % 250;
          dots.push({ x, y, delay });
        }
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };

    const ro = new ResizeObserver(() => void layout());
    ro.observe(card);
    // Reveal once, the first time the card comes into view.
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || revealed || start) return;
      start = performance.now();
      frame = requestAnimationFrame(paint);
      io.disconnect();
    }, { threshold: 0.35 });
    if (!revealed) io.observe(card);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full text-site-banner-via" />;
}

// A soft halo in the card's own colour (site-preview, the grey of the pricing cards) around every glyph: the dots behind thin out right at the letters only,
// so the copy reads cleanly while the hands stay whole around it.
const TEXT_HALO =
  "[text-shadow:0_0_4px_var(--color-site-preview),0_0_10px_var(--color-site-preview),0_0_18px_var(--color-site-preview),0_0_28px_var(--color-site-preview)]";

/** The last ask before the footer: start free, or take Pro while the early-bird price lasts. */
function CtaSection() {
  return (
    <section className={cx(CONTAINER, "pb-20 sm:pb-28")}>
      <div className="relative flex flex-col items-center overflow-hidden rounded-3xl bg-site-preview px-6 pt-24 pb-12 ring-1 ring-site-hairline ring-inset text-center sm:pt-28 sm:pb-14">
        <HalftoneHands />
        <h2 className={cx("relative max-w-[640px] text-site-heading text-balance sm:text-site-display-sm", TEXT_HALO)}>
          <span className="text-site-ink">Ship the dashboard.</span> <span className="text-site-muted">Let agents run it.</span>
        </h2>
        <p className={cx("relative mt-4 max-w-[520px] text-site-lead text-pretty text-site-muted", TEXT_HALO)}>
          Start with the free components, or get every Pro page from ${Math.min(...PLANS.flatMap((p) => (p.price === null ? [] : [p.price])))} once, ${LAUNCH_OFF} off while early bird lasts.
        </p>
        <div className="relative mt-8 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          <Link href="/#pricing" className={pill("primary", "lg")}>
            Get Pro
          </Link>
          <Link href="/components" className={pill("secondary", "lg")}>
            Browse components
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-site-hairline">
      <nav aria-label="Footer" className={cx(CONTAINER, "grid grid-cols-2 gap-x-8 gap-y-12 pt-16 pb-14 sm:grid-cols-3 lg:grid-cols-5")}>
        {FOOTER_COLUMNS.map((column, i) => (
          <div key={i} className="flex flex-col gap-12">
            {column.map((g) => (
              <div key={g.title} className="flex flex-col gap-3">
                {g.href ? (
                  <Link href={g.href} className={cx(FOCUS, "rounded-sm", FOOTER_HEADING)}>
                    {g.title}
                  </Link>
                ) : (
                  <span className={FOOTER_HEADING}>{g.title}</span>
                )}
                <ul className="flex flex-col gap-2.5">
                  {g.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={cx(TEXT_LINK, "text-site-body")}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {g.more && (
                  <ArrowLink href={g.more.href} className="w-fit text-site-ink">
                    {g.more.label}
                  </ArrowLink>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className={cx(CONTAINER, "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-site-hairline py-8 text-site-body text-site-faint")}>
        <Link href="/" className={cx("flex items-center gap-2 rounded-md", FOCUS)}>
          <Logo size={16} />
          <span className="text-site-body-medium text-site-ink">Panelo UI</span>
        </Link>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          © 2026
          <a href="https://raycanvas.ai" className={cx(TEXT_LINK, "inline-flex items-center gap-1")}>
            {/* The mark as a mask in ink, so it matches the Shadcn Labs logo in both themes. */}
            <span
              aria-hidden
              className="inline-block size-4 bg-site-ink"
              style={{ maskImage: "url(/brand/raycanvas-mark.svg)", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }}
            />
            Raycanvas AI
          </a>
          <span>· All rights reserved · Backed by</span>
          <a href="https://x.com/shadcnlabs" className={cx(TEXT_LINK, "inline-flex items-center gap-1")}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a 16px avatar, not worth next/image */}
            <img src="/brand/shadcn-labs.png" alt="" width={16} height={16} className="size-4 rounded" />
            Shadcn Labs
          </a>
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
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
