# Pro blocks

- Every new Pro app screen (analytics, table, workflow, project, calendar, inbox, …) ships inside a full app shell with a sidebar: a full panel or a slim icon rail, like the existing `dashboard-pages-*` and `calendars-*` Pro blocks. Pro sells complete pages, not parts.
- Exceptions: profile and login pages, and the sidebars themselves.
- Free blocks stay shell-free so they drop into any app.
- Style skills are Pro only: a Pro page's `skill/SKILL.md` lives in the private pro repo beside the page, is flagged by the 4th `pro(...)` argument in `components-index.ts`, and builds into `registry-pro/` only. Never put one in free code, `public/r` or a page the site renders. Keep a page's skill in step when its style changes.
- File each block under the category it actually is (Analytics, Tables, Workflows, Projects, Calendars, Inbox, …) in `components/application/docs/components-index.ts`, never a generic "Dashboards" bucket.

# Design

- Any block work (build, restyle, review) follows the `panelo-design` skill, and is not done until `python -I .claude/skills/panelo-design/scripts/verify.py <slug>` passes and its crops have been looked at.
