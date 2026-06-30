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
        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <main
            style={{ viewTransitionName: "main-content" }}
            className="mt-5 flex-[1_0_auto]"
          >
            {children}
          </main>
          <footer className="mt-auto shrink-0 border-t border-[#ececec] py-6 pb-4 text-xs text-[#999]">
            daf · Deutsch vocabulary
          </footer>
        </div>
      </LightboxProvider>
    </ToastProvider>
  );
}
