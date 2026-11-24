import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import { PromoBar } from "@/components/application/site/promo-bar";
import { DirectionProvider } from "@/components/foundations/direction/direction";

import "@/styles/globals.css";

// Panelo's type scale is set in Inter with the optical-size axis, so display
// sizes render in the display grade and body sizes in the text grade from one
// variable font. The variable names are what styles/typography.css expects.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-source",
  subsets: ["latin"],
});

// Panelo's components and blocks are set in Geist, as in temp-01 (see [data-panelo] in globals.css).
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // Relative canonicals and share images resolve against the production origin.
  metadataBase: new URL("https://www.paneloui.com"),
  title: { default: "React Dashboard Components for shadcn/ui | Panelo UI", template: "%s | Panelo UI" },
  description: "React and Tailwind dashboard components, charts and templates built on Vercel's UI SDK, so AI agents can read and operate them.",
  applicationName: "Panelo UI",
  authors: [{ name: "Raycanvas", url: "https://raycanvas.ai" }],
  publisher: "Raycanvas",
  openGraph: { siteName: "Panelo UI", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-US"
      dir="ltr"
      className={`${inter.variable} ${jetbrainsMono.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* Applies the stored theme before first paint, so a dark-mode visitor
            never sees a light flash. The key matches the theme toggle. */}
        <Script id="panelo-theme" strategy="beforeInteractive">
          {`(function(){try{var dark=localStorage.getItem("panelo:theme")==="dark";document.documentElement.classList.toggle("dark",dark)}catch(e){document.documentElement.classList.remove("dark")}})();`}
        </Script>
        <DirectionProvider locale="en-US">
          <PromoBar />
          {children}
        </DirectionProvider>
      </body>
    </html>
  );
}
