import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DaF Web", template: "%s | DaF Web" },
  description: "Next.js app with Prisma + SQLite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
