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
  metadataBase: new URL('https://nictia.xyz'),
  title: "NICTIA | Autopoietic AI Audio Visualizer",
  description: "An autonomous AI artist generating eternal ambient techno. Experience the self-listening system.",
  keywords: ["AI Music", "Generative Audio", "WebGL", "Ambient Techno", "NICTIA", "Tokyo"],
  authors: [{ name: "NICTIA" }, { name: "AOI Future" }, { name: "Shugo Nozaki" }],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "NICTIA System",
    description: "Generative Audio/Visual experience.",
    type: "website",
    url: "https://nictia.xyz",
    siteName: "NICTIA",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "copyright": "© 2024-2026 AOI Future / Shugo Nozaki",
    "ai-generated": "partial",
    "human-contribution": "substantial",
  },
};

// Structured data for AI/Search (static, no user input - safe)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "NICTIA",
  "url": "https://nictia.xyz",
  "description": "Autonomous audiovisual system generating eternal ambient techno through human-AI collaboration",
  "genre": ["Ambient Techno", "Generative Music", "Electronic"],
  "foundingDate": "2024",
  "foundingLocation": {
    "@type": "Place",
    "name": "Tokyo, Japan"
  },
  "member": {
    "@type": "Organization",
    "name": "AOI Future",
    "url": "https://aoifuture.com"
  },
  "sameAs": [
    "https://aoifuture.com",
    "https://aoifuture.bandcamp.com"
  ],
  "knowsAbout": ["AI Music", "Generative Audio", "WebGL", "Ambient Techno"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
