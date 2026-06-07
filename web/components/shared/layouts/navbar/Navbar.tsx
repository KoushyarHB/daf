"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const update = () => {
      document.documentElement.style.setProperty(
        "--site-header-h",
        `${header.offsetHeight}px`,
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const vocabActive = pathname === "/";
  const lessonsActive = pathname.startsWith("/lesson-pages");

  return (
    <header ref={headerRef} className="site-header" role="banner">
      <div className="site-header-row">
        <div className="site-brand">
          <Link href="/">
            <Image
              src="/images/header-title.png"
              alt="DaF kompakt — Deutsch als Fremdsprache"
              width={420}
              height={52}
              priority
            />
          </Link>
        </div>
        <nav className="site-nav" aria-label="Preview pages">
          <Link className={vocabActive ? "is-active" : ""} href="/">
            Vocabulary
          </Link>
          <Link
            className={lessonsActive ? "is-active" : ""}
            href="/lesson-pages"
          >
            Lesson Pages
          </Link>
        </nav>
      </div>
    </header>
  );
}
