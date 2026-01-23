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
  authors: [{ name: "NICTIA" }],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
