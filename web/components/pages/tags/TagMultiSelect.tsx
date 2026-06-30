"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { fetchTags as fetchTagsApi, type TagOption } from "@/services/frontend/tags.client";
import { tagKeys } from "@/hooks/query-keys";
import { buildLabelMap } from "@/utils/buildLabelMap";
import { mergeOptions } from "@/utils/mergeOptions";

export type { TagOption };

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
  const queryClient = useQueryClient();
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

  const loadTagPage = useCallback(
    async (pageNum: number, query: string): Promise<TagOption[]> => {
      const params: Record<string, string> = {
        page: String(pageNum),
        pageSize: String(pageSize),
      };
      if (query.trim()) params.q = query.trim();
      const data = await queryClient.fetchQuery({
        queryKey: tagKeys.list(params),
        queryFn: ({ signal }) => fetchTagsApi(params, signal),
        staleTime: 60_000,
      });
      return data.items;
    },
    [pageSize, queryClient],
  );

  const loadFirstPage = useCallback(
    async (query: string) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsLoading(true);
      try {
        const data = await loadTagPage(1, query);
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
    [loadTagPage, pageSize, value, labelBySlug],
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
        const data = await loadTagPage(page + 1, searchQuery);
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
  }, [loadTagPage, hasMore, isLoading, page, pageSize, searchQuery]);

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
      className={`relative w-full${disabled ? " pointer-events-none opacity-60" : ""}${menuOpen ? " z-5" : ""}`}
    >
      <div
        className={`flex min-h-8 cursor-pointer items-center justify-between gap-[0.35rem] rounded border bg-daf-white px-2 py-1 text-[0.8rem] text-daf-body shadow-chip hover:border-daf-hint focus-visible:outline-2 focus-visible:outline-offset-px focus-visible:outline-daf-head ${
          menuOpen
            ? "rounded-b-none border-daf-head hover:border-daf-head"
            : "border-daf-border-control"
        }`}
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
        <span className="flex flex-1 items-center gap-[0.35rem] overflow-x-auto overflow-y-hidden whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={option.slug}
                className="inline-flex shrink-0 items-center gap-[0.2rem] rounded bg-daf-panel-alt py-px pr-1 pl-[0.4rem]"
              >
                <span className="text-[0.75rem] text-daf-label">{option.label}</span>
                <button
                  type="button"
                  className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-daf-hint hover:text-daf-muted"
                  onClick={(e) => handleRemove(option.slug, e)}
                  aria-label={`Remove ${option.label}`}
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-[0.8rem] text-daf-hint">{placeholder}</span>
          )}
        </span>
        <ChevronDownIcon
          className={`h-[0.9rem] w-[0.9rem] shrink-0 text-daf-subtle transition-transform duration-150${menuOpen ? " rotate-180" : ""}`}
          aria-hidden="true"
        />
      </div>

      {menuOpen ? (
        <div
          id={listboxId}
          className="absolute top-full right-0 left-0 z-30 box-border overflow-hidden rounded-b border border-t-0 border-daf-head bg-daf-white shadow-dropdown"
          role="listbox"
          aria-multiselectable="true"
        >
          <div className="flex items-center gap-[0.3rem] border-b border-daf-border-nav bg-daf-panel-soft px-[0.45rem] py-[0.2rem]">
            <MagnifyingGlassIcon
              className="h-[0.7rem] w-[0.7rem] shrink-0 text-daf-icon-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              className="h-5 min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[0.72rem] leading-5 text-daf-muted shadow-none outline-none focus:border-0 focus:shadow-none focus:outline-none placeholder:text-daf-placeholder"
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
            className="max-h-48 overflow-y-auto"
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
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 border-0 px-3 py-2 text-left text-[0.8rem] hover:bg-daf-panel-soft${selected ? " bg-daf-head-softer" : " bg-daf-white"}`}
                    onClick={() => handleSelect(option)}
                  >
                    <span
                      className={`text-daf-label${selected ? " font-semibold text-daf-head" : ""}`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border${selected ? " border-daf-head bg-daf-head text-white" : " border-daf-border-control bg-daf-white"}`}
                      aria-hidden="true"
                    >
                      {selected ? (
                        <CheckIcon className="h-2.5 w-2.5" />
                      ) : null}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="m-0 px-3 py-3 text-[0.8rem] text-daf-subtle">
                {isLoading ? "Loading…" : noResultsText}
              </p>
            )}
            {isLoading && options.length > 0 ? (
              <p className="m-0 px-3 py-2 text-center text-[0.75rem] text-daf-subtle">
                Loading…
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
