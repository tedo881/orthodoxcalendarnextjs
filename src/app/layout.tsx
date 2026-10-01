import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppHeader } from "@/components/AppHeader";
import { PwaInstall } from "@/components/PwaInstall";

const lort = localFont({
  src: "../fonts/lort.ttf",
  variable: "--font-lort",
  display: "swap",
});

const ucnobi = localFont({
  src: "../fonts/ucnobi.ttf",
  variable: "--font-ucnobi",
  display: "swap",
});

const algeti = localFont({
  src: "../fonts/bpgalgeti.ttf",
  variable: "--font-algeti",
  display: "swap",
});

export const metadata: Metadata = {
  title: "საეკლესიო კალენდარი",
  description:
    "მართლმადიდებლური საეკლესიო კალენდარი: დღის ხსენებები, მარხვა, ტროპარ-კონდაკები და წმინდანთა ცხოვრება.",
  manifest: "/manifest.webmanifest",
  applicationName: "საეკლესიო კალენდარი",
  appleWebApp: {
    capable: true,
    title: "საეკლესიო კალენდარი",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#bd9b59",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka" suppressHydrationWarning>
      <body
        className={`${lort.variable} ${ucnobi.variable} ${algeti.variable} min-h-dvh antialiased`}
      >
        <Providers>
          <AppHeader />
          <PwaInstall />
          <main className="w-full px-2 pb-24 pt-4 sm:px-4 sm:pt-6 lg:px-6">
            {children}
          </main>
          <footer
            className="no-print mx-auto w-full max-w-6xl space-y-4 px-4 pb-10 text-center text-sm sm:px-6"
            style={{ color: "var(--ink-soft)" }}
          >
            <p>
              გამოყენებული მასალა: „წმიდანთა ცხოვრება“, ტომი I–IV, თბილისი,
              2001–2003 წწ.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                className="pill px-4 py-2 transition-colors hover:text-[color:var(--ink)]"
                href="https://play.google.com/store/apps/details?id=geo.orthodox.calendar"
                target="_blank"
                rel="noreferrer"
              >
                Android აპლიკაცია · Google Play
              </a>
              <a
                className="pill px-4 py-2 transition-colors hover:text-[color:var(--ink)]"
                href="https://apps.apple.com/us/app/georgian-orthodox-calendar/id6813075320"
                target="_blank"
                rel="noreferrer"
              >
                iPhone აპლიკაცია · App Store
              </a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
