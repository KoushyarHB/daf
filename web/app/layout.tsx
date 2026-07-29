import type { Metadata } from "next";

import QueryProvider from "@/providers/QueryProvider";
import SessionProvider from "@/providers/SessionProvider";
import { ThemeProvider } from "@/components/shared/theme";
import { ThemeScript } from "@/components/shared/theme";

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
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans text-[11pt] leading-[1.45] max-w-site mx-auto px-4 text-daf-ink bg-daf-surface min-h-dvh">
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider>{children}</SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
