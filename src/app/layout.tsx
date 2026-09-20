import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppHeader } from "@/components/AppHeader";

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
  icons: { icon: [{ url: "/icon-192.png", sizes: "192x192" }] },
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
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
            {children}
          </main>
          <footer
            className="no-print mx-auto w-full max-w-6xl px-4 pb-10 text-center text-sm sm:px-6"
            style={{ color: "var(--ink-soft)" }}
          >
            გამოყენებული მასალა: „წმიდანთა ცხოვრება“, ტომი I–IV, თბილისი,
            2001–2003 წწ.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
