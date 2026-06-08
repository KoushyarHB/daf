"use client";

import { ReactNode } from "react";
import Navbar from "@/components/shared/layouts/navbar/Navbar";
import { LightboxProvider } from "@/components/shared/ImageLightbox";
import { ToastProvider } from "@/components/shared/toast/ToastProvider";

type LayoutProps = { children: ReactNode };

export default function PrimaryLayout({ children }: LayoutProps) {
  return (
    <ToastProvider>
      <LightboxProvider>
        <Navbar />
        <main>{children}</main>
        <footer className="site-footer">DaF kompakt vocabulary deck.</footer>
      </LightboxProvider>
    </ToastProvider>
  );
}
