import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ModalProvider } from "@/components/providers/modal-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Treclone",
  description: "Manage your tasks efficiently.",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            themes={["light", "dark"]}
            disableTransitionOnChange
          >
            {/* Global UI Overlays */}
            <Toaster position="bottom-right" />
            <ModalProvider />
            
            {/* Main Application */}
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}