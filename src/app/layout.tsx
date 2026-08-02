import type { Metadata, Viewport } from "next";
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
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
  openGraph: {
    title: "FusionFlow ERP",
    description: "Enterprise Fast Food Operating System for QSR & Franchise Chains",
    siteName: "FusionFlow ERP",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
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
