"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import type { PaginatedResponse } from "@/lib/api/types";

export type TagOption = { slug: string; label: string };

type TagMultiSelectProps = {
  value: string[];
  onChange: (slugs: string[]) => void;
  knownTags?: TagOption[];
  pageSize?: number;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
};

const DEFAULT_PAGE_SIZE = 5;

function mergeOptions(
  selected: TagOption[],
  fetched: TagOption[],
): TagOption[] {
  const selectedSlugs = new Set(selected.map((t) => t.slug));
  const uniqueFetched = fetched.filter((t) => !selectedSlugs.has(t.slug));
  return [...selected, ...uniqueFetched];
}

function buildLabelMap(
  knownTags: TagOption[],
  options: TagOption[],
): Map<string, string> {
  const m = new Map<string, string>();
  for (const t of knownTags) m.set(t.slug, t.label);
  for (const t of options) m.set(t.slug, t.label);
  return m;
}

export default function TagMultiSelect({
  value,
  onChange,
  knownTags = [],
  pageSize = DEFAULT_PAGE_SIZE,
  disabled = false,
  placeholder = "Select tags…",
  searchPlaceholder = "Search tags…",
  noResultsText = "No tags found",
}: TagMultiSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const fetchInitialRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<TagOption[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const menuOpen = isOpen && !disabled;
  const labelBySlug = useMemo(
    () => buildLabelMap(knownTags, options),
    [knownTags, options],
  );

  const selectedOptions: TagOption[] = value.map((slug) => ({
    slug,
    label: labelBySlug.get(slug) ?? slug,
  }));

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    fetchInitialRef.current = false;
  }, []);

  const fetchTags = useCallback(
    async (pageNum: number, query: string): Promise<TagOption[]> => {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: String(pageSize),
      });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/tags?${params}`);
      if (!res.ok) return [];
      const data = (await res.json()) as PaginatedResponse<TagOption>;
      return data.items;
    },
    [pageSize],
  );

  const loadFirstPage = useCallback(
    async (query: string) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsLoading(true);
      try {
        const data = await fetchTags(1, query);
        const selected = value.map((slug) => ({
          slug,
          label: labelBySlug.get(slug) ?? slug,
        }));
        setOptions(mergeOptions(selected, data));
        setPage(1);
        setHasMore(data.length === pageSize);
      } finally {
        fetchingRef.current = false;
        setIsLoading(false);
      }
    },
    [fetchTags, pageSize, value, labelBySlug],
  );

  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchInitialRef.current = true;
        void loadFirstPage(query);
      }, 300);
    },
    [loadFirstPage],
  );

  useEffect(() => {
    if (!menuOpen || fetchInitialRef.current || searchQuery !== "") return;
    fetchInitialRef.current = true;
    void loadFirstPage("");
  }, [menuOpen, searchQuery, loadFirstPage]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (ev: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(ev.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen, closeMenu]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSelect = (option: TagOption) => {
    if (disabled) return;
    const isSelected = value.includes(option.slug);
    const next = isSelected
      ? value.filter((s) => s !== option.slug)
      : [...value, option.slug];
    onChange(next);
  };

  const handleRemove = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(value.filter((s) => s !== slug));
  };

  const handleScroll = useCallback(() => {
    const container = optionsContainerRef.current;
    if (
      !container ||
      isLoading ||
      !hasMore ||
      container.scrollTop + container.clientHeight <
        container.scrollHeight - 20
    ) {
      return;
    }

    const loadMore = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsLoading(true);
      try {
        const data = await fetchTags(page + 1, searchQuery);
        setOptions((prev) => {
          const existing = new Set(prev.map((t) => t.slug));
          const append = data.filter((t) => !existing.has(t.slug));
          return [...prev, ...append];
        });
        setPage((p) => p + 1);
        setHasMore(data.length === pageSize);
      } finally {
        fetchingRef.current = false;
        setIsLoading(false);
      }
    };
    void loadMore();
  }, [fetchTags, hasMore, isLoading, page, pageSize, searchQuery]);

  const toggleOpen = () => {
    if (disabled) return;
    if (isOpen) {
      closeMenu();
      return;
    }
    setIsOpen(true);
  };

  return (
    <div
      ref={containerRef}
      className={`tag-ms${disabled ? " tag-ms--disabled" : ""}${menuOpen ? " tag-ms--open" : ""}`}
    >
      <div
        className="tag-ms__trigger"
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleOpen();
          }
        }}
        role="combobox"
        aria-expanded={menuOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
      >
        <span className="tag-ms__chips-scroll">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span key={option.slug} className="tag-ms__chip">
                <span className="tag-ms__chip-label">{option.label}</span>
                <button
                  type="button"
                  className="tag-ms__chip-remove"
                  onClick={(e) => handleRemove(option.slug, e)}
                  aria-label={`Remove ${option.label}`}
                >
                  <XMarkIcon className="tag-ms__chip-remove-icon" />
                </button>
              </span>
            ))
          ) : (
            <span className="tag-ms__placeholder">{placeholder}</span>
          )}
        </span>
        <ChevronDownIcon
          className={`tag-ms__chevron${menuOpen ? " is-open" : ""}`}
          aria-hidden="true"
        />
      </div>

      {menuOpen ? (
        <div
          id={listboxId}
          className="tag-ms__dropdown"
          role="listbox"
          aria-multiselectable="true"
        >
          <div className="tag-ms__search-wrap">
            <MagnifyingGlassIcon
              className="tag-ms__search-icon"
              aria-hidden="true"
            />
            <input
              type="text"
              className="tag-ms__search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoComplete="off"
              autoFocus
            />
          </div>
          <div
            ref={optionsContainerRef}
            className="tag-ms__options"
            onScroll={handleScroll}
          >
            {options.length > 0 ? (
              options.map((option) => {
                const selected = value.includes(option.slug);
                return (
                  <button
                    key={option.slug}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`tag-ms__option${selected ? " is-selected" : ""}`}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="tag-ms__option-label">{option.label}</span>
                    <span
                      className={`tag-ms__check${selected ? " is-checked" : ""}`}
                      aria-hidden="true"
                    >
                      {selected ? (
                        <CheckIcon className="tag-ms__check-icon" />
                      ) : null}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="tag-ms__empty">
                {isLoading ? "Loading…" : noResultsText}
              </p>
            )}
            {isLoading && options.length > 0 ? (
              <p className="tag-ms__loader">Loading…</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
