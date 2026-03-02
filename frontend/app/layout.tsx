import type { Metadata } from "next";
import { Geist, Geist_Mono, Urbanist, Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

// const spacegrotesk = Space_Grotesk({
//   variable: "--font-space-grotesk",
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"]
// });

// const dmsans = DM_Sans({
//   variable: "--font-space-grotesk",
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"]
// });


export const metadata: Metadata = {
  title: "Vaidya.ai",
  description: "Vaidya.ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${urbanist.variable} ${urbanist.className} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
