import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Adventure - Learn Math with Fun",
  description: "An interactive math learning game with Hebrew voice support to help children improve their math skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
