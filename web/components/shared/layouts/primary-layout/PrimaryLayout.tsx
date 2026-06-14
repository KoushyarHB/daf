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
        <div className="site-shell">
          <Navbar />
          <main style={{ viewTransitionName: "main-content" }} className="site-main">
            {children}
          </main>
          <footer className="site-footer">daf · Deutsch vocabulary</footer>
        </div>
      </LightboxProvider>
    </ToastProvider>
  );
}
