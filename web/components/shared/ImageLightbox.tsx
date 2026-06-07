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
    document.body.classList.add("lightbox-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [state, closeLightbox]);

  return (
    <LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}
      <div
        id="image-lightbox"
        className={`image-lightbox${state ? " is-open" : ""}`}
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
          className="image-lightbox-close"
          aria-label="Close preview"
          onClick={closeLightbox}
        >
          &times;
        </button>
        {state ? (
          <Image
            className="image-lightbox-img"
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
