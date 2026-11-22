import type { PreviewKind } from "./docs-data";

/**
 * Card thumbnails in the reference are screenshots of other product screens.
 * These are wireframes of the same shapes, drawn as SVG so they stay crisp at
 * any card width and cost nothing to ship.
 */

/** Every value is a theme token, so the thumbnails read as miniatures of THIS
 *  product in either mode rather than frozen light-mode screenshots. */
const tint = (percent: number) => `color-mix(in oklab, var(--foreground) ${percent}%, transparent)`;

const PAPER = "var(--card)";
const LINE = "var(--border)";
const SOFT = tint(7);
const RAIL = "var(--muted)";
const INK = tint(25);
const HEAD = tint(32);
const STRONG = "var(--foreground)";
const DOTS = [
  "var(--chart-4)",
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-5)",
  "var(--warning-solid)",
];

function Bar({
  x,
  y,
  w,
  h = 3,
  fill = LINE,
  r = 1.5,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  fill?: string;
  r?: number;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} />;
}

function Rows({
  top,
  count,
  render,
}: {
  top: number;
  count: number;
  render: (y: number, i: number) => React.ReactNode;
}) {
  return <>{Array.from({ length: count }, (_, i) => render(top + i * 14, i))}</>;
}

function Sidebar({ w = 44 }: { w?: number }) {
  return (
    <>
      <rect x="0" y="0" width={w} height="130" fill={RAIL} />
      <circle cx="10" cy="11" r="3.2" fill={INK} />
      <Bar x={16} y={9.5} w={16} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x="7" y={24 + i * 11} width="4" height="4" rx="1" fill={i === 1 ? tint(40) : INK} />
          <rect
            x="14"
            y={24.5 + i * 11}
            width={18 + ((i * 5) % 12)}
            height="3"
            rx="1.5"
            fill={i === 1 ? tint(18) : SOFT}
          />
        </g>
      ))}
    </>
  );
}

function Invoices() {
  return (
    <>
      <Bar x={12} y={9} w={30} h={4} fill={HEAD} />
      <Bar x={12} y={17} w={54} h={2.5} fill={SOFT} />
      <rect x="118" y="7" width="56" height="11" rx="5.5" fill="none" stroke={LINE} />
      <rect x="180" y="7" width="30" height="11" rx="5.5" fill="none" stroke={LINE} />
      {[12, 44, 78, 104, 130, 160].map((x) => (
        <Bar key={x} x={x} y={30} w={16} h={3} fill={SOFT} />
      ))}
      <Rows
        top={44}
        count={5}
        render={(y, i) => (
          <g key={y}>
            <rect x="12" y={y - 3} width="6" height="6" rx="1.5" fill="none" stroke={LINE} />
            <circle cx={47} cy={y} r="4.5" fill={DOTS[i % DOTS.length]} opacity="0.85" />
            <Bar x={55} y={y - 3.5} w={22} h={3} fill={LINE} />
            <Bar x={55} y={y + 1.5} w={16} h={2} fill={SOFT} />
            <Bar x={104} y={y - 1.5} w={12} h={3} fill={LINE} />
            {[0, 1, 2, 3].map((d) => (
              <circle key={d} cx={130 + d * 5} cy={y} r="2.6" fill={DOTS[(i + d) % DOTS.length]} opacity="0.8" />
            ))}
            <Bar x={160} y={y - 1.5} w={22} h={3} fill={SOFT} />
            <rect
              x="190"
              y={y - 4}
              width="14"
              height="8"
              rx="4"
              fill={
                i % 2
                  ? "color-mix(in oklab, var(--warning) 30%, transparent)"
                  : "color-mix(in oklab, var(--success) 28%, transparent)"
              }
            />
          </g>
        )}
      />
    </>
  );
}

function Integrations() {
  return (
    <>
      <Sidebar />
      <Bar x={54} y={10} w={34} h={4} fill={HEAD} />
      <Bar x={54} y={18} w={80} h={2.5} fill={SOFT} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={150 + i * 15} y="8" width="13" height="8" rx="4" fill={i === 0 ? "var(--chart-1)" : SOFT} />
      ))}
      <Rows
        top={34}
        count={6}
        render={(y, i) => (
          <g key={y}>
            <rect x="54" y={y - 6} width="152" height="12" rx="3" fill="none" stroke={SOFT} />
            <circle cx={62} cy={y} r="3.6" fill={DOTS[i % DOTS.length]} opacity="0.85" />
            <Bar x={70} y={y - 3.5} w={30} h={3} fill={LINE} />
            <Bar x={70} y={y + 1} w={70} h={2} fill={SOFT} />
            <rect x="186" y={y - 3} width="14" height="6" rx="3" fill={SOFT} />
          </g>
        )}
      />
    </>
  );
}

function Customers() {
  return (
    <>
      <Sidebar w={40} />
      <Bar x={50} y={10} w={26} h={4} fill={HEAD} />
      <rect x="176" y="7" width="28" height="10" rx="3" fill={STRONG} />
      {[50, 92, 124, 152, 180].map((x) => (
        <Bar key={x} x={x} y={26} w={18} h={3} fill={SOFT} />
      ))}
      <Rows
        top={40}
        count={6}
        render={(y, i) => (
          <g key={y}>
            <Bar x={50} y={y - 1.5} w={30} h={3} fill={LINE} />
            <rect
              x="92"
              y={y - 4}
              width="18"
              height="8"
              rx="4"
              fill={
                i % 3 === 0
                  ? "color-mix(in oklab, var(--chart-1) 22%, transparent)"
                  : i % 3 === 1
                    ? "color-mix(in oklab, var(--success) 22%, transparent)"
                    : "color-mix(in oklab, var(--destructive) 22%, transparent)"
              }
            />
            <Bar x={124} y={y - 1.5} w={18} h={3} fill={SOFT} />
            <Bar x={152} y={y - 1.5} w={20} h={3} fill={SOFT} />
            <circle cx={186} cy={y} r="3.4" fill={DOTS[i % DOTS.length]} opacity="0.85" />
          </g>
        )}
      />
    </>
  );
}

function Security() {
  return (
    <>
      <Sidebar w={46} />
      <Bar x={56} y={10} w={40} h={4} fill={HEAD} />
      <Bar x={56} y={18} w={92} h={2.5} fill={SOFT} />
      <rect x="56" y="30" width="150" height="42" rx="4" fill="none" stroke={SOFT} />
      <Bar x={64} y={38} w={44} h={3.5} fill={LINE} />
      <Bar x={64} y={46} w={110} h={2.5} fill={SOFT} />
      <Bar x={64} y={53} w={86} h={2.5} fill={SOFT} />
      <rect x="178" y="38" width="20" height="9" rx="4.5" fill={STRONG} />
      <Rows
        top={86}
        count={3}
        render={(y, i) => (
          <g key={y}>
            <circle cx={62} cy={y} r="3.6" fill={DOTS[i % DOTS.length]} opacity="0.8" />
            <Bar x={70} y={y - 3.5} w={44} h={3} fill={LINE} />
            <Bar x={70} y={y + 1} w={80} h={2} fill={SOFT} />
            <rect
              x="182"
              y={y - 4}
              width="18"
              height="8"
              rx="4"
              fill={i === 0 ? "color-mix(in oklab, var(--success) 28%, transparent)" : SOFT}
            />
          </g>
        )}
      />
    </>
  );
}

function Console() {
  return (
    <>
      <Sidebar w={42} />
      <Bar x={52} y={10} w={30} h={4} fill={HEAD} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={52 + i * 40} y="22" width="34" height="20" rx="3" fill="none" stroke={SOFT} />
          <Bar x={57 + i * 40} y={27} w={14} h={2.5} fill={SOFT} />
          <Bar x={57 + i * 40} y={33} w={22} h={4} fill={LINE} />
        </g>
      ))}
      <path
        d="M54 108 L74 96 L92 100 L110 82 L128 88 L146 66 L164 74 L182 54 L204 60"
        fill="none"
        stroke="var(--chart-3)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54 116 L74 110 L92 112 L110 100 L128 104 L146 92 L164 96 L182 84 L204 88"
        fill="none"
        stroke="var(--chart-4)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[54, 92, 128, 164, 204].map((x) => (
        <Bar key={x} x={x - 6} y={122} w={12} h={2.5} fill={SOFT} />
      ))}
    </>
  );
}

function Board() {
  return (
    <>
      <Bar x={12} y={10} w={34} h={4} fill={HEAD} />
      <rect x="176" y="7" width="28" height="10" rx="5" fill={STRONG} />
      <Bar x={12} y={26} w={26} h={3} fill={SOFT} />
      {[0, 1, 2, 3].map((col) => (
        <g key={col}>
          <rect x={12 + col * 49} y="36" width="44" height="88" rx="4" fill={RAIL} />
          <Bar x={17 + col * 49} y={42} w={20} h={3} fill={LINE} />
          {[0, 1, 2].map((row) => (
            <g key={row}>
              <rect x={17 + col * 49} y={52 + row * 24} width="34" height="18" rx="3" fill={PAPER} stroke={SOFT} />
              <Bar x={21 + col * 49} y={57 + row * 24} w={20} h={2.5} fill={LINE} />
              <circle
                cx={24 + col * 49}
                cy={65 + row * 24}
                r="2.4"
                fill={DOTS[(col + row) % DOTS.length]}
                opacity="0.85"
              />
              <Bar x={30 + col * 49} y={63.5 + row * 24} w={14} h={2.5} fill={SOFT} />
            </g>
          ))}
        </g>
      ))}
    </>
  );
}

const PREVIEWS: Record<PreviewKind, () => React.ReactNode> = {
  invoices: Invoices,
  integrations: Integrations,
  customers: Customers,
  security: Security,
  console: Console,
  board: Board,
};

export function DocPreview({ kind }: { readonly kind: PreviewKind }) {
  const Shape = PREVIEWS[kind];
  return (
    <svg viewBox="0 0 206 130" className="block h-auto w-full" role="img" aria-label="Document preview">
      <rect x="0" y="0" width="206" height="130" fill={PAPER} />
      <Shape />
    </svg>
  );
}
