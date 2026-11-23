import { ImageResponse } from "next/og";

// Share cards (1200x630) for links on X, LinkedIn, Slack and the rest. Rendered by next/og, which takes
// inline styles only, so the site's tokens can't reach it: these are the light theme's ink, muted and
// hairline values, kept monochrome like the site.
export const OG_SIZE = { width: 1200, height: 630 };
const INK = "#0a0a0a";
const MUTED = "#6b6b6b";
const LINE = "#e6e6e6";

export function ogImage({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#ffffff", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: INK }} />
          Panelo UI
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 28, color: MUTED }}>{eyebrow}</div>
          <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${LINE}`, paddingTop: 28, fontSize: 26, color: MUTED }}>
          <span>{detail}</span>
          <span>paneloui.com</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
