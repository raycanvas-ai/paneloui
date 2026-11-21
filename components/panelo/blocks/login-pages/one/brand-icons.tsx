/* ────────────────────────────────────────────────────────────────────────
 * Brand / product logos used by the login block.
 * Self-contained inline SVGs (no external icon deps) so the block stays
 * registry-installable. Each keeps its intrinsic brand colors.
 * ──────────────────────────────────────────────────────────────────────── */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

/* Pixelcode "P" mark — bold P whose stem tapers into a pen nib.
 * Used in the logo lockup + orbit hub. */
export function PixelMark({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 32 32" className={className} {...props}>
            <path
                fill="#fff"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 6.5h7.2a5.6 5.6 0 0 1 0 11.2h-3.4V25.5H10V6.5Zm3.8 3.4v4.4h3.4a2.2 2.2 0 0 0 0-4.4h-3.4Z"
            />
        </svg>
    )
}

export function GoogleIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 48 48" className={className} {...props}>
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
            <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
        </svg>
    )
}

export function AppleIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
            <path
                fill="currentColor"
                d="M17.05 12.54c-.03-2.6 2.12-3.84 2.21-3.9-1.2-1.76-3.08-2-3.75-2.03-1.6-.16-3.11.94-3.92.94-.8 0-2.05-.92-3.37-.9-1.73.03-3.33 1.01-4.22 2.56-1.8 3.12-.46 7.74 1.29 10.27.85 1.24 1.87 2.63 3.2 2.58 1.28-.05 1.77-.83 3.32-.83 1.55 0 1.99.83 3.35.8 1.38-.02 2.26-1.26 3.11-2.51.98-1.44 1.38-2.83 1.4-2.9-.03-.02-2.69-1.03-2.72-4.1zM14.5 4.84c.71-.86 1.19-2.05 1.06-3.24-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.14 1.14.09 2.3-.58 3.01-1.44z"
            />
        </svg>
    )
}

export function MicrosoftIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 23 23" className={className} {...props}>
            <path fill="#F25022" d="M1 1h10v10H1z" />
            <path fill="#7FBA00" d="M12 1h10v10H12z" />
            <path fill="#00A4EF" d="M1 12h10v10H1z" />
            <path fill="#FFB900" d="M12 12h10v10H12z" />
        </svg>
    )
}

export function EdgeIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 48 48" className={className} {...props}>
            <defs>
                <radialGradient id="edge-body" cx="70%" cy="38%" r="78%">
                    <stop offset="0" stopColor="#3D8BF0" />
                    <stop offset=".55" stopColor="#1E6FE0" />
                    <stop offset="1" stopColor="#114A8B" />
                </radialGradient>
                <linearGradient id="edge-tail" x1="10" y1="42" x2="34" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#36D6A0" />
                    <stop offset=".45" stopColor="#22B6C6" />
                    <stop offset="1" stopColor="#1F8FE0" />
                </linearGradient>
            </defs>
            {/* main sphere with the Edge "smile" opening at the bottom-left */}
            <path
                fill="url(#edge-body)"
                d="M40.5 23.2c0 1.6-.2 3-.5 4-1.3 4.4-4.6 7-9 7-3.6 0-6.6-2.1-6.6-5.4 0-2.3 1.4-3.9 3.6-5 2.4-1.2 3.4-2.4 3.4-4 0-1.8-1.7-3.1-4-3.1-5.8 0-10.3 4.6-10.3 11.2 0 1.2.2 2.4.5 3.4C18 41 22.7 44 28.2 44 35.4 44 41 38.4 41 31.2c0-2.9-.2-5.6-.5-8Z"
            />
            {/* teal-green tail / lower wave */}
            <path
                fill="url(#edge-tail)"
                d="M11.6 33.6C8.9 30.9 7 26.9 7 22.5 7 12.9 14.9 6 24.3 6c6 0 10.9 2.6 13.6 6.6-2.6-2-5.8-3-9.4-3-7 0-12.4 4.8-12.4 11 0 2.7 1 5 2.8 6.8.7.7 1.3 1.6 1.3 2.7 0 1.4-1 2.6-2.6 2.6-1.4 0-2.9-.8-4-2.9Z"
            />
        </svg>
    )
}

export function ChromeIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 48 48" className={className} {...props}>
            <path fill="#fff" d="M24 16a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />
            <path fill="#EA4335" d="M24 4a20 20 0 0 1 17.32 10H24a10 10 0 0 0-9.4 6.6L8.7 10.3A19.96 19.96 0 0 1 24 4z" />
            <path fill="#FBBC05" d="M8.7 10.3 17 24a10 10 0 0 0 5 8.66L13.2 43.3A20 20 0 0 1 4 24c0-5.2 2-9.95 5.3-13.5z" />
            <path fill="#34A853" d="M44 24a20 20 0 0 1-30.8 19.3L22 28a10 10 0 0 0 12.6-6H44z" />
            <path fill="#4285F4" d="M24 17a7 7 0 1 1 0 14 7 7 0 0 1 0-14z" />
        </svg>
    )
}

export function OutlookIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 48 48" className={className} {...props}>
            <path fill="#0A2767" d="M44 24.8 26 14v20l18-2.8z" />
            <rect x="24" y="11" width="20" height="26" rx="1.5" fill="#0364B8" />
            <path fill="#28A8EA" d="M44 16v18a1.5 1.5 0 0 1-1.5 1.5H26V16h18z" opacity=".0" />
            <rect x="4" y="9" width="26" height="30" rx="2" fill="#0078D4" />
            <path fill="#fff" d="M17 16.4c-3.7 0-6.3 2.9-6.3 7.1 0 4 2.5 6.9 6.1 6.9 3.7 0 6.3-2.9 6.3-7.1 0-4.2-2.5-6.9-6.1-6.9zm-.1 2.6c2 0 3.3 1.8 3.3 4.4 0 2.6-1.3 4.4-3.3 4.4s-3.3-1.8-3.3-4.4 1.3-4.4 3.3-4.4z" />
            <path fill="#fff" d="M26 18h16v2H26zM26 23h16v2H26zM26 28h16v2H26z" opacity=".55" />
        </svg>
    )
}

export function MessengerIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
            <defs>
                <linearGradient id="msgr" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00B2FF" />
                    <stop offset=".5" stopColor="#006AFF" />
                    <stop offset="1" stopColor="#A033FF" />
                </linearGradient>
            </defs>
            <path
                fill="url(#msgr)"
                d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.44 6.53 3.77 8.62.2.18.31.42.32.69l.07 2.13a.96.96 0 0 0 1.35.85l2.38-1.05a.96.96 0 0 1 .64-.05c1.1.3 2.26.46 3.47.46 6.76 0 12-4.95 12-11.64C24 4.95 18.76 0 12 0z"
            />
            <path
                fill="#fff"
                d="m4.8 15.05 3.52-5.6c.56-.88 1.76-1.1 2.6-.48l2.8 2.1c.26.2.6.2.87 0l3.79-2.87c.5-.39 1.17.22.82.75l-3.52 5.6c-.56.88-1.76 1.1-2.6.48l-2.8-2.1a.7.7 0 0 0-.87 0l-3.79 2.87c-.5.39-1.17-.22-.82-.75z"
            />
        </svg>
    )
}

export function YahooIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
            <rect width="24" height="24" rx="5" fill="#5F01D1" />
            <path fill="#fff" d="M5 7.3h2.85l1.66 4.25L11.2 7.3h2.78l-3.6 8.45H7.6l.99-2.29L5 7.3z" />
            <circle cx="14.7" cy="14.4" r="1.4" fill="#fff" />
            <path fill="#fff" d="M15.3 6.6h2.5l-.7 5.7h-1.1l-.7-5.7z" />
        </svg>
    )
}

export function LinkedInIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
            <rect width="24" height="24" rx="4" fill="#0A66C2" />
            <path
                fill="#fff"
                d="M7.2 9.4H4.6V19h2.6V9.4zM5.9 5.2A1.5 1.5 0 1 0 5.9 8.2a1.5 1.5 0 0 0 0-3zM19.4 19h-2.6v-4.9c0-1.2-.43-2-1.5-2-.82 0-1.3.55-1.52 1.08-.08.19-.1.45-.1.71V19H11s.03-8.5 0-9.6h2.6v1.36c.35-.54.97-1.3 2.35-1.3 1.72 0 3.45 1.1 3.45 3.86V19z"
            />
        </svg>
    )
}

export function AndroidIcon({ className, ...props }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" className={className} {...props}>
            <path
                fill="#3DDC84"
                d="M17.6 9.48 19 7.05a.42.42 0 1 0-.73-.42l-1.42 2.46A8.7 8.7 0 0 0 12 8.1c-1.74 0-3.4.36-4.85 1L5.73 6.63a.42.42 0 1 0-.73.42l1.4 2.43A8.13 8.13 0 0 0 2.5 16h19a8.13 8.13 0 0 0-3.9-6.52zM7.7 13.6a1.02 1.02 0 1 1 0-2.05 1.02 1.02 0 0 1 0 2.05zm8.6 0a1.02 1.02 0 1 1 0-2.05 1.02 1.02 0 0 1 0 2.05z"
            />
        </svg>
    )
}
