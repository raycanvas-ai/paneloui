'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from 'react'
import { Button as BareButton } from '@ui-sdk/react/button'
import { Box, ExternalLink, Minus, Plus, RotateCcw, Search, Share2, X } from 'lucide-react'

import { Checkbox } from '@/components/panelo/ui/checkbox'
import { Input } from '@/components/panelo/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/panelo/ui/toggle-group'
import { cn } from '@/components/panelo/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Link graph: who mentions a site, who links to it and who it cites, drawn   */
/*  as hubs and the sites around them, with unlinked mentions on an outer      */
/*  ring. The same nodes lift into a 3D cloud you can orbit: one canvas, one    */
/*  selection, so switching views never loses your place. Pan, zoom, filter,   */
/*  search and select work in both.                                            */
/* -------------------------------------------------------------------------- */

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const KINDS = [
    ['university', 'University'],
    ['blog', 'Blog'],
    ['news', 'News'],
    ['service', 'Service'],
    ['research', 'Research'],
    ['portal', 'Portal'],
    ['company', 'Company'],
    ['social', 'Social media'],
    ['education', 'Education'],
    ['wiki', 'Wiki'],
    ['publisher', 'Publisher'],
    ['hotel', 'Hotel'],
] as const
export type Kind = (typeof KINDS)[number][0]
export type Relation = 'mentions' | 'links' | 'cited'

/** Three relations, three fixed colours: grey for a mention, ink-blue for a link, green for a citation. */
const RELATIONS: Record<Relation, { label: string; color: string }> = {
    mentions: { label: 'Who mentions us', color: 'color-mix(in oklab, var(--foreground) 30%, var(--card))' },
    links: { label: 'Who links to us', color: 'oklch(from var(--chart-1) calc(l - 0.12) c h)' },
    cited: { label: 'Who we cite', color: 'var(--tone-green-solid)' },
}
const EDGE = 'color-mix(in oklab, var(--tone-cyan-solid) 52%, var(--card))'

export type GraphNode = { id: number; label: string; kind: Kind; relation: Relation; x: number; y: number; z: number; r: number; hub?: boolean }
export type GraphEdge = { a: number; b: number; weight: 1 | 3 }

/* ---------------------------------- Data ---------------------------------- */

function hash(n: number) {
    let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const WORDS = ['north', 'atlas', 'river', 'civic', 'nova', 'delta', 'lumen', 'harbor', 'maple', 'orbit', 'quill', 'summit', 'vector', 'willow', 'ember', 'cedar', 'pixel', 'meridian', 'tandem', 'sable']
const TLD: Record<Kind, string> = { university: 'edu', blog: 'blog', news: 'news', service: 'io', research: 'org', portal: 'gov', company: 'com', social: 'social', education: 'academy', wiki: 'wiki', publisher: 'press', hotel: 'travel' }

/** A demo link map around one site: seven satellite hubs, their sites, and a ring of loose mentions. */
export function sampleGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const hubs: { label: string; kind: Kind; x: number; y: number; z: number; leaves: number; spread: number; r: number; fan?: number }[] = [
        { label: 'northwind.edu', kind: 'university', x: 0, y: 0, z: 0, leaves: 62, spread: 0.33, r: 14 },
        { label: 'wikipedia.org', kind: 'wiki', x: 0.74, y: 0, z: -0.3, leaves: 40, spread: 0.42, r: 12, fan: Math.PI },
        { label: 'citylab.org', kind: 'research', x: -0.44, y: -0.45, z: 0.4, leaves: 22, spread: 0.13, r: 8 },
        { label: 'medium.com', kind: 'blog', x: 0.11, y: -0.5, z: -0.45, leaves: 24, spread: 0.14, r: 8 },
        { label: 'campus.news', kind: 'news', x: -0.5, y: -0.03, z: -0.35, leaves: 14, spread: 0.1, r: 7 },
        { label: 'openedu.academy', kind: 'education', x: -0.46, y: 0.33, z: 0.35, leaves: 20, spread: 0.11, r: 7 },
        { label: 'linkedin.com', kind: 'social', x: -0.2, y: 0.42, z: 0.55, leaves: 10, spread: 0.08, r: 7 },
        { label: 'city.gov', kind: 'portal', x: 0.08, y: 0.46, z: -0.2, leaves: 10, spread: 0.08, r: 7 },
    ]
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    let seed = 1
    const rand = () => hash(seed++)
    const kindAt = () => KINDS[Math.floor(rand() * KINDS.length)][0]
    const name = (kind: Kind) => `${WORDS[Math.floor(rand() * WORDS.length)]}${WORDS[Math.floor(rand() * WORDS.length)]}.${TLD[kind]}`

    hubs.forEach((h) => nodes.push({ id: nodes.length, label: h.label, kind: h.kind, relation: 'links', x: h.x, y: h.y, z: h.z, r: h.r, hub: true }))
    hubs.forEach((h, hi) => {
        if (hi > 0) edges.push({ a: hi, b: 0, weight: 3 })
        for (let i = 0; i < h.leaves; i++) {
            // Satellites scatter round their hub; the big right-hand hub fans its sites back toward the centre.
            const angle = h.fan === undefined ? rand() * Math.PI * 2 : h.fan + (rand() - 0.5) * 1.15
            const dist = h.spread * (h.fan === undefined ? Math.sqrt(rand()) * 0.9 + 0.1 : 0.25 + rand() * 0.75)
            const kind = kindAt()
            const roll = rand()
            const id = nodes.length
            nodes.push({
                id,
                label: name(kind),
                kind,
                relation: roll < 0.47 ? 'links' : roll < 0.85 ? 'mentions' : 'cited',
                x: h.x + Math.cos(angle) * dist + (hi === 0 ? 0.05 : 0),
                y: h.y + Math.sin(angle) * dist * 0.92,
                z: h.z + (rand() - 0.5) * (hi === 0 ? 0.7 : 0.3),
                r: 3.6,
            })
            edges.push({ a: id, b: hi, weight: rand() < 0.14 ? 3 : 1 })
            // A few of every cluster also link straight to the centre.
            if (hi > 1 && rand() < 0.1) edges.push({ a: id, b: 0, weight: 1 })
        }
    })
    // The outer ring: mentions with no link at all.
    for (let i = 0; i < 170; i++) {
        const angle = (i / 170) * Math.PI * 2 + (rand() - 0.5) * 0.05
        const radius = 0.82 + rand() * 0.16
        const kind = kindAt()
        const roll = rand()
        nodes.push({ id: nodes.length, label: name(kind), kind, relation: roll < 0.72 ? 'mentions' : roll < 0.92 ? 'links' : 'cited', x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * 0.94, z: (rand() - 0.5) * 1.3, r: 3.3 })
    }
    return { nodes, edges }
}

/* -------------------------------- Projection ------------------------------- */

const W = 1000
const H = 680
const SCALE = 330 // unit space → viewBox units
const BASE = { yaw: 0.62, pitch: -0.42 } // where 3D opens
const MS = 900
const ease = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

type Camera = { yaw: number; pitch: number; zoom: number; panX: number; panY: number }
const HOME: Camera = { yaw: 0, pitch: 0, zoom: 1, panX: 0, panY: 0 }

/** Unit-space point → viewBox. `t` lifts z and blends in the 3D rotation and perspective. */
function project(n: { x: number; y: number; z: number }, t: number, cam: Camera) {
    const yaw = t * (BASE.yaw + cam.yaw)
    const pitch = t * (BASE.pitch + cam.pitch)
    const z = n.z * t
    const x1 = n.x * Math.cos(yaw) - z * Math.sin(yaw)
    const z1 = n.x * Math.sin(yaw) + z * Math.cos(yaw)
    const y2 = n.y * Math.cos(pitch) - z1 * Math.sin(pitch)
    const z2 = n.y * Math.sin(pitch) + z1 * Math.cos(pitch)
    const f = 1 / (1 + (z2 / 3.2) * t) // perspective, absent when flat
    // Rounded to 0.01: Node and the browser can differ in a trig function's last digit, which would
    // otherwise make the server's SVG and the client's disagree on hydration. 0.01 is far below a pixel.
    const round = (v: number) => Math.round(v * 100) / 100
    return { sx: round(W / 2 + x1 * f * SCALE * cam.zoom + cam.panX), sy: round(H / 2 + y2 * f * SCALE * cam.zoom + cam.panY), depth: z2, f }
}

/* -------------------------------- Component -------------------------------- */

export function LinkGraph({ data, site = 'northwind.edu', className }: { data?: { nodes: GraphNode[]; edges: GraphEdge[] }; site?: string; className?: string }) {
    const { nodes, edges } = useMemo(() => data ?? sampleGraph(), [data])
    const [view, setView] = useState<'2d' | '3d'>('2d')
    const [t, setT] = useState(0)
    const tNow = useRef(0)
    const [cam, setCam] = useState<Camera>(HOME)
    const [hover, setHover] = useState<number | null>(null)
    const [selected, setSelected] = useState<number | null>(null)
    const [hidden, setHidden] = useState<Set<Kind>>(new Set())
    const [shown, setShown] = useState<Set<Relation>>(new Set(['mentions', 'links', 'cited']))
    const [query, setQuery] = useState('')
    const stage = useRef<HTMLDivElement>(null)
    const pointers = useRef(new Map<number, { x: number; y: number }>())
    const drag = useRef<{ moved: boolean; x: number; y: number; node: number | null } | null>(null)
    const titleId = useId()
    const [narrow, setNarrow] = useState(false)

    // Narrow stages go square and crop to the ring, so the graph keeps its size instead of shrinking to a strip.
    useEffect(() => {
        const el = stage.current
        if (!el) return
        const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 520))
        observer.observe(el)
        return () => observer.disconnect()
    }, [])
    const vb = narrow ? { x: (W - 690) / 2, y: (H - 690) / 2, w: 690, h: 690 } : { x: 0, y: 0, w: W, h: H }

    // The morph, as in the contribution chart: the start point is read from a ref, so reversing never snaps.
    useEffect(() => {
        const target = view === '3d' ? 1 : 0
        const apply = (v: number) => {
            tNow.current = v
            setT(v)
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(target)
        const from = tNow.current
        if (from === target) return
        const duration = MS * Math.abs(target - from)
        let frame = 0
        let start = 0
        const tick = (now: number) => {
            start ||= now
            const k = clamp((now - start) / duration)
            apply(lerp(from, target, ease(k)))
            if (k < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [view])

    const neighbours = useMemo(() => {
        const map = new Map<number, Set<number>>()
        for (const e of edges) {
            if (!map.has(e.a)) map.set(e.a, new Set())
            if (!map.has(e.b)) map.set(e.b, new Set())
            map.get(e.a)!.add(e.b)
            map.get(e.b)!.add(e.a)
        }
        return map
    }, [edges])

    const q = query.trim().toLowerCase()
    const matches = q ? nodes.filter((n) => n.label.toLowerCase().includes(q)) : []
    const visible = (n: GraphNode) => n.hub || (!hidden.has(n.kind) && shown.has(n.relation))
    const focus = selected ?? hover
    const lit = focus === null ? null : new Set([focus, ...(neighbours.get(focus) ?? [])])

    const points = useMemo(() => nodes.map((n) => project(n, t, cam)), [nodes, t, cam])
    const order = useMemo(() => [...nodes.keys()].sort((a, b) => points[b].depth - points[a].depth), [nodes, points])

    const toViewBox = (clientX: number, clientY: number) => {
        const box = stage.current!.getBoundingClientRect()
        return { x: vb.x + ((clientX - box.left) / box.width) * vb.w, y: vb.y + ((clientY - box.top) / box.height) * vb.h, k: vb.w / box.width }
    }
    const zoomAt = (factor: number, vx = W / 2, vy = H / 2) =>
        setCam((c) => {
            const zoom = clamp(c.zoom * factor, 0.6, 4)
            const k = zoom / c.zoom
            // Keep the point under the cursor where it is.
            return { ...c, zoom, panX: vx - W / 2 - (vx - W / 2 - c.panX) * k, panY: vy - H / 2 - (vy - H / 2 - c.panY) * k }
        })

    const onPointerDown = (e: PointerEvent) => {
        // Read the pressed node from the press itself, before pointer capture retargets events:
        // hover state can be stale here, and a touch has no hover at all.
        const hit = (e.target as Element).closest?.('[data-node]')
        const node = hit ? Number(hit.getAttribute('data-node')) : null
        stage.current?.setPointerCapture(e.pointerId)
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
        drag.current = { moved: false, x: e.clientX, y: e.clientY, node }
    }
    const onPointerMove = (e: PointerEvent) => {
        const last = pointers.current.get(e.pointerId)
        if (!last || !drag.current) return
        const all = [...pointers.current.entries()]
        if (all.length === 2) {
            // Pinch: the change in finger distance is the zoom.
            const [[, a], [, b]] = all
            const other = all.find(([id]) => id !== e.pointerId)![1]
            const before = Math.hypot(a.x - b.x, a.y - b.y)
            const after = Math.hypot(e.clientX - other.x, e.clientY - other.y)
            if (before > 0) zoomAt(after / before)
            drag.current.moved = true
        } else {
            const dx = e.clientX - last.x
            const dy = e.clientY - last.y
            if (dx || dy) {
                // More than a few pixels from the press point makes it a drag, not a click.
                if (Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 4) drag.current.moved = true
                const { k } = toViewBox(e.clientX, e.clientY)
                // Flat: drag pans. 3D: drag orbits.
                setCam((c) => (tNow.current > 0.5 ? { ...c, yaw: c.yaw + dx * 0.008, pitch: clamp(c.pitch - dy * 0.006, -1.1, 1.1) } : { ...c, panX: c.panX + dx * k, panY: c.panY + dy * k }))
            }
        }
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    }
    const onPointerUp = (e: PointerEvent) => {
        pointers.current.delete(e.pointerId)
        if (pointers.current.size === 0) {
            // A press that didn't move is a click: on a node it selects, on empty space it clears.
            if (drag.current && !drag.current.moved) setSelected(drag.current.node)
            drag.current = null
        }
    }
    const onWheel = (e: WheelEvent) => {
        const { x, y } = toViewBox(e.clientX, e.clientY)
        zoomAt(Math.exp(-e.deltaY * 0.0015), x, y)
    }
    useEffect(() => {
        // React's wheel listener is passive; the stage needs to stop the page from scrolling while it zooms.
        const el = stage.current
        const stop = (e: globalThis.WheelEvent) => e.preventDefault()
        el?.addEventListener('wheel', stop, { passive: false })
        return () => el?.removeEventListener('wheel', stop)
    }, [])

    const onKey = (e: KeyboardEvent) => {
        const step = 40
        const orbit = tNow.current > 0.5
        const moves: Record<string, () => void> = {
            ArrowLeft: () => setCam((c) => (orbit ? { ...c, yaw: c.yaw - 0.12 } : { ...c, panX: c.panX + step })),
            ArrowRight: () => setCam((c) => (orbit ? { ...c, yaw: c.yaw + 0.12 } : { ...c, panX: c.panX - step })),
            ArrowUp: () => setCam((c) => (orbit ? { ...c, pitch: clamp(c.pitch + 0.1, -1.1, 1.1) } : { ...c, panY: c.panY + step })),
            ArrowDown: () => setCam((c) => (orbit ? { ...c, pitch: clamp(c.pitch - 0.1, -1.1, 1.1) } : { ...c, panY: c.panY - step })),
            '+': () => zoomAt(1.2),
            '=': () => zoomAt(1.2),
            '-': () => zoomAt(1 / 1.2),
            '0': () => setCam(HOME),
            Escape: () => setSelected(null),
        }
        const run = moves[e.key]
        if (!run) return
        e.preventDefault()
        run()
    }

    const pick = (id: number) => {
        setSelected(id)
        // Bring it to the middle, so a search result is never off-screen.
        if (tNow.current < 0.5) setCam((c) => ({ ...c, panX: c.panX - (points[id].sx - W / 2), panY: c.panY - (points[id].sy - H / 2) }))
    }

    const sel = selected === null ? null : nodes[selected]
    const tipNode = hover !== null && hover !== selected ? nodes[hover] : null
    const pct = (p: { sx: number; sy: number }) => ({ left: `${((p.sx - vb.x) / vb.w) * 100}%`, top: `${((p.sy - vb.y) / vb.h) * 100}%` })
    const counts = useMemo(() => Object.fromEntries(KINDS.map(([k]) => [k, nodes.filter((n) => n.kind === k && !n.hub).length])) as Record<Kind, number>, [nodes])

    return (
        <section aria-labelledby={titleId} className={cn('@container flex w-full flex-col gap-4', className)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 id={titleId} className="text-base leading-6 font-medium tracking-tight">
                        Link map
                    </h2>
                    <p className="text-[13px] text-muted-foreground">
                        Who mentions, links to and is cited by <span className="font-medium text-foreground">{site}</span>
                    </p>
                </div>
                <ToggleGroup type="single" value={view} onValueChange={(next: string) => next && setView(next as '2d' | '3d')} aria-label="View" className="shrink-0 gap-0.5 rounded-[10px] bg-muted p-[3px]">
                    {(
                        [
                            ['2d', 'Map', Share2],
                            ['3d', '3D', Box],
                        ] as const
                    ).map(([value, label, Icon]) => (
                        <ToggleGroupItem
                            key={value}
                            value={value}
                            className="h-7 flex-none cursor-pointer gap-1.5 rounded-[7px] px-3 text-[13px] font-normal text-muted-foreground first:rounded-[7px] last:rounded-[7px] hover:bg-transparent hover:text-foreground data-pressed:bg-card data-pressed:font-medium data-pressed:text-foreground data-pressed:shadow-xs">
                            <Icon className="size-3.5" aria-hidden />
                            {label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <div className="grid gap-4 @3xl:grid-cols-[minmax(0,1fr)_224px]">
                {/* ------------------------------- Stage ------------------------------ */}
                <div
                    ref={stage}
                    tabIndex={0}
                    role="group"
                    aria-roledescription="network graph"
                    aria-label={`${nodes.length} sites around ${site}, ${view === '3d' ? '3D' : 'map'} view. ${view === '3d' ? 'Drag or use arrow keys to orbit' : 'Drag or use arrow keys to pan'}; scroll, pinch or plus and minus to zoom; 0 resets.`}
                    onKeyDown={onKey}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onWheel={onWheel}
                    onPointerLeave={() => !drag.current && setHover(null)}
                    className={cn('relative touch-none overflow-hidden', narrow ? 'aspect-square' : 'aspect-[1000/680]', 'rounded-xl bg-card ring-1 ring-border/70 select-none', t > 0.5 ? 'cursor-grab active:cursor-grabbing' : 'cursor-move', focusRing)}>
                    <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} aria-hidden className="absolute inset-0 size-full">
                        <g>
                            {edges.map((e, i) => {
                                if (!visible(nodes[e.a]) || !visible(nodes[e.b])) return null
                                const a = points[e.a]
                                const b = points[e.b]
                                const on = lit ? lit.has(e.a) && lit.has(e.b) && (e.a === focus || e.b === focus) : true
                                const fade = 1 - t * clamp((a.depth + b.depth) / 2 + 0.4, 0, 1) * 0.55
                                return (
                                    <line
                                        key={i}
                                        x1={a.sx}
                                        y1={a.sy}
                                        x2={b.sx}
                                        y2={b.sy}
                                        stroke={on && lit ? 'oklch(from var(--chart-1) calc(l - 0.04) c h)' : EDGE}
                                        strokeWidth={(e.weight === 3 ? 2.2 : 0.9) * (on && lit ? 1.6 : 1)}
                                        opacity={(lit && !on) || q ? 0.12 : fade}
                                    />
                                )
                            })}
                        </g>
                        {order.map((id) => {
                            const n = nodes[id]
                            if (!visible(n)) return null
                            const p = points[id]
                            const dim = (lit && !lit.has(id)) || (q && !n.label.toLowerCase().includes(q))
                            const depthFade = 1 - t * clamp(p.depth + 0.4, 0, 1) * 0.5
                            const r = n.r * p.f * Math.sqrt(cam.zoom)
                            return (
                                <g key={id} data-node={id} onPointerEnter={() => setHover(id)} onPointerLeave={() => setHover((h) => (h === id ? null : h))} opacity={dim ? 0.15 : depthFade}>
                                    {/* A generous invisible hit area: the dots themselves are a few pixels wide. */}
                                    <circle cx={p.sx} cy={p.sy} r={Math.max(r + 5, 8)} fill="transparent" />
                                    <circle
                                        cx={p.sx}
                                        cy={p.sy}
                                        r={id === focus ? r + 2 : r}
                                        fill={n.hub ? RELATIONS.links.color : RELATIONS[n.relation].color}
                                        stroke={id === selected ? 'var(--foreground)' : n.hub ? 'var(--card)' : 'none'}
                                        strokeWidth={id === selected ? 2 : n.hub ? 2 : 0}
                                    />
                                </g>
                            )
                        })}
                    </svg>

                    {/* Hub names stay HTML, so they read at the same size whatever the stage's scale. */}
                    {nodes
                        // On a narrow stage only the two big hubs keep their names; the rest show on hover or selection.
                        .filter((n) => n.hub && (!narrow || n.r >= 12 || lit?.has(n.id)))
                        .map((n) => (
                            <span
                                key={n.id}
                                aria-hidden
                                className={cn(
                                    'pointer-events-none absolute translate-x-[-50%] translate-y-[calc(50%+6px)] rounded-full px-1.5 py-px text-[10.5px] font-medium whitespace-nowrap transition-opacity',
                                    n.id === 0 ? 'bg-foreground text-background' : 'bg-card/85 text-foreground/80 ring-1 ring-border/60',
                                    lit && !lit.has(n.id) && 'opacity-30'
                                )}
                                style={pct(points[n.id])}>
                                {n.label}
                            </span>
                        ))}

                    {tipNode ? (
                        <span aria-hidden className="pointer-events-none absolute z-10" style={pct(points[tipNode.id])}>
                            <span className="absolute bottom-0 left-0 mb-3 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[11.5px] whitespace-nowrap text-background shadow-md">
                                <span className="font-medium">{tipNode.label}</span>
                                <span className="opacity-70"> · {KINDS.find(([k]) => k === tipNode.kind)![1]}</span>
                            </span>
                        </span>
                    ) : null}

                    <div className="pointer-events-none absolute start-3 bottom-3 hidden flex-col gap-1 text-[11px] text-muted-foreground @lg:flex">
                        <span className="flex items-center gap-2">
                            <span className="grid w-5 place-items-center">
                                <span className="size-1.5 rounded-full bg-foreground/70" />
                            </span>
                            One site
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-px w-5" style={{ background: EDGE }} />1 link
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-[2.5px] w-5 rounded-full" style={{ background: EDGE }} />3 links
                        </span>
                    </div>

                    <div className="absolute end-3 bottom-3 flex flex-col gap-1" onPointerDown={(e) => e.stopPropagation()}>
                        {(
                            [
                                ['Zoom in', Plus, () => zoomAt(1.25)],
                                ['Zoom out', Minus, () => zoomAt(0.8)],
                                ['Reset view', RotateCcw, () => setCam(HOME)],
                            ] as const
                        ).map(([label, Icon, run]) => (
                            <BareButton key={label} aria-label={label} onClick={run} className={cn('grid size-8 cursor-pointer place-items-center rounded-lg bg-card text-muted-foreground shadow-xs ring-1 ring-border/70 hover:text-foreground', focusRing)}>
                                <Icon className="size-3.5" aria-hidden />
                            </BareButton>
                        ))}
                    </div>
                </div>

                <div aria-hidden className="-mt-2 flex items-center gap-4 text-[11px] text-muted-foreground @lg:hidden">
                    <span className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-foreground/70" />
                        One site
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-px w-4" style={{ background: EDGE }} />1 link
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-[2.5px] w-4 rounded-full" style={{ background: EDGE }} />3 links
                    </span>
                </div>

                {/* ------------------------------- Panel ------------------------------ */}
                <aside className="flex flex-col gap-5 text-[13px]">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor={`${titleId}-q`} className="text-[12px] text-muted-foreground">
                            Search sites
                        </label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <Input
                                id={`${titleId}-q`}
                                type="search"
                                placeholder="eg. medium"
                                value={query}
                                onValueChange={setQuery}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && matches[0]) pick(matches[0].id)
                                    if (e.key === 'Escape') setQuery('')
                                }}
                                className="h-8 ps-8 text-base md:text-[13px]"
                            />
                        </div>
                        {q ? (
                            <p aria-live="polite" className="text-[12px] text-muted-foreground">
                                {matches.length ? `${matches.length} match${matches.length === 1 ? '' : 'es'} · Enter to select` : 'No sites match'}
                            </p>
                        ) : null}
                    </div>

                    {sel ? (
                        <div className="rounded-xl bg-muted/60 p-3 ring-1 ring-border/60">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{sel.label}</p>
                                    <p className="text-[12px] text-muted-foreground">
                                        {KINDS.find(([k]) => k === sel.kind)![1]} · {sel.hub ? 'Hub' : RELATIONS[sel.relation].label.replace('Who ', '').replace(' us', '')}
                                    </p>
                                </div>
                                <BareButton aria-label="Clear selection" onClick={() => setSelected(null)} className={cn('-me-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground hover:text-foreground', focusRing)}>
                                    <X className="size-3.5" aria-hidden />
                                </BareButton>
                            </div>
                            <p className="mt-2 text-[12px] text-muted-foreground">{(neighbours.get(sel.id)?.size ?? 0) || 'No'} connection{neighbours.get(sel.id)?.size === 1 ? '' : 's'}</p>
                            <ul className="mt-1.5 flex flex-wrap gap-1">
                                {[...(neighbours.get(sel.id) ?? [])]
                                    .filter((id) => nodes[id].hub)
                                    .map((id) => (
                                        <li key={id}>
                                            <BareButton onClick={() => pick(id)} className={cn('h-6 cursor-pointer rounded-full bg-card px-2 text-[11.5px] ring-1 ring-border/70 hover:bg-background', focusRing)}>
                                                {nodes[id].label}
                                            </BareButton>
                                        </li>
                                    ))}
                            </ul>
                            <a href={`#${sel.label}`} className={cn('mt-2.5 inline-flex items-center gap-1 rounded-sm text-[12px] font-medium hover:underline', focusRing)}>
                                Open site
                                <ExternalLink className="size-3" aria-hidden />
                            </a>
                        </div>
                    ) : null}

                    <fieldset className="flex flex-col gap-1.5">
                        <legend className="mb-1.5 flex w-full items-center justify-between text-[12px] text-muted-foreground">
                            Filter by type
                            {hidden.size ? (
                                <BareButton onClick={() => setHidden(new Set())} className={cn('cursor-pointer rounded-sm text-[12px] text-foreground hover:underline', focusRing)}>
                                    Show all
                                </BareButton>
                            ) : null}
                        </legend>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 @3xl:grid-cols-1">
                            {KINDS.map(([kind, label]) => (
                                <label key={kind} className="flex cursor-pointer items-center gap-2">
                                    <Checkbox
                                        checked={!hidden.has(kind)}
                                        onCheckedChange={(checked) =>
                                            setHidden((prev) => {
                                                const next = new Set(prev)
                                                if (checked === true) next.delete(kind)
                                                else next.add(kind)
                                                return next
                                            })
                                        }
                                    />
                                    <span className={cn('flex-1', hidden.has(kind) && 'text-muted-foreground')}>{label}</span>
                                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{counts[kind]}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="flex flex-col gap-1">
                        <legend className="mb-1.5 text-[12px] text-muted-foreground">Show</legend>
                        {(Object.keys(RELATIONS) as Relation[]).map((rel) => {
                            const on = shown.has(rel)
                            return (
                                <BareButton
                                    key={rel}
                                    aria-pressed={on}
                                    onClick={() =>
                                        setShown((prev) => {
                                            const next = new Set(prev)
                                            if (on && next.size > 1) next.delete(rel)
                                            else next.add(rel)
                                            return next
                                        })
                                    }
                                    className={cn('flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-start transition-colors hover:bg-muted', !on && 'text-muted-foreground', focusRing)}>
                                    <span aria-hidden className={cn('size-3 rounded-full transition-opacity', !on && 'opacity-30')} style={{ background: RELATIONS[rel].color }} />
                                    {RELATIONS[rel].label}
                                </BareButton>
                            )
                        })}
                    </fieldset>

                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                        Click a site for details. {view === '3d' ? 'Drag to orbit' : 'Drag to pan'}, scroll or pinch to zoom.
                    </p>
                </aside>
            </div>
            <p aria-live="polite" className="sr-only">
                {sel ? `${sel.label} selected, ${neighbours.get(sel.id)?.size ?? 0} connections` : ''}
            </p>
        </section>
    )
}
