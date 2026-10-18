"use client";

import { useCallback, useEffect, useState, useTransition, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { productsHref } from "@/lib/product-query";
import { taka } from "@/lib/utils";
import type { ProductListResult } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export type ProductBrowserResult = Omit<ProductListResult, "items">;

const SKELETON_COUNT = 8;
const DEBOUNCE_MS = 350;

const SORT_LABELS: Record<string, string> = {
  featured: "Sort by: Featured",
  "price-low": "Price: low to high",
  "price-high": "Price: high to low",
  rating: "Top rated",
};

const RATING_LABELS: Record<string, string> = {
  any: "Any rating",
  "4": "4+ stars",
  "4.5": "4.5+ stars",
};

const TEXT_KEYS = ["search", "minPrice", "maxPrice"] as const;
type TextKey = (typeof TEXT_KEYS)[number];
type Drafts = Record<TextKey, string>;

const PRICE_PATTERN = /^\d+(\.\d+)?$/;
const isValidPrice = (value: string) => value === "" || PRICE_PATTERN.test(value.trim());

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-[repeat(4,1fr)] gap-4.5 max-[1081px]:grid-cols-3 max-[601px]:grid-cols-2 max-[601px]:gap-3" aria-hidden="true">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <Skeleton
          className="aspect-square animate-[shine_1.2s_infinite] bg-transparent bg-[linear-gradient(90deg,#e2e8f0,#f8fafc,#e2e8f0)] bg-size-[200%]"
          key={i}
        />
      ))}
    </div>
  );
}

function paginationItems(current: number, total: number) {
  const pages: (number | "gap")[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) pages.push("gap");
  for (let page = from; page <= to; page += 1) pages.push(page);
  if (to < total - 1) pages.push("gap");
  if (total > 1) pages.push(total);
  return pages;
}

const readDrafts = (params: URLSearchParams): Drafts => ({
  search: params.get("search") ?? "",
  minPrice: params.get("minPrice") ?? "",
  maxPrice: params.get("maxPrice") ?? "",
});

const keyOf = (drafts: Drafts) => TEXT_KEYS.map((key) => drafts[key]).join("\u0000");

/** Invalid price drafts are not pushed; the URL keeps its current value for that field. */
function committable(drafts: Drafts, url: Drafts): Drafts {
  return {
    search: drafts.search,
    minPrice: isValidPrice(drafts.minPrice) ? drafts.minPrice.trim() : url.minPrice,
    maxPrice: isValidPrice(drafts.maxPrice) ? drafts.maxPrice.trim() : url.maxPrice,
  };
}

/**
 * Local drafts for the free-text filters, committed to the URL together after a pause.
 * Committing all three at once means quick edits to search, min and max can't overwrite
 * each other from a stale URL snapshot. Drafts re-sync from the URL only when it changes
 * from outside this hook (back/forward, header search, "Clear").
 */
function useDebouncedFilters(commit: (changes: Drafts) => void) {
  const searchParams = useSearchParams();
  const urlDrafts = readDrafts(searchParams);
  const urlKey = keyOf(urlDrafts);

  const [drafts, setDrafts] = useState(urlDrafts);
  const [seenUrlKey, setSeenUrlKey] = useState(urlKey);
  const [committedKey, setCommittedKey] = useState<string | null>(null);

  if (urlKey !== seenUrlKey) {
    setSeenUrlKey(urlKey);
    if (urlKey !== committedKey) {
      setDrafts(urlDrafts);
      setCommittedKey(null);
    }
  }

  const next = committable(drafts, urlDrafts);
  const nextKey = keyOf(next);

  useEffect(() => {
    if (nextKey === urlKey || nextKey === committedKey) return;
    const timer = setTimeout(() => {
      setCommittedKey(nextKey);
      commit(next);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `next` is fully described by nextKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextKey, urlKey, committedKey, commit]);

  const setDraft = useCallback((key: TextKey, value: string) => {
    setDrafts((current) => ({ ...current, [key]: value }));
  }, []);

  return [drafts, setDraft, next] as const;
}

const isModifiedClick = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

export function ProductBrowser({
  result,
  children,
}: {
  result: ProductBrowserResult;
  /** Server-rendered results (grid or empty state) for the current URL. */
  children: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const go = useCallback(
    (href: string, mode: "push" | "replace" = "push") => {
      startTransition(() => {
        router[mode](href, { scroll: false });
      });
    },
    [router],
  );

  // Text filters replace history entries so typing doesn't create one entry per pause.
  const commitText = useCallback(
    (values: Drafts) => go(productsHref(searchParams, { ...values, page: null }), "replace"),
    [go, searchParams],
  );
  const [drafts, setDraft, pendingText] = useDebouncedFilters(commitText);

  // Carry pending text drafts so a select change can't drop a not-yet-committed search.
  const setFilter = (key: string, value: string) =>
    go(productsHref(searchParams, { ...pendingText, [key]: value, page: null }));
  const pageHref = (page: number) => productsHref(searchParams, { page: page > 1 ? String(page) : null });
  const onPageClick = (event: MouseEvent<HTMLAnchorElement>, page: number) => {
    if (isModifiedClick(event)) return;
    event.preventDefault();
    startTransition(() => router.push(pageHref(page)));
  };

  const sort = result.query.sort;
  const category = result.query.category ?? "all";
  const rating = searchParams.get("rating") ?? "";
  const ratingValue = rating in RATING_LABELS ? rating : "any";
  const pages = paginationItems(result.page, result.totalPages);
  const { minPrice, maxPrice } = result.query;
  const rawMin = Number(searchParams.get("minPrice"));
  const rawMax = Number(searchParams.get("maxPrice"));
  const swapped = minPrice !== undefined && maxPrice !== undefined && rawMin > rawMax;
  const hasFilters = searchParams.toString() !== "";

  return (
    <main className="mx-auto my-17.5 w-[calc(100%-32px)] max-w-317.5">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <div className="mb-8.75 flex items-end justify-between">
        <div>
          <h1 className="text-[clamp(45px,5vw,74px)] leading-[1.04] tracking-[-3px] max-[601px]:tracking-[-1.5px]">
            Find your <em className="font-normal text-(--teal)">everyday</em>
          </h1>
        </div>
      </div>

      <div className="mb-6.5 flex justify-between border-y border-(--line) py-3 max-[601px]:flex-col max-[601px]:gap-2.5">
        <div className="flex h-10 w-90 items-center gap-2 rounded-md border border-(--line) bg-white px-3 max-[601px]:w-full">
          <Search size={18} className="shrink-0 text-(--muted)" aria-hidden="true" />
          <Input
            type="search"
            className="h-9 min-w-0 border-0 bg-transparent px-0 shadow-none focus:border-transparent focus:ring-0"
            value={drafts.search}
            onChange={(e) => setDraft("search", e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            maxLength={100}
          />
        </div>
        <Select value={sort} onValueChange={(value) => setFilter("sort", value === "featured" ? "" : value)}>
          <SelectTrigger aria-label="Sort products">
            <SelectValue>{SORT_LABELS[sort]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[190px_1fr] gap-8.75 max-[901px]:grid-cols-1 max-[901px]:gap-5">
        <aside
          className="h-max rounded-[5px] bg-white p-4.5 max-[901px]:grid max-[901px]:grid-cols-2 max-[901px]:gap-x-4"
          aria-label="Product filters"
        >
          <div className="flex justify-between border-b border-(--line) pb-3.5 text-[13px] max-[901px]:col-span-full">
            <b className="flex items-center gap-1.5">
              <SlidersHorizontal size={16} aria-hidden="true" /> Filters
            </b>
            <Button className="text-[11px]" type="button" variant="link" onClick={() => go("/products")} disabled={!hasFilters}>
              Clear
            </Button>
          </div>
          <label className="mt-5.5 block text-[12px] text-[#475569]">
            Category
            <Select value={category} onValueChange={(value) => setFilter("category", value === "all" ? "" : value)}>
              <SelectTrigger className="mt-1.75">
                <SelectValue>{category === "all" ? "All categories" : category}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {result.categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <PriceInput
            label="Minimum price"
            id="min-price"
            value={drafts.minPrice}
            onChange={(value) => setDraft("minPrice", value)}
            placeholder="৳0"
          />
          <PriceInput
            label="Maximum price"
            id="max-price"
            value={drafts.maxPrice}
            onChange={(value) => setDraft("maxPrice", value)}
            placeholder="৳100000"
          />
          {swapped && (
            <p className="mt-2 text-xs leading-5 text-amber-700 max-[901px]:col-span-full" role="status">
              Minimum was above maximum, so showing {taka(minPrice)}–{taka(maxPrice)}.
            </p>
          )}
          <label className="mt-5.5 block text-[12px] text-[#475569]">
            Rating
            <Select value={ratingValue} onValueChange={(value) => setFilter("rating", value === "any" ? "" : value)}>
              <SelectTrigger className="mt-1.75">
                <SelectValue>{RATING_LABELS[ratingValue]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RATING_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </aside>

        <section className="results" aria-label="Products" aria-busy={isPending}>
          <div className="mb-3.75 flex justify-between text-[13px] text-(--muted)" role="status">
            <span>
              {result.total} {result.total === 1 ? "product" : "products"}
            </span>
            {result.total > 0 && (
              <span>
                Page {result.page} of {result.totalPages}
              </span>
            )}
          </div>

          {isPending ? <SkeletonGrid /> : children}

          {result.totalPages > 1 && (
            <Pagination aria-label="Pagination">
              <PaginationContent>
                <PaginationItem>
                  <PageArrow
                    direction="previous"
                    page={result.page - 1}
                    disabled={result.page <= 1}
                    href={pageHref(result.page - 1)}
                    onClick={onPageClick}
                  />
                </PaginationItem>
                {pages.map((item, index) =>
                  item === "gap" ? (
                    <PaginationItem key={`gap-${index}`} aria-hidden="true">
                      <span className="flex w-7.5 items-center justify-center text-(--muted)">…</span>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink asChild isActive={item === result.page}>
                        <Link
                          href={pageHref(item)}
                          onClick={(event) => onPageClick(event, item)}
                          aria-label={`Page ${item}`}
                        >
                          {item}
                        </Link>
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PageArrow
                    direction="next"
                    page={result.page + 1}
                    disabled={result.page >= result.totalPages}
                    href={pageHref(result.page + 1)}
                    onClick={onPageClick}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>
      </div>
    </main>
  );
}

function PriceInput({
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const invalid = !isValidPrice(value);
  return (
    <label htmlFor={id} className="mt-5.5 block text-[12px] text-[#475569]">
      {label}
      <Input
        className="mt-1.75"
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
      />
      {invalid && (
        <small id={`${id}-error`} className="mt-1 block text-red-600">
          Enter a positive amount.
        </small>
      )}
    </label>
  );
}

function PageArrow({
  direction,
  page,
  disabled,
  href,
  onClick,
}: {
  direction: "previous" | "next";
  page: number;
  disabled: boolean;
  href: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>, page: number) => void;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const label = direction === "previous" ? "Previous page" : "Next page";
  if (disabled) {
    return (
      <PaginationLink asChild>
        <span aria-disabled="true" aria-label={label} className="pointer-events-none opacity-40">
          <Icon size={16} aria-hidden="true" />
        </span>
      </PaginationLink>
    );
  }
  return (
    <PaginationLink asChild>
      <Link href={href} onClick={(event) => onClick(event, page)} aria-label={label} rel={direction === "previous" ? "prev" : "next"}>
        <Icon size={16} aria-hidden="true" />
      </Link>
    </PaginationLink>
  );
}
