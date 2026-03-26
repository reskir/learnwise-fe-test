import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ColorSchemeScript } from "@mantine/core";
import { Providers } from "@/lib/providers/Providers";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AppLayout } from "@/app/components/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnWise Quiz Generator",
  description: "Generate quiz questions with AI",
};

export const viewport: Viewport = {
  initialScale: 1,
  userScalable: false,
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
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
