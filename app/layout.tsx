import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { AnalysisProvider } from "@/lib/contexts/analysis-context";
import Header from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spotonaut - Poradíme, kde (ne)podnikat.",
  description: "Poradíme, kde (ne)podnikat.",
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
    <html lang="en">
      <head>
        <meta name="theme-color" content="#A43BFE" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AnalysisProvider>
            <Header />
            {children}
          </AnalysisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
