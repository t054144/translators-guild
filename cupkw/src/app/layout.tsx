import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { BuildProvider } from "@/lib/build-store";
import { AuthProvider } from "@/lib/auth";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * Fonts are self-hosted, served from the @fontsource packages in
 * node_modules. next/font/local fingerprints and serves them from our own
 * origin at build time, so the site never calls a third-party font CDN and
 * nothing about the page's typography leaks to another origin at runtime.
 */
// next/font requires literal paths — no template strings or constants.
const bricolage = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
      weight: "200 800",
      style: "normal",
    },
  ],
  variable: "--font-bricolage",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const inter = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const plexAr = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-plex-ar",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "CUP.KW — Kuwait's tumbler, built to your spec",
  description:
    "32 hours cold, 14 hours hot, and a shell that changes colour with what's inside. Thirty-six colours, three sizes, three finishes, and Pedazl crystals on anything you want. Fully recyclable. Made in Kuwait.",
  keywords: ["tumbler", "Kuwait", "CUP.KW", "CODED", "Moudhi", "recyclable", "Pedazl"],
  openGraph: {
    title: "CUP.KW — Kuwait's tumbler, built to your spec",
    description: "32 hours cold. 14 hours hot. Your colour. Fully recyclable.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${inter.variable} ${plexAr.variable} antialiased`}>
        <I18nProvider>
          <AuthProvider>
            <BuildProvider>
              <Nav />
              <main>{children}</main>
              <Footer />
            </BuildProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
