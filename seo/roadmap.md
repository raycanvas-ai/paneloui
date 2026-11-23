# SEO roadmap: paneloui.com (2026-11-23)

Verdict: crawlable from day one, but invisible as a product: no canonicals, no share cards, no structured
prices, and the catalogue page wore the home page's title.

| # | Tier | Issue | What it cost | Fix | Owner | Status |
|---|---|---|---|---|---|---|
| 1 | REVENUE | No canonical on any page; `/components` duplicated the home title and description | Two pages split one query; parameter variants could index | Canonical per page; unique, query-first titles (≤ 60 chars) | agent | shipped |
| 2 | REVENUE | Plans and prices only as rendered text | AI answers and rich results can't quote Panelo's price | `SoftwareApplication` + `Offer` JSON-LD from the same `PLANS` the cards render | agent | shipped |
| 3 | REVENUE | No Open Graph or Twitter cards | Every shared link was a bare URL | Site card plus one per component, generated | agent | shipped |
| 4 | REVENUE | No `llms.txt` | Assistants summarise the site from scraps | `/llms.txt` built from the catalogue and plans | agent | shipped |
| 5 | COMPOUNDING | Not in Google Search Console or Bing Webmaster Tools | No index coverage data; Bing feeds ChatGPT search and Copilot | Verify both (DNS TXT on Cloudflare), submit `/sitemap.xml` | founder: get the TXT codes; agent adds them | next |
| 6 | COMPOUNDING | Not listed in the shadcn registry directory | The highest-intent listing for "shadcn dashboard components" | PR adding `@panelo` to shadcn's registry index | founder approves; agent opens PR | next |
| 7 | COMPOUNDING | No comparison pages | Buyers search "<kit> alternative" at decision time | `/vs/<kit>` pages with sourced facts only (see vs-and-alternatives skill) | agent, after #5 shows queries | later |
| 8 | COMPOUNDING | No "Built with Panelo" link loop | Usage earns no links | Optional attribution line in the free template's footer | founder decides | later |

## Fluff (ignore until the rows above ship)
- Legal pages share one generic description pattern.
