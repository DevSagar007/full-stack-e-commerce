import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProducts, resolveCategory } from "@/services/product.service";
import { parseProductQuery, productsHref, type RawSearchParams } from "@/lib/product-query";
import { ProductBrowser } from "@/components/products/product-browser";
import { ProductGrid } from "@/components/products/product-grid";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const FILTER_KEYS = ["search", "category", "minPrice", "maxPrice", "rating", "sort"];

function toURLSearchParams(params: RawSearchParams) {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) result.set(key, first);
  }
  return result;
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const query = parseProductQuery(params);
  const category = resolveCategory(query.category);
  const filtered = FILTER_KEYS.some((key) => params[key] !== undefined);
  return {
    title: category ? `Shop ${category}` : "Shop all products",
    description:
      "Browse 500+ products across electronics, audio, lifestyle and accessories. Search, filter and sort the full Falcon collection.",
    alternates: { canonical: query.page && query.page > 1 ? `/products?page=${query.page}` : "/products" },
    // Filter combinations are near-duplicates of the main listing; keep them out of the index.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const result = await getProducts(parseProductQuery(raw));

  // Malformed (?page=abc, ?page=-2) or out-of-range (?page=999) pages redirect to the page actually shown.
  const rawPage = toURLSearchParams(raw).get("page");
  if (rawPage !== null && rawPage !== String(result.page)) {
    redirect(productsHref(toURLSearchParams(raw), { page: result.page > 1 ? String(result.page) : null }));
  }

  const { items, ...meta } = result;

  return (
    <>
      <StoreHeader />
      <ProductBrowser result={meta}>
        {items.length > 0 ? (
          <ProductGrid items={items} />
        ) : (
          <div className="rounded-[7px] bg-white px-5 py-20 text-center">
            <h2>No products found</h2>
            <p>Try a different search, widen the price range or clear the filters.</p>
          </div>
        )}
      </ProductBrowser>
      <StoreFooter />
    </>
  );
}
