import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provide";
import { Providers } from "@/components/Providers";
import { Navbar, MobileNavbar } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tune : Your Music Buddy",
  description: "Listen to your favorite music",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="bg-background relative min-h-screen container mx-auto px-4 lg:px-6">
              <Navbar />
              <main className="pb-20 lg:pb-24">{children}</main>
              <MobileNavbar />
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
