import type { Metadata } from "next";
import Script from "next/script";
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
  title: {
    default: "CEEprep",
    template: "%s | CEEprep",
  },
  description:
    "CEEprep is a free online platform for Nepalese CEE aspirants featuring a study timer, discussion forum, and educational updates.",
  keywords: [
    "CEE",
    "CEE Nepal",
    "Medical Entrance Nepal",
    "CEE Preparation",
    "CEEprep",
    "Study Timer",
    "Medical Entrance Exam",
    "MBBS Nepal",
  ],
  authors: [{ name: "Yujal Dhital" }],
  creator: "Yujal Dhital",
  metadataBase: new URL("https://yujal1.com.np"),
  other: {
    "google-adsense-account": "ca-pub-3889373197554287",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
