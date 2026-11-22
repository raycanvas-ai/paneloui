# Panelo Admin

A production-ready admin dashboard template for SaaS products, internal tools and commerce back offices — built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4** and **shadcn/ui**.

## What's inside

| Area | Screens |
| --- | --- |
| Dashboards | Overview, Ecommerce, Finance, Analytics, Portfolio |
| Apps | Chat, Mail, Calendar, Kanban, Docs, Automations |
| Commerce | Products, Product detail, Orders, Order detail, Checkout, Pricing |
| Management | Users, User profile, Roles & permissions, Companies, Invoices |
| Account | General, Security, Notifications, Billing, API keys, Onboarding |
| Pages | Notifications, Activity log, Search results, Help center, Changelog, Coming soon, 404, 500, Maintenance |
| Authentication | Login, Register, Forgot password, Reset password, Verify email, Two-factor, Lock screen |

### Highlights

- One semantic colour system across every screen, with light and dark mode and three extra theme presets (Ember, Graphite, Harbor).
- Theme, font and content-width preferences that persist and apply before first paint — no flash of the wrong theme.
- Screens built on shared sample data, so numbers and names line up between pages (orders, products, invoices, members).
- Working interactions: drag-and-drop board, mail compose and reply, chat, editable permissions, filters, CSV export, ⌘K search.
- Responsive down to mobile, keyboard accessible, and respectful of reduced-motion settings.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Recharts · React Hook Form + Zod · dnd-kit · date-fns · Biome · Husky

## Get it

```bash
curl -fsSL https://www.paneloui.com/t/panelo-admin.tgz | tar -xz && cd panelo-admin
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The sign-in screen shows the demo login, and a live copy runs at [demo-admin.paneloui.com](https://demo-admin.paneloui.com/dashboard/default).

## Make it yours

| What | Where |
| --- | --- |
| Product name, links, copyright | `src/config/app-config.ts` |
| Sidebar and navigation | `src/navigation/sidebar/sidebar-items.ts` |
| Colours and themes | `src/styles/presets/*.css`, then `npm run generate:presets` |
| Sample data | `src/data/` — replace each module with calls to your API; the screens only read typed arrays |
| Sign-in | The auth screens are UI only. Wire them to your provider (Auth.js, Clerk, Supabase, …) |

## Project layout

Each screen keeps its page and components together under `src/app/(main)/dashboard/<screen>/`. Shared building blocks live in `src/components`, `src/hooks` and `src/lib`.

## Deploy

Any Node host works: `npm run build && npm start`. On Vercel, import the folder; there's nothing to configure.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run check` / `npm run check:fix` | Lint and format with Biome |
| `npm run generate:presets` | Rebuild the theme preset index after editing `src/styles/presets` |

## License and credits

MIT, see [LICENSE](LICENSE). Panelo began as a fork of [next-shadcn-admin-dashboard](https://github.com/arhamkhnz/next-shadcn-admin-dashboard) by Mohammed Arham Khan and has since been largely rewritten; its UI primitives come from [shadcn/ui](https://github.com/shadcn-ui/ui). Details in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
