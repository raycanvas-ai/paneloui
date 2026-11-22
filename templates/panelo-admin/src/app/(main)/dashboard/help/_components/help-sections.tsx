import Link from "next/link";

import { cn } from "cn";
import { ArrowUpRight, ChevronRight, Clock, Mail, MessageCircle, Search, Signal } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { categories, faqs, popularArticles } from "./help-data";

const searchHref = (term: string) => `/dashboard/search?q=${encodeURIComponent(term)}`;

export function HelpHero() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-xl bg-muted/50 px-4 py-10 text-center sm:py-14">
      <div className="flex max-w-xl flex-col gap-2">
        <h1 className="font-medium text-2xl leading-tight tracking-tight sm:text-3xl sm:leading-none">
          How can we help?
        </h1>
        <p className="text-muted-foreground text-sm">
          Guides, answers and people to talk to when you get stuck with Panelo.
        </p>
      </div>

      <search className="w-full max-w-xl">
        <form action="/dashboard/search">
          <InputGroup className="h-11 rounded-xl bg-card">
            <InputGroupAddon className="pl-3">
              <Search className="size-5" />
            </InputGroupAddon>
            <InputGroupInput
              name="q"
              type="search"
              aria-label="Search help articles"
              placeholder="Search for articles, e.g. API keys"
              className="text-base md:text-base"
            />
          </InputGroup>
        </form>
      </search>

      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
        <span>Popular:</span>
        {["SSO", "Invoices", "Webhooks", "Export data"].map((term) => (
          <Link
            key={term}
            prefetch={false}
            href={searchHref(term)}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {term}
          </Link>
        ))}
      </p>
    </section>
  );
}

export function HelpCategories() {
  return (
    <section aria-labelledby="help-categories" className="flex flex-col gap-3">
      <h2 id="help-categories" className="font-medium text-base">
        Browse by topic
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map(({ title, description, articles, icon: Icon }) => (
          <li key={title} className="flex">
            <Link
              prefetch={false}
              href={searchHref(title)}
              className="flex w-full flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 outline-none transition-[scale,background-color] duration-150 ease-out hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]"
            >
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4.5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{title}</span>
                <span className="text-muted-foreground text-sm">{description}</span>
              </div>
              <span className="mt-auto text-muted-foreground text-xs tabular-nums">{articles} articles</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PopularArticles() {
  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="border-b">
        <CardTitle>Popular articles</CardTitle>
        <CardDescription>Most read by teams this month</CardDescription>
      </CardHeader>
      <ol className="divide-y divide-border">
        {popularArticles.map((article, index) => (
          <li key={article.title}>
            <Link
              prefetch={false}
              href={searchHref(article.title)}
              className="group/article flex items-center gap-3 px-4 py-3 outline-none transition-[background-color] duration-150 ease-out hover:bg-muted/40 focus-visible:bg-muted/40"
            >
              <span className="w-5 text-muted-foreground text-sm tabular-nums">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{article.title}</p>
                <p className="text-muted-foreground text-xs tabular-nums">
                  {article.category} · {article.minutes} min read
                </p>
              </div>
              <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function HelpFaq() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently asked questions</CardTitle>
        <CardDescription>Quick answers about plans, data and your team</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="faq-0">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

const contactOptions = [
  {
    id: "chat",
    title: "Live chat",
    description: "Talk to a support engineer in the app.",
    icon: MessageCircle,
    status: { label: "Online now", dot: "bg-success-solid" },
    meta: "Typical reply in 4 min",
    action: "Start a chat",
    href: "/dashboard/chat",
  },
  {
    id: "email",
    title: "Email support",
    description: "Send details, logs or screenshots.",
    icon: Mail,
    status: { label: "support@panelo.dev", dot: "" },
    meta: "Replies within 24 hours",
    action: "Write to us",
    href: "mailto:support@panelo.dev",
  },
  {
    id: "status",
    title: "System status",
    description: "Live uptime for the app, API and webhooks.",
    icon: Signal,
    status: { label: "All systems operational", dot: "bg-success-solid" },
    meta: "99.98% uptime over 90 days",
    action: "View live status",
    href: "/dashboard/activity",
  },
];

export function ContactSupport() {
  return (
    <section aria-labelledby="help-contact" className="flex flex-col gap-3">
      <h2 id="help-contact" className="font-medium text-base">
        Still need help?
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {contactOptions.map(({ id, title, description, icon: Icon, status, meta, action, href }) => (
          <Card key={id} id={id} className="scroll-mt-6">
            <CardHeader>
              <div className="mb-2 grid size-9 place-items-center rounded-lg bg-muted text-foreground">
                <Icon className="size-4.5" aria-hidden="true" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  {status.dot && <span className={cn("size-2 rounded-full", status.dot)} aria-hidden="true" />}
                  {status.label}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground tabular-nums">
                  <Clock className="size-3" aria-hidden="true" />
                  {meta}
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-fit" asChild>
                <Link prefetch={false} href={href}>
                  {action}
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
