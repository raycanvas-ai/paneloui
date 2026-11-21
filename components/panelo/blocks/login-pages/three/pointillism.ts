/* -------------------------------------------------------------------------- */
/*  A seeded pointillist landscape, painted dot by dot on a canvas.            */
/*  The scene is described in unit space (u across, v down), so one painter    */
/*  serves the portrait card and the landscape backdrop alike. Same seed,      */
/*  same painting: nothing random survives a reload.                            */
/*  Artwork colours are the painting itself, so they stay literal.              */
/* -------------------------------------------------------------------------- */

type RGB = readonly [number, number, number]
type Region = { colors: readonly RGB[]; accents: readonly RGB[] }

const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const set = (...h: string[]) => h.map(hex)

const REGIONS = {
    sky: { colors: set('#f3d9c8', '#e7e3ef', '#cfe1ea', '#f6ead0', '#ead2d9'), accents: set('#9fc3d9', '#f0b98f') },
    trees: { colors: set('#2f5d3a', '#3f7a46', '#24482f', '#5b8f4e', '#356b41'), accents: set('#3c5f8a', '#8fb35a') },
    meadow: { colors: set('#c9d86a', '#a9c95a', '#e3d77a', '#8fbf5b', '#d6e08a'), accents: set('#e9a45a', '#6fa3c0') },
    hill: { colors: set('#1f4d34', '#2e6b43', '#3d7d4f', '#24543d', '#2a5d46'), accents: set('#4a6fa5', '#7fb06a', '#a8c45a') },
    gold: { colors: set('#e9d27a', '#f0dc8a', '#d9c060', '#e5c86a', '#cfd36e'), accents: set('#7fae5a', '#d9963a', '#5f8fb5') },
    field: { colors: set('#6fa85a', '#93c06a', '#4f8a4a', '#b9cf6a', '#7fb25e'), accents: set('#e0a050', '#d9cf6a', '#4d79a8') },
    ground: { colors: set('#2a4a2f', '#3b5f37', '#5a3e2a', '#22402c', '#4d6b35'), accents: set('#c6633a', '#e0b24a', '#3f6aa0') },
    figure: { colors: set('#1f2a44', '#2b3550', '#243045'), accents: set('#3d4a6b') },
    hat: { colors: set('#c58a3a', '#b5782f', '#d9a24a'), accents: set('#8a5a2a') },
    shirt: { colors: set('#3a5fa8', '#2f4f8f', '#4a72b8'), accents: set('#1f2a44') },
} satisfies Record<string, Region>

type RegionName = keyof typeof REGIONS

/** Pale flecks scattered through every region: what makes pointillism glow. */
const HIGHLIGHTS = set('#f6f1d6', '#eef3dc', '#f3e7d2', '#e4eef0')

const inEllipse = (u: number, v: number, cu: number, cv: number, ru: number, rv: number) => ((u - cu) / ru) ** 2 + ((v - cv) / rv) ** 2 <= 1

/** An ellipse turned by `angle` radians: the big hill falls away to the right. */
const inTilted = (u: number, v: number, cu: number, cv: number, ru: number, rv: number, angle: number) => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return inEllipse(cu + (u - cu) * cos + (v - cv) * sin, cv - (u - cu) * sin + (v - cv) * cos, cu, cv, ru, rv)
}

/** Cheap smooth noise in -1..1: a few crossed sines, enough to make edges wander like brushwork. */
const wobble = (u: number, v: number) => Math.sin(u * 13 + v * 7) * 0.5 + Math.sin(u * 29 - v * 17 + 1.3) * 0.3 + Math.sin(u * 61 + v * 43 + 2.1) * 0.2

/** Which part of the scene a point belongs to, front to back. */
function regionAt(u0: number, v0: number): RegionName {
    // Figures first, on the true coordinates so they keep their shape.
    // A walker on the hill path.
    if (inEllipse(u0, v0, 0.43, 0.44, 0.017, 0.015)) return 'figure'
    if (u0 > 0.416 && u0 < 0.446 && v0 > 0.452 && v0 < 0.53 && Math.abs(u0 - 0.431) < 0.015 - (v0 - 0.452) * 0.05) return 'figure'
    if (v0 >= 0.53 && v0 < 0.565 && (Math.abs(u0 - 0.424) < 0.005 || Math.abs(u0 - 0.438) < 0.005)) return 'figure'
    // A picker in a straw hat, with a basket.
    if (inEllipse(u0, v0, 0.63, 0.705, 0.05, 0.011) || inEllipse(u0, v0, 0.63, 0.695, 0.022, 0.014)) return 'hat'
    if (inEllipse(u0, v0, 0.63, 0.722, 0.017, 0.016)) return 'figure'
    if (inEllipse(u0, v0, 0.63, 0.77, 0.038, 0.042)) return 'shirt'
    if (inEllipse(u0, v0, 0.69, 0.8, 0.035, 0.022) && v0 > 0.79) return 'hat'
    // A seated figure in the foreground, cropped by the left edge.
    if (inEllipse(u0, v0, 0.13, 0.735, 0.14, 0.018) || inEllipse(u0, v0, 0.13, 0.715, 0.06, 0.03)) return 'hat'
    if (inEllipse(u0, v0, 0.14, 0.77, 0.045, 0.035)) return 'figure'
    if (inEllipse(u0, v0, 0.08, 0.9, 0.13, 0.12)) return v0 > 0.86 && u0 < 0.05 ? 'figure' : 'shirt'

    // Everything else wanders: warp the point so no edge is a clean curve.
    const u = u0 + wobble(u0, v0) * 0.022
    const v = v0 + wobble(v0 + 3, u0) * 0.018

    if (v > 0.84 + 0.04 * Math.sin(u * 9 + 1)) return 'ground'
    // Trees along the top edge.
    if (
        inEllipse(u, v, 0.12, 0.14, 0.075, 0.16) ||
        inEllipse(u, v, 0.4, 0.11, 0.06, 0.14) ||
        inEllipse(u, v, 0.63, 0.15, 0.08, 0.13) ||
        inEllipse(u, v, 0.9, 0.12, 0.09, 0.15) ||
        inEllipse(u, v, 0.27, 0.07, 0.04, 0.1)
    )
        return 'trees'
    if (v < 0.11 + 0.03 * Math.sin(u * 7)) return 'sky'
    // The big dark hill on the left, and a second, smaller one to the right.
    if (inTilted(u, v, 0.34, 0.37, 0.5, 0.085, 0.2) || inEllipse(u, v, 0.86, 0.58, 0.2, 0.055)) return 'hill'
    if (v < 0.33 + 0.05 * Math.sin(u * 4 + 1)) return 'meadow'
    if (v < 0.56 + 0.05 * Math.sin(u * 5 + 2)) return 'gold'
    return 'field'
}

function mulberry32(seed: number) {
    return () => {
        seed |= 0
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export type PaintOptions = {
    /** Dot radius in canvas pixels. */
    dot: number
    seed?: number
    /** Paint in frames, as if it were being painted; pass false under reduced motion. */
    animate?: boolean
}

/**
 * Paints the scene onto `canvas` at its current pixel size. Returns a cancel
 * function for an animated paint in progress.
 */
export function paint(canvas: HTMLCanvasElement, { dot, seed = 7, animate = false }: PaintOptions): () => void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return () => {}
    const { width, height } = canvas
    const random = mulberry32(seed)

    // Stratified dots: one per cell, jittered, so the surface is covered evenly with no clumps.
    const step = dot * 1.55
    const dots: { x: number; y: number; r: number; c: string }[] = []
    for (let pass = 0; pass < 2; pass++) {
        // Pass 0 lays a coarse, darker underpaint; pass 1 the bright dots on top.
        const s = pass === 0 ? step * 1.7 : step
        const layer: typeof dots = []
        for (let y = 0; y < height + s; y += s) {
            for (let x = 0; x < width + s; x += s) {
                const px = x + (random() - 0.5) * s
                const py = y + (random() - 0.5) * s
                // Sampling slightly off the dot's own spot dithers every boundary, the way the brush overlaps.
                const spread = dot * 2.2
                const region = REGIONS[regionAt((px + (random() - 0.5) * spread) / width, (py + (random() - 0.5) * spread) / height)]
                const roll = random()
                const pool = roll < 0.04 ? HIGHLIGHTS : roll < 0.15 ? region.accents : region.colors
                const [r, g, b] = pool[Math.floor(random() * pool.length)]
                const shade = (pass === 0 ? 0.86 : 1.06) + (random() - 0.5) * 0.14
                layer.push({
                    x: px,
                    y: py,
                    r: (pass === 0 ? dot * 1.6 : dot) * (0.75 + random() * 0.5),
                    c: `rgb(${Math.min(255, r * shade)} ${Math.min(255, g * shade)} ${Math.min(255, b * shade)})`,
                })
            }
        }
        // Shuffle each layer so an animated paint sparkles in rather than wiping down.
        for (let i = layer.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1))
            ;[layer[i], layer[j]] = [layer[j], layer[i]]
        }
        dots.push(...layer)
    }

    ctx.fillStyle = '#4f6b3e'
    ctx.fillRect(0, 0, width, height)
    const draw = (from: number, to: number) => {
        for (let i = from; i < to; i++) {
            const d = dots[i]
            ctx.fillStyle = d.c
            ctx.beginPath()
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    if (!animate) {
        draw(0, dots.length)
        return () => {}
    }
    // About 600ms at 60fps, whatever the canvas size.
    const perFrame = Math.ceil(dots.length / 36)
    let done = 0
    let frame = requestAnimationFrame(function tick() {
        draw(done, Math.min(dots.length, done + perFrame))
        done += perFrame
        if (done < dots.length) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
}
