"use client";

import { RiAddLine, RiTwitterXLine, RiVerifiedBadgeFill } from "@remixicon/react";

import { CONTAINER, FOCUS, SECTION } from "@/components/application/site/layout-classes";
import { pill } from "@/components/application/site/site-ui";
import { cx } from "@/utils/cx";

// What people posted about Panelo (launch-day replies to @shadcnlabs, Nov 24-25, 2026). Panelo's own only, no
// quotes about the makers' other libraries. Every quote is a real public post, copied word for word without its leading
// @mentions (mid-quote trims marked with …), and links to its source. Never add one without its post URL.
// Names and avatars as the accounts show them (checked Nov 27, 2026); an avatar that stops loading falls
// back to initials.

// `verified`: X's blue check on the account, as X showed it on Nov 27, 2026.
type Quote = { name: string; handle: string; role?: string; verified?: boolean; avatar: string; text: string; url: string };

const QUOTES: Quote[] = [
  {
    name: "Terry Carson",
    handle: "mrterrycarson",
    verified: true,
    avatar: "https://pbs.twimg.com/profile_images/833004663142117377/SjMv4aVQ_200x200.jpg",
    text: "This looks like a great tool for building dashboards. I like how it's open source and MIT-licensed.",
    url: "https://x.com/mrterrycarson/status/2125404830999126268",
  },
  {
    name: "daz",
    handle: "dazxlr",
    verified: true,
    avatar: "https://pbs.twimg.com/profile_images/2112226313860009984/9R5zjYbM_200x200.jpg",
    text: "So clean components 😍",
    url: "https://x.com/dazxlr/status/2125233726544298419",
  },
  {
    name: "Aditya Mitra",
    handle: "adityamitrax",
    verified: true,
    avatar: "https://pbs.twimg.com/profile_images/1977715937873698816/GEcWVvQY_200x200.jpg",
    text: "This is so useful... Already a lot of places are popping up on my mind",
    url: "https://x.com/adityamitrax/status/2125470301442183356",
  },
  {
    name: "Nikhil Yadav",
    handle: "nikhilshares",
    verified: true,
    avatar: "https://pbs.twimg.com/profile_images/2112601563261005824/7Ztpkci8_200x200.png",
    text: "Fire speed 🔥",
    url: "https://x.com/nikhilshares/status/2125230674701652250",
  },
  {
    name: "Solheath Studio",
    handle: "koujioe",
    verified: true,
    avatar: "https://pbs.twimg.com/profile_images/2117313142887940096/mkd-ax8B_200x200.jpg",
    text: "that zoom out to thirty dashboards landed",
    url: "https://x.com/koujioe/status/2125311165777539495",
  },
  {
    name: "Nil . Dev .",
    handle: "Nil_phy_dreamer",
    verified: true,
    avatar: "https://pbs.twimg.com/profile_images/2103016892038365184/7e81IYKN_200x200.jpg",
    text: "I need this one badly .....",
    url: "https://x.com/Nil_phy_dreamer/status/2125227791528706438",
  },
  {
    name: "Jay 🦀",
    handle: "radiumcoders",
    verified: true,
    avatar: "https://pbs.twimg.com/profile_images/2122019051845345280/v2-7XVQb_200x200.jpg",
    text: "damn really coooooool 🔥",
    url: "https://x.com/radiumcoders/status/2125227623215476782",
  },
];

// The draft a visitor's post starts from; the brackets are theirs to replace. @shadcnlabs is the account
// the site footer links to, so the post reaches the team.
const POST_DRAFT = "Building with Panelo UI by @shadcnlabs: [what you built, or what you liked]\n\nhttps://paneloui.com";
export const POST_URL = `https://x.com/intent/post?text=${encodeURIComponent(POST_DRAFT)}`;

const initials = (name: string) =>
  name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

/** The author's X avatar over their initials, which show if the image ever stops loading. */
function Avatar({ quote }: { quote: Quote }) {
  return (
    <span aria-hidden className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-site-preview text-site-chip text-site-muted ring-1 ring-site-hairline ring-inset">
      {initials(quote.name)}
      {/* eslint-disable-next-line @next/next/no-img-element -- a 36px avatar from X, not worth next/image's remote config */}
      <img
        src={quote.avatar}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        onError={(event) => event.currentTarget.remove()}
        className="absolute inset-0 size-full object-cover"
      />
    </span>
  );
}

function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <li className="mb-4 break-inside-avoid">
      <figure className="flex flex-col gap-4 rounded-2xl bg-site-surface p-5 ring-1 ring-site-hairline">
        <figcaption className="flex items-center gap-3">
          <Avatar quote={quote} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex min-w-0 items-center gap-1">
              <span className="truncate text-site-body-medium text-site-ink">{quote.name}</span>
              {/* X's own blue, as on the post: it's their mark, not a Panelo colour. */}
              {quote.verified && <RiVerifiedBadgeFill role="img" aria-label="Verified on X" className="size-4 shrink-0 text-[#1d9bf0]" />}
            </span>
            <span className="truncate text-site-body text-site-faint">
              @{quote.handle}
              {quote.role && ` · ${quote.role}`}
            </span>
          </span>
          <a href={quote.url} target="_blank" rel="noreferrer" aria-label={`${quote.name}'s post on X`} className={cx("rounded-sm text-site-faint transition-colors duration-150 hover:text-site-ink", FOCUS)}>
            <RiTwitterXLine className="size-4" aria-hidden />
          </a>
        </figcaption>
        <blockquote cite={quote.url} className="text-site-body text-pretty text-site-ink">
          {quote.text}
        </blockquote>
      </figure>
    </li>
  );
}

/** The open slot that asks for the next post. */
function AddYours() {
  return (
    <li className="mb-4 break-inside-avoid">
      <a
        href={POST_URL}
        target="_blank"
        rel="noreferrer"
        className={cx(
          "group flex flex-col items-center gap-3 rounded-2xl p-8 text-center ring-1 ring-site-hairline ring-inset transition-colors duration-150 [background-image:repeating-linear-gradient(135deg,transparent_0_6px,var(--color-site-hairline)_6px_7px)] hover:bg-site-preview",
          FOCUS,
        )}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-site-surface text-site-ink shadow-site-raised ring-1 ring-site-hairline">
          <RiAddLine className="size-4 transition-transform duration-150 group-hover:rotate-90 motion-reduce:transition-none" aria-hidden />
        </span>
        <span className="text-site-body-medium text-site-ink">Your post goes here</span>
        <span className="text-site-body text-pretty text-site-muted">Tried Panelo? Post about it on X and we&apos;ll add it to the wall.</span>
      </a>
    </li>
  );
}

export function WallOfLoveSection() {
  return (
    <section id="love" className={cx(CONTAINER, SECTION, "scroll-mt-14")}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="max-w-[720px] text-site-heading text-balance sm:text-site-display-sm">
          <span className="text-site-ink">Loved since launch day.</span>{" "}
          <span className="text-site-muted">From the makers of snapcn and Ruixen&nbsp;UI.</span>
        </h2>
        <a href={POST_URL} target="_blank" rel="noreferrer" className={pill("secondary", "lg", "shrink-0")}>
          <RiTwitterXLine className="size-4" aria-hidden />
          Add your testimonial
        </a>
      </div>
      <ul className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {QUOTES.map((quote) => (
          <QuoteCard key={quote.url} quote={quote} />
        ))}
        <AddYours />
      </ul>
    </section>
  );
}
