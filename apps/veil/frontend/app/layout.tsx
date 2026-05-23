import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VEIL | Trust, before settlement.",
  description: "AI-native financial governance infrastructure and autonomous trust layer for global finance."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
