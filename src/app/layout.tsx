import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "E-resources Scraper",
  description: "Created by king'sTech",
  generator: "kingTech",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-gray-50 dark:bg-slate-950`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutClient>{children}</LayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
