"use client";

import { useEffect, useState } from "react";
import { RiGithubFill, RiStarFill } from "@remixicon/react";

import { pill } from "@/components/application/site/site-ui";
import { cx } from "@/utils/cx";

const REPO = "raycanvas-ai/paneloui";
const KEY = "panelo:stars";

const short = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n));

/** "GitHub ★ 1.2k" in the nav: the repo's live star count, cached for the session, linking to the repo. */
export function GitHubStars({ className }: { className?: string }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(KEY);
    if (cached) return setStars(Number(cached));
    const ctrl = new AbortController();
    fetch(`https://api.github.com/repos/${REPO}`, { signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { stargazers_count?: number } | null) => {
        if (typeof d?.stargazers_count !== "number") return;
        sessionStorage.setItem(KEY, String(d.stargazers_count));
        setStars(d.stargazers_count);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noreferrer"
      aria-label={stars === null ? "Star Panelo on GitHub" : `Star Panelo on GitHub, ${stars} stars`}
      className={cx(pill("secondary"), "gap-0 ps-2.5 pe-0", className)}
    >
      <RiGithubFill aria-hidden />
      <span className="ms-1.5">Star</span>
      <span className="ms-2 flex h-full items-center gap-1 border-s border-site-hairline ps-2 pe-2.5 tabular-nums text-site-muted">
        <RiStarFill aria-hidden className="!size-3 text-site-muted" />
        {stars === null ? "–" : short(stars)}
      </span>
    </a>
  );
}
