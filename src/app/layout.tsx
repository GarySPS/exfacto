// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://exfacto.online"),

  title: {
    default: "ExFacto",
    template: "%s | ExFacto",
  },

  description:
    "ExFacto is a gold and jewel promotional task simulation platform with account dashboard, campaign records, activity tracking, and customer support.",

  applicationName: "ExFacto",

  keywords: [
    "ExFacto",
    "gold campaign",
    "jewel campaign",
    "promotion dashboard",
    "task simulation",
    "activity records",
    "customer support",
  ],

  authors: [{ name: "ExFacto" }],
  creator: "ExFacto",
  publisher: "ExFacto",

  openGraph: {
    title: "ExFacto",
    description:
      "Official ExFacto member portal for campaign tasks, activity records, and customer support.",
    url: "https://exfacto.online",
    siteName: "ExFacto",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "ExFacto",
    description:
      "Official ExFacto member portal for campaign tasks, activity records, and customer support.",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },

  manifest: "/site.webmanifest",

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Adds official business structured data for Google and scanners
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ExFacto",
    url: "https://exfacto.online",
    logo: "https://exfacto.online/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@exfacto.online",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-[#f8f5ea]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}