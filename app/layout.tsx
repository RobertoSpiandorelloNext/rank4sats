import type { Metadata } from "next";
import Script from 'next/script';
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Rank4Sats",
  description: "Give rewards while boosting your website visibility.",
  openGraph: {
    title: "Rank4Sats",
    description: "Boost your website visibility and earn rewards in Bitcoin, USDT, and Monero!",
    url: "https://www.rank4sats.com",
    siteName: "Rank4Sats",
    images: [
      {
        url: "https://www.rank4sats.com/images/rank4sats.jpg", 
        width: 800,
        height: 600,
        alt: "Rank4Sats Logo",
      },
    ],
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://js.tryspeed.com"
          strategy="beforeInteractive"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
