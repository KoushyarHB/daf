import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "daf — vocabulary", template: "%s | DaF" },
  description: "DaF kompakt vocabulary preview",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
