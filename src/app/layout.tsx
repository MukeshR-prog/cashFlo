import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";
import { ThemeFavicon } from "@/components/branding/ThemeFavicon";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "cashFlo - Smart Money Tracking",
    template: "%s - cashFlo",
  },
  description:
    "cashFlo gives you a clear picture of spending, income, and cash flow so you can make smarter money decisions.",
  keywords: ["expense tracker", "budget", "fintech", "spending insights", "personal finance"],
  openGraph: {
    title: "cashFlo - Smart Money Tracking",
    description: "Track, analyze, and understand your spending with cashFlo.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/dark-logo.png", media: "(prefers-color-scheme: light)" },
      { url: "/white-logo.png", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/dark-logo.png",
    apple: "/dark-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${bricolage.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeFavicon />
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
