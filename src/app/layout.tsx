import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visite Sri3a - Réservation de Visite Technique Automobile au Maroc",
  description: "Plateforme officielle pour réserver votre visite technique automobile au Maroc. Service rapide, paiement sécurisé CMI, centres agréés partout au royaume. Évitez les files d'attente !",
  keywords: "visite technique, automobile, Maroc, réservation, contrôle technique, voiture, CMI, paiement, centres agréés, Sri3a",
  authors: [{ name: "Visite Sri3a" }],
  creator: "Visite Sri3a",
  publisher: "Visite Sri3a",
  applicationName: "Visite Sri3a",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "Automotive Services",
  classification: "Business",
  openGraph: {
    type: "website",
    locale: "fr_MA",
    alternateLocale: ["ar_MA", "en_US"],
    url: "https://visite-sri3a.ma",
    siteName: "Visite Sri3a",
    title: "Visite Sri3a - Réservation de Visite Technique Automobile au Maroc",
    description: "Réservez votre visite technique automobile en ligne au Maroc. Service officiel, rapide et sécurisé.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Visite Sri3a - Service de visite technique automobile au Maroc",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@VisiteSri3a",
    creator: "@VisiteSri3a",
    title: "Visite Sri3a - Réservation Visite Technique Auto Maroc",
    description: "Réservez votre visite technique automobile en ligne. Service rapide et sécurisé au Maroc.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "your-google-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
