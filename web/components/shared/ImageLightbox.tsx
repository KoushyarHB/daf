"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type LightboxState = {
  src: string;
  alt: string;
} | null;

type LightboxContextValue = {
  openLightbox: (src: string, alt: string) => void;
  closeLightbox: () => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox must be used within LightboxProvider");
  }
  return ctx;
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState>(null);

  const openLightbox = useCallback((src: string, alt: string) => {
    setState({ src, alt });
  }, []);

  const closeLightbox = useCallback(() => {
    setState(null);
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [state, closeLightbox]);

  return (
    <LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}
      <div
        id="image-lightbox"
        className={
          state
            ? "fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/88 cursor-zoom-out"
            : "fixed inset-0 z-[1000] hidden items-center justify-center p-5 bg-black/88 cursor-zoom-out"
        }
        aria-hidden={state ? "false" : "true"}
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
      >
        <button
          type="button"
          className="absolute top-3 right-[0.85rem] w-9 h-9 border-none rounded bg-daf-white/12 text-white text-[1.45rem] leading-none cursor-pointer hover:bg-daf-white/22"
          aria-label="Close preview"
          onClick={closeLightbox}
        >
          &times;
        </button>
        {state ? (
          <Image
            className="block rounded shadow-lightbox cursor-default"
            src={state.src}
            alt={state.alt}
            width={1600}
            height={1200}
            sizes="(max-width: 72rem) 100vw, 72rem"
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "min(100%, 72rem)",
              maxHeight: "calc(100vh - 2.5rem)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
      </div>
    </LightboxContext.Provider>
  );
}
