import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";
import AppShell from "../components/Layout/AppShell";

export const metadata: Metadata = {
  title: "LayeredDining",
  description: "Experience the art of layers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
