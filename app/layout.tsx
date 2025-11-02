import type { Metadata } from "next";
import {
  DM_Sans,
  Manrope,
  Geist_Mono,
  Chakra_Petch,
  Playfair_Display_SC
} from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// rare / logo font
const logoFont = Chakra_Petch({
  variable: "--font-logo",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Zzub",
  description: "Prediction markets explorer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${manrope.variable} ${geistMono.variable} ${logoFont.variable}`}
    >
      <body className="antialiased font-sans">
        {/* page shell */}
        <div className="mx-auto max-w-6xl px-4">
          {/* sticky, frosted header */}
          <header className="sticky top-0 z-50 mb-6">
            <div className="flex items-center justify-between h-16 rounded-b-xl border-b border-slate-200/60 bg-white/85 backdrop-blur-xl dark:bg-slate-900/45 dark:border-slate-700/40 px-5">
              <a
                href="/"
                className="logo font-logo text-xl tracking-[0.08em] leading-none text-slate-900 dark:text-slate-50"
              >
                zzub
              </a>
              <nav className="flex items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                <a href="/" className="hover:text-slate-950 dark:hover:text-white">
                  Markets
                </a>
                <a
                  href="/traders"
                  className="hover:text-slate-950 dark:hover:text-white"
                >
                  Top Traders
                </a>
                <a
                  href="/unpaid"
                  className="hover:text-slate-950 dark:hover:text-white"
                >
                  High Value Unpaid
                </a>
              </nav>
            </div>
          </header>

          <main className="pb-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
