'use client'

import { useId } from 'react'

/** Australia's flag in a circle, drawn as SVG so it is sharp at any size and needs no emoji font. */
export function AustraliaFlag({ className = 'size-[18px]' }: { className?: string }) {
    const id = useId()
    const star = (x: number, y: number, r: number) => {
        const pts = Array.from({ length: 10 }, (_, i) => {
            const a = (Math.PI / 5) * i - Math.PI / 2
            const rr = i % 2 ? r * 0.45 : r
            return `${(x + rr * Math.cos(a)).toFixed(2)},${(y + rr * Math.sin(a)).toFixed(2)}`
        })
        return <polygon key={`${x}-${y}`} points={pts.join(' ')} fill="#fff" />
    }
    return (
        <svg viewBox="0 0 20 20" className={`${className} shrink-0 rounded-full shadow-[0_0_0_1px_rgb(0_0_0/0.08)]`} aria-hidden>
            <defs>
                <clipPath id={`${id}-c`}>
                    <circle cx="10" cy="10" r="10" />
                </clipPath>
                <clipPath id={`${id}-q`}>
                    <rect width="10" height="10" />
                </clipPath>
            </defs>
            <g clipPath={`url(#${id}-c)`}>
                <rect width="20" height="20" fill="#012169" />
                <g clipPath={`url(#${id}-q)`}>
                    <path d="M0 0 10 10M10 0 0 10" stroke="#fff" strokeWidth="2.2" />
                    <path d="M0 0 10 10M10 0 0 10" stroke="#C8102E" strokeWidth="0.9" />
                    <path d="M5 0v10M0 5h10" stroke="#fff" strokeWidth="2.8" />
                    <path d="M5 0v10M0 5h10" stroke="#C8102E" strokeWidth="1.5" />
                </g>
                {star(5, 15, 2.1)}
                {star(15, 4.2, 1.1)}
                {star(18, 9, 1.1)}
                {star(12.4, 10, 1.1)}
                {star(15, 16.2, 1.2)}
            </g>
        </svg>
    )
}
