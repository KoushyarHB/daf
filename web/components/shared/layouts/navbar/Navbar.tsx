"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useImportStatusQuery } from "@/hooks/cards";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/shared/theme/ThemeToggle";

const navLinkClass =
  "box-border block w-full cursor-pointer rounded-md border-none bg-transparent py-2 px-[0.75rem] text-left text-[0.92rem] font-semibold text-daf-nav-link no-underline transition-colors duration-150 hover:bg-daf-nav-hover-bg hover:text-daf-nav-active";

const navLinkActiveClass =
  "bg-daf-head-soft text-daf-nav-active border-l-[3px] border-l-daf-head rounded-l-none font-bold";

const authBtnBaseClass =
  "block flex-1 cursor-pointer rounded-[5px] border border-daf-border-input bg-daf-nav-btn-bg py-2 px-[0.65rem] text-center text-[0.92rem] font-semibold no-underline";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="block shrink-0"
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
  const importStatusQuery = useImportStatusQuery({
    enabled: status === "authenticated",
  });
  const showImportNav = Boolean(
    status === "authenticated" &&
      importStatusQuery.data &&
      !importStatusQuery.data.showImportOnHome,
  );
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

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
  const grammarActive = pathname.startsWith("/grammar");
  const lessonsActive = pathname.startsWith("/lesson-pages");
  const importActive = pathname.startsWith("/import-community-cards");
  const tagsActive = pathname.startsWith("/tags");
  const decksActive = pathname.startsWith("/decks");
  const adminPublishActive = pathname.startsWith("/admin/publish");
  const adminUsersActive = pathname.startsWith("/admin/users");
  const userRole = session?.user?.role;
  const isSuperAdmin = userRole === "super_admin";
  const showAuthedNav = status === "authenticated" || (status === "loading" && Boolean(session));

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[100] w-screen border-b border-daf-border bg-daf-white py-[0.85rem] shadow-nav [view-transition-name:site-header] ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]${
        menuOpen
          ? " border-b-daf-border-nav max-sm:shadow-none"
          : ""
      }`}
      role="banner"
    >
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 top-[var(--site-header-h,4.55rem)] z-[99] m-0 cursor-pointer border-0 bg-daf-nav-backdrop p-0"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      ) : null}
      <div className="mx-auto box-border flex w-full max-w-site flex-nowrap items-center justify-between gap-[1.2rem] px-4">
        <div className="flex min-w-0 max-w-[calc(100%-7rem)] flex-[0_1_auto] items-center">
          <Link
            href="/"
            className="block h-[3.25rem] w-[7.84rem] leading-none max-sm:h-[2.95rem] max-sm:w-[7.1rem]"
          >
            <Image
              className="block h-full w-full object-contain object-left max-sm:h-11 dark:hidden"
              src="/images/header-title.png"
              alt="DaF kompakt — Deutsch als Fremdsprache"
              width={309}
              height={128}
              priority
              sizes="(max-width: 640px) 125px, 155px"
            />
            <Image
              className="hidden h-full w-full object-contain object-left max-sm:h-11 dark:block"
              src="/images/header-title-dark.png"
              alt="DaF kompakt — Deutsch als Fremdsprache"
              width={309}
              height={128}
              priority
              sizes="(max-width: 640px) 125px, 155px"
            />
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-[0.4rem]">
          <ThemeToggle />
          <button
            type="button"
            className={`inline-flex h-[2.35rem] w-[5.5rem] shrink-0 cursor-pointer items-center justify-center gap-[0.35rem] rounded-[5px] border border-daf-border-input bg-daf-nav-toggle-bg font-inherit text-[0.8rem] font-semibold text-daf-nav-link transition-colors hover:border-daf-nav-toggle-border hover:bg-daf-head-soft${menuOpen ? " border-daf-nav-toggle-active-border bg-daf-head-soft" : ""}`}
            aria-expanded={menuOpen}
            aria-controls="site-nav-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
            <span className="text-[0.72rem] font-semibold tracking-wide">
              {menuOpen ? "Close" : "Menu"}
            </span>
          </button>
        </div>
      </div>
      <nav
        id="site-nav-menu"
        className={
          menuOpen
            ? "fixed top-[var(--site-header-h,4.55rem)] right-0 left-0 z-[101] block max-h-[calc(100dvh-var(--site-header-h,4.55rem))] overflow-y-auto border-b border-daf-border bg-daf-white p-0 shadow-nav-menu"
            : "hidden w-full"
        }
        aria-label="Site"
        aria-hidden={!menuOpen}
      >
        <div className="mx-auto box-border max-w-site px-4 pt-2 pb-[0.85rem]">
          <div className="flex flex-col gap-[0.1rem]">
              <Link
                className={`${navLinkClass}${vocabActive ? ` ${navLinkActiveClass}` : ""}`}
                href="/"
                onClick={() => setMenuOpen(false)}
              >
                Vocabulary
              </Link>
              <Link
                className={`${navLinkClass}${grammarActive ? ` ${navLinkActiveClass}` : ""}`}
                href="/grammar"
                onClick={() => setMenuOpen(false)}
              >
                Grammar
              </Link>
              <Link
                className={`${navLinkClass}${lessonsActive ? ` ${navLinkActiveClass}` : ""}`}
                href="/lesson-pages"
                onClick={() => setMenuOpen(false)}
              >
                Lesson Pages
              </Link>
              {showImportNav ? (
                <Link
                  className={`${navLinkClass}${importActive ? ` ${navLinkActiveClass}` : ""}`}
                  href="/import-community-cards"
                  onClick={() => setMenuOpen(false)}
                >
                  Import Cards
                </Link>
              ) : null}
              {showAuthedNav ? (
                <Link
                  className={`${navLinkClass}${decksActive ? ` ${navLinkActiveClass}` : ""}`}
                  href="/decks"
                  onClick={() => setMenuOpen(false)}
                >
                  My decks
                </Link>
              ) : null}
              {showAuthedNav ? (
                <Link
                  className={`${navLinkClass}${tagsActive ? ` ${navLinkActiveClass}` : ""}`}
                  href="/tags"
                  onClick={() => setMenuOpen(false)}
                >
                  Tags
                </Link>
              ) : null}
              {isSuperAdmin ? (
                <Link
                  className={`${navLinkClass}${adminPublishActive ? ` ${navLinkActiveClass}` : ""}`}
                  href="/admin/publish"
                  onClick={() => setMenuOpen(false)}
                >
                  Publish
                </Link>
              ) : null}
              {isSuperAdmin ? (
                <Link
                  className={`${navLinkClass}${adminUsersActive ? ` ${navLinkActiveClass}` : ""}`}
                  href="/admin/users"
                  onClick={() => setMenuOpen(false)}
                >
                  Users
                </Link>
              ) : null}
            </div>
            <div className="mt-[0.55rem] flex flex-col gap-[0.1rem] border-t border-daf-border-nav pt-[0.55rem]">
              {showAuthedNav ? (
                <>
                  <span className="mb-[0.15rem] block text-[0.72rem] tracking-wide text-daf-hint uppercase">
                    Signed in as
                  </span>
                  <span className="mb-2 block break-all text-[0.85rem] text-daf-subtle">
                    {session?.user?.email}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`${authBtnBaseClass} text-daf-body max-sm:text-daf-body max-sm:hover:text-daf-body`}
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
                <div className="flex gap-2">
                  <Link
                    className={`${authBtnBaseClass} text-daf-body max-sm:text-daf-body max-sm:hover:text-daf-body`}
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    className={`${authBtnBaseClass} border-daf-head bg-daf-head text-white max-sm:text-white max-sm:hover:text-white max-sm:focus:text-white`}
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
    </header>
  );
}
