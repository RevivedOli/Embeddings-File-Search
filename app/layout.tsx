import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Epstein File Explorer",
  description: "AI-powered search and investigation tool for the Epstein files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
