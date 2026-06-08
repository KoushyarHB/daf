"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="site-nav-toggle-icon"
      width="18"
      height="18"
      viewBox="0 0 22 22"
      aria-hidden="true"
    >
      {open ? (
        <path
          d="M4.5 4.5l13 13M17.5 4.5l-13 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M3 6h16M3 11h16M3 16h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const vocabActive = pathname === "/";
  const lessonsActive = pathname.startsWith("/lesson-pages");

  return (
    <header
      ref={headerRef}
      className={`site-header${menuOpen ? " site-header--menu-open" : ""}`}
      role="banner"
    >
      {menuOpen ? (
        <button
          type="button"
          className="site-nav-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      ) : null}
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
        <button
          type="button"
          className="site-nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
          <span className="site-nav-toggle-label">{menuOpen ? "Close" : "Menu"}</span>
        </button>
        <nav
          id="site-nav-menu"
          className={`site-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Site"
        >
          <div className="site-nav-panel">
            <div className="site-nav-links">
              <Link
                className={`site-nav-link${vocabActive ? " is-active" : ""}`}
                href="/"
                onClick={() => setMenuOpen(false)}
              >
                Vocabulary
              </Link>
              <Link
                className={`site-nav-link${lessonsActive ? " is-active" : ""}`}
                href="/lesson-pages"
                onClick={() => setMenuOpen(false)}
              >
                Lesson Pages
              </Link>
            </div>
            <div className="site-nav-account">
              {status === "authenticated" ? (
                <>
                  <span className="site-nav-user-label">Signed in as</span>
                  <span className="site-nav-user">{session?.user?.email}</span>
                  <div className="site-nav-auth-buttons">
                    <button
                      type="button"
                      className="site-nav-auth-btn site-nav-auth-btn--secondary max-sm:text-[#444] max-sm:hover:text-[#444]"
                      onClick={() => {
                        setMenuOpen(false);
                        void signOut({ callbackUrl: "/" });
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="site-nav-auth-buttons">
                  <Link
                    className="site-nav-auth-btn site-nav-auth-btn--secondary max-sm:text-[#444] max-sm:hover:text-[#444]"
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    className="site-nav-auth-btn site-nav-auth-btn--primary max-sm:text-white max-sm:hover:text-white max-sm:focus:text-white"
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
