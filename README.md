# Panelo

Panelo is a React design system for dashboards and AI products: source-owned components in one visual language, plus a working AI chat app you can deploy on your own model key.

- **Source, not a dependency.** Components live in `components/`. Change anything.
- **Built on React Aria and Tailwind CSS v4**, with semantic tokens in `styles/theme.css` and a full type scale in `styles/typography.css`.
- **Right-to-left ready** through `DirectionProvider`.

## Run it

```bash
npm install
cp .env.example .env.local   # add AI_API_KEY (OpenAI, Anthropic, Google, OpenRouter or Vercel AI Gateway)
npm run dev
```

Without a key, the chat runs in demo mode with canned answers.

## What's inside

| Path | What |
| --- | --- |
| `components/base` | Buttons, inputs, select, dropdown, tabs, switch, date pickers, table, tooltip and more |
| `components/application` | Agent chat, app shell, dashboard, settings, notification center, data table and grid, charts, auth |
| `app/` | The chat starter: `/` chat, `/dashboard`, `/components`, `/login`, `/signup`, `/api/chat` |
| `AGENTS.md`, `.cursor/rules/panelo.mdc` | Design rules for coding agents |

## License

[MIT](LICENSE).
