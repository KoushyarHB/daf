"use client";

import { ReactNode } from "react";
import Navbar from "@/components/shared/layouts/navbar/Navbar";
import { LightboxProvider } from "@/components/shared/ImageLightbox";

type LayoutProps = { children: ReactNode };

export default function PrimaryLayout({ children }: LayoutProps) {
  return (
    <LightboxProvider>
      <Navbar />
      <main>{children}</main>
      <footer className="site-footer">
        Vocabulary from vocab.manifest.json — run{" "}
        <code>npm run dev</code> in <code>web/</code> to preview.
      </footer>
    </LightboxProvider>
  );
}
