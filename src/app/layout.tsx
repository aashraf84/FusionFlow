import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FusionFlow ERP — Enterprise Fast Food Operating System",
  description:
    "FusionFlow ERP: the enterprise operating system for pizza brands, burger chains, fried chicken, cafés, cloud kitchens and franchises. POS, KDS, delivery, inventory, CRM, finance, HR, RBAC & AI insights in one unified platform.",
  keywords: [
    "FusionFlow",
    "Restaurant ERP",
    "POS",
    "KDS",
    "Franchise Management",
    "Cloud Kitchen",
    "QSR",
    "RBAC",
    "Next.js",
  ],
  authors: [{ name: "FusionFlow Systems" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "FusionFlow ERP",
    description: "Enterprise Fast Food Operating System for QSR & Franchise Chains",
    siteName: "FusionFlow ERP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Sonner position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
