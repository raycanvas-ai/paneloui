import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Marked } from "marked";

// The blog: markdown files in content/blog/<slug>.md (README.md and _research/ are notes, not posts).
// Read at build time; every page is static.

const DIR = join(process.cwd(), "content/blog");

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  cluster: string;
  primaryKeyword: string;
  html: string;
  faq: { q: string; a: string }[];
};

/** Top-level `key: value` pairs only; the lists and nested `cta` block aren't needed to render. */
function frontmatter(source: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match) throw new Error("Blog post without frontmatter");
  const data: Record<string, string> = {};
  for (const [, key, value] of match[1].matchAll(/^([a-zA-Z]+):[ \t]*(.+)$/gm)) data[key] = value.replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"');
  return { data, body: source.slice(match[0].length) };
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const plain = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const marked = new Marked({
  gfm: true,
  renderer: {
    // Ids on headings, so "#get-this-working-in-your-app" style links in the posts land.
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(inner)}">${inner}</h${depth}>\n`;
    },
    // Links to paneloui.com stay on whichever host serves the page (production or local).
    link({ href, title, tokens }) {
      const local = href.replace(/^https:\/\/(www\.)?paneloui\.com/, "") || "/";
      const external = /^https?:\/\//.test(local);
      const attrs = external ? ' rel="noopener noreferrer"' : "";
      return `<a href="${local}"${title ? ` title="${title}"` : ""}${attrs}>${this.parser.parseInline(tokens)}</a>`;
    },
  },
});

/** The FAQ section's questions, in either style the posts use: `### Question` or a `**Question**` line. */
function faqOf(body: string) {
  const section = /\n## FAQ\n([\s\S]*?)(?=\n## |$)/.exec(body)?.[1] ?? "";
  const items: { q: string; a: string }[] = [];
  for (const block of section.split(/\n(?=### |\*\*[^*\n]+\*\*\s*\n)/)) {
    const m = /^(?:### (.+)|\*\*([^*\n]+)\*\*)\s*\n([\s\S]+)/.exec(block.trim());
    if (m) items.push({ q: plain(m[1] ?? m[2]), a: plain(m[3]) });
  }
  return items;
}

function read(slug: string): Post {
  const { data, body } = frontmatter(readFileSync(join(DIR, `${slug}.md`), "utf8"));
  // The page renders the title itself, so the markdown's own H1 is dropped.
  const content = body.replace(/^\s*# .+\n/, "");
  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    // "UI SDK (pillar)" is a planning note; readers see the topic.
    cluster: (data.cluster ?? "").replace(/\s*\(pillar\)/i, ""),
    primaryKeyword: data.primaryKeyword ?? "",
    html: marked.parse(content, { async: false }),
    faq: faqOf(content),
  };
}

// content/blog/README.md is the editorial plan: its table's order (pillar topics first) is the index order.
const PLAN = [...readFileSync(join(DIR, "README.md"), "utf8").matchAll(/^\| \d+ \| ([a-z0-9-]+) \|/gm)].map((m) => m[1]);
const rank = (slug: string) => (PLAN.includes(slug) ? PLAN.indexOf(slug) : PLAN.length);

export const POST_SLUGS = readdirSync(DIR)
  .filter((f) => f.endsWith(".md") && f !== "README.md")
  .map((f) => f.slice(0, -3))
  .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

export const getPost = (slug: string) => (POST_SLUGS.includes(slug) ? read(slug) : null);
export const allPosts = () => POST_SLUGS.map(read);

export const formatDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
