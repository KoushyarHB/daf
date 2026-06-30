import type { Metadata } from "next";

import QueryProvider from "@/components/providers/QueryProvider";
import SessionProvider from "@/components/providers/SessionProvider";

import "@/app/tailwind.css";

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
    <html lang="de" className="h-full antialiased [scrollbar-gutter:stable]">
      <body className="font-sans text-[11pt] leading-[1.45] max-w-site mx-auto px-4 text-daf-ink bg-daf-surface min-h-dvh">
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
