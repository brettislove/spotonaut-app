import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { AnalysisProvider } from "@/lib/contexts/analysis-context";
import Header from "@/components/layout/header";
import PageTracker from "@/components/page-tracker";
import { HeroHeader } from "@/components/header";
import FooterSection from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Spotonaut - Poradíme, kde (ne)podnikat.",
  description: "Váš parťák pro objevování ziskových lokalit. Data místo dojmů.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/spotonaut_logo-112.png", sizes: "112x112", type: "image/png" },
      { url: "/spotonaut_logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/spotonaut_logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon-180.png",
  },
  openGraph: {
    title: "Spotonaut - AI navigace pro Vaše podnikání",
    description:
      "Váš parťák pro objevování ziskových lokalit. Data místo dojmů.",
    url: "https://www.spotonaut.com",
    siteName: "Spotonaut",
    images: [
      {
        url: "https://www.spotonaut.com/spotonaut_logo.png",
        width: 512,
        height: 512,
        alt: "Spotonaut Logo",
      },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Spotonaut - AI navigace pro Vaše podnikání",
    description:
      "Váš parťák pro objevování ziskových lokalit. Data místo dojmů.",
    images: ["https://www.spotonaut.com/spotonaut_logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#A43BFE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="icon" sizes="48x48" href="/favicon.png" type="image/png" />
        <link
          rel="icon"
          sizes="112x112"
          href="/favicon-112.png"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="192x192"
          href="/favicon-192.png"
          type="image/png"
        />
        <link
          rel="icon"
          sizes="512x512"
          href="/favicon-512.png"
          type="image/png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon-180.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/apple-touch-icon-167.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-touch-icon-152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-touch-icon-120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-touch-icon-76.png"
        />
        <link rel="mask-icon" href="/spotonaut_mask.svg" color="#A43BFE" />
        <meta
          name="msapplication-TileImage"
          content="/spotonaut_logo-192.png"
        />
        {/* Basic theme color (Chrome/Android) */}
        <meta name="theme-color" content="#A43BFE" />

        {/* Optional: different colors for light/dark */}
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#A43BFE"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0f172a"
        />

        {/* iOS / PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Link manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Pinned tab for macOS Safari (monochrome mask SVG required) */}
        <link rel="mask-icon" href="/spotonaut_mask.svg" color="#A43BFE" />
        <meta name="msapplication-TileColor" content="#A43BFE" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              url: "https://www.spotonaut.com",
              name: "Spotonaut",
              logo: {
                "@type": "ImageObject",
                url: "https://www.spotonaut.com/spotonaut_logo.png",
                width: 512,
                height: 512,
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <AuthProvider>
          <AnalysisProvider>
            <Suspense fallback={null}>
              <PageTracker />
            </Suspense>
            {/* <Header /> */}
            <HeroHeader />
            {children}
            <FooterSection />
          </AnalysisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
