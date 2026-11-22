import { DM_Sans, Geist, Geist_Mono, Inter } from "next/font/google";

// next/font requires each loader to be called at module scope with literal options.
const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--font-dm-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-geist-mono" });

/**
 * Interface typefaces a workspace can switch between via `data-font` on <html>.
 * globals.css maps each id to --font-sans; code and numbers always use Geist Mono.
 */
export const FONTS = [
  { id: "geist", name: "Geist", className: geist.variable },
  { id: "inter", name: "Inter", className: inter.variable },
  { id: "dm-sans", name: "DM Sans", className: dmSans.variable },
] as const;

export const FONT_IDS = FONTS.map((font) => font.id);

/** Every font's CSS variable class, for <body>. */
export const FONT_VARIABLES = [...FONTS.map((font) => font.className), geistMono.variable].join(" ");
