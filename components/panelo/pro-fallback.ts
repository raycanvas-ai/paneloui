import type { ComponentType } from "react"

/**
 * What `@pro` resolves to when components/panelo/pro/ is absent (it is gitignored).
 * next.config.ts aliases `@pro` to pro/index.ts when that exists and leaves it here otherwise, so a fresh
 * clone builds with the free catalogue only. pro/index.ts must export the same names.
 */
export type ProLoaders = Record<string, () => Promise<ComponentType>>

export const HAS_PRO: boolean = false
/** Whole screens for /preview/[slug], keyed by catalogue slug. */
export const PRO_LOADERS: ProLoaders = {}
/** Pieces of pro screens the landing hero shows. */
export const PRO_PARTS: ProLoaders = {}
