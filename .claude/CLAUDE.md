# Pro blocks

- Every new Pro app screen (analytics, table, workflow, project, calendar, inbox, …) ships inside a full app shell with a sidebar: a full panel or a slim icon rail, like the existing `dashboard-pages-*` and `calendars-*` Pro blocks. Pro sells complete pages, not parts.
- Exceptions: profile and login pages, and the sidebars themselves.
- Free blocks stay shell-free so they drop into any app.
- File each block under the category it actually is (Analytics, Tables, Workflows, Projects, Calendars, Inbox, …) in `components/application/docs/components-index.ts`, never a generic "Dashboards" bucket.
