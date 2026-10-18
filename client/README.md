# Falcon — E-commerce Product Search & Checkout

A Next.js App Router storefront built for the *Task 2 — E-Commerce Product Search & Checkout* frontend assignment. It covers browsing and filtering a 520-product catalog, product detail pages, a persistent cart, and a validated mock checkout.

**Live demo:** https://future-studios-ecommerce.vercel.app/

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Zustand 5 · React Hook Form 7 · Zod 4

## Requirements coverage

| Assignment requirement | Where it is handled |
| --- | --- |
| 500+ products from a JSON dataset or mock API | `data/products.json` (48 seeds) expanded to 520 products in `services/product.service.ts`, also served at `/api/products` |
| Search, category, price, rating, sorting, pagination | `getProducts()` in the service, with controls in `ProductBrowser` |
| URL-based filters that survive a refresh | `lib/product-query.ts` and `ProductBrowser` (see [URL-based filters](#url-based-filters)) |
| Product details with images, stock, reviews, related products | `app/products/[slug]/page.tsx`, `getRelatedProducts()` |
| Cart with add, remove, quantity and persistence | `store/cart.store.ts` (Zustand + `persist`), `lib/cart.ts`, `CartView` |
| Checkout with React Hook Form and Zod | `CheckoutView`, `schemas/checkout.schema.ts`, `app/checkout/actions.ts` |
| SEO-friendly product pages | Per-product metadata, canonical URLs, JSON-LD, sitemap (see [SEO](#seo)) |
| Loading, empty and error states | See [Error, loading and empty states](#error-loading-and-empty-states) |
| API service layer kept out of components | `services/` and the `app/api/products` route handlers |
| Server and Client Components | See [Server vs Client Components](#server-vs-client-components) |
| `useEffect`, `useMemo`, `useCallback`, `React.memo` only where justified | See [Performance decisions](#performance-decisions) |

## Setup

Requires Node.js 20.9+.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build (prerenders all 520 product pages) / serve it |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |

### Environment variables

None are required. One is optional:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin for canonical URLs, the sitemap and JSON-LD, for example `https://future-studios-ecommerce.vercel.app`. On Vercel, the project's production domain (`VERCEL_PROJECT_PRODUCTION_URL`) is used automatically. Locally it falls back to `http://localhost:3000`. |

## Architecture

```
app/
  layout.tsx                 Root layout: metadataBase, global styles, <CartSync/>
  page.tsx                   Home (Server Component, static)
  products/page.tsx          Listing: parses searchParams, queries the service, redirects bad ?page
  products/[slug]/page.tsx   Product details: SSG for all 520 slugs, canonical, Product JSON-LD
  products/[slug]/not-found.tsx
  cart/page.tsx              Server shell around the client cart (noindex)
  checkout/page.tsx          Server shell around the client checkout form (noindex)
  checkout/actions.ts        Server Action: simulated order with server-side validation
  api/products/...           Mock REST API: list, detail, related (same service as the pages)
  sitemap.ts, robots.ts, error.tsx, not-found.tsx
components/
  products/                  ProductCard (server) + AddToCartButton (client island),
                             ProductBrowser (client filters/pagination), ProductActions, RatingStars
  cart/                      CartView, CartSync (hydration + cross-tab sync), OrderTotals
  checkout/                  CheckoutView (React Hook Form + Zod)
  layout/                    StoreHeader (server) + header-islands (search, cart badge, mobile menu), StoreFooter
  ui/                        shadcn-style primitives (Button, Input, Select, Pagination, ...)
  styles/                    globals.css (Tailwind entry) and variables.css (design tokens)
services/
  product.service.ts         Catalog, filtering → sorting → pagination, details, related products
  order.service.ts           Re-prices and stock-checks a cart against the catalog
lib/
  product-query.ts           Parses and normalizes URL query params (shared by pages and API)
  cart.ts                    Pure cart operations and persisted-data sanitizing
  pricing.ts                 Cart totals, shipping fee, discount calculation
  site.ts, utils.ts
schemas/checkout.schema.ts   Zod schemas: delivery form and order lines
store/cart.store.ts          Zustand store with the persist middleware
types/product.ts             Product, review, query and result types
data/products.json           48 hand-written seed products
public/assets/               Product and hero images
```

UI components never import the dataset. Everything goes through `services/`, and the pure logic in `lib/` and `schemas/` has no React dependency.

## Data and API

- **Dataset.** `data/products.json` holds 48 seed products. `product.service.ts` expands them deterministically into 520 products ("Edition N" variants) with varied prices and stock.
  - Each old price keeps its seed's discount ratio, so `originalPrice` is never below the current price.
  - Written reviews stay on the original product only; editions are not given copies of another product's reviews.
- **Service layer.** `getProducts(query)` filters (search, category, price range, rating), then sorts, then paginates.
  - Sorting always falls back to product id to break ties, so the order is deterministic.
  - `getProductById` looks up by id or slug through a `Map` and is wrapped in React `cache()`, so `generateMetadata` and the page share one lookup per request.
  - `getRelatedProducts` returns the best-rated products in the same category and excludes other editions of the same product.
- **How pages get data.** Server Components call the service directly. There is no client-side fetching and no double fetch on hydration, and the browser only receives the 12 products on the current page.
- **Mock REST API** (uses the same parser and service):
  - `GET /api/products?search=&category=&minPrice=&maxPrice=&rating=&sort=&page=&limit=` returns `{ items, total, page, limit, totalPages, categories, query }`, where `query` is the normalized query that was actually applied.
  - `GET /api/products/:idOrSlug` returns the product, or 404.
  - `GET /api/products/:idOrSlug/related` returns `{ items }`, or 404.

### Query parameter rules (`lib/product-query.ts`)

| Input | Behaviour |
| --- | --- |
| `minPrice` / `maxPrice` negative, non-numeric, `1e3` | Ignored |
| `minPrice` > `maxPrice` | Swapped; the UI explains which range is shown |
| `sort` not one of `featured`, `price-low`, `price-high`, `rating` | Uses `featured` |
| `rating` | Clamped to 0–5 |
| `category` | Matched case-insensitively; unknown categories are ignored |
| `page` malformed or out of range | The listing **redirects** to the page actually shown (`?page=999` → last page) |
| `limit` (API only) | Clamped to 1–48 |
| `search` | Trimmed, at most 100 characters |

## URL-based filters

The URL is the single source of truth for search, category, price, rating, sort and page. That gives refresh persistence, shareable links, and browser back/forward support.

- Selects (category, sort, rating) push a new history entry immediately.
- Text fields (search, minimum and maximum price) keep a local draft and commit **together** after 350 ms with `router.replace`. Committing them together means quick edits to two fields can't overwrite each other from a stale URL, and typing doesn't add a history entry per keystroke. Drafts re-sync from the URL only when it changes from outside (back/forward, header search, Clear); this happens during render, not in an effect. Invalid prices show an inline error and aren't committed.
- A select change also carries any text draft that hasn't been committed yet, so changing the category while a search is still debouncing doesn't drop the search.
- Every filter change removes `page`; every other active parameter is kept.
- Pagination items are real `<a href>` links, so they work for crawlers, middle-click and no-JS. Plain clicks run inside `startTransition` so the skeleton grid shows while the next page loads.
- Filtered listing URLs are `noindex, follow` and canonicalize to `/products` (or `/products?page=N`).

## Server vs Client Components

| Server Components | Client Components (and why) |
| --- | --- |
| All pages and layouts, `StoreHeader`, `StoreFooter`, `ProductCard`, `ProductGrid`, `OrderTotals`, `RatingStars`, product details | `ProductBrowser` (URL-driven filter controls), `AddToCartButton` and `ProductActions` (cart writes), header islands (search form, cart badge, mobile menu), `CartView` and `CheckoutView` (localStorage-backed cart), `CartSync`, `error.tsx` (must be a Client Component in Next.js), and the Radix-based `ui/select` and `ui/tooltip` |

- Product cards stay on the server, and only the cart button is a client island.
- The listing's result grid is rendered on the server and passed into `ProductBrowser` as `children`, so card markup and images don't add to client JavaScript.
- Rendering:
  - Product pages are statically generated (`generateStaticParams`). Unknown slugs return a real 404, and legacy `/products/prod-001` URLs return a 308 redirect to the slug.
  - `/`, `/cart` and `/checkout` are static.
  - `/products` is rendered per request because it depends on `searchParams`.

## Cart state and persistence

- Zustand store with `persist` in localStorage (key `ecommerce-task-cart`, version 2).
- **Hydration.** `skipHydration: true`, then `CartSync` calls `rehydrate()` in an effect after mount. The first client render therefore matches the server HTML (no hydration mismatch). A `hydrated` flag lets the cart and checkout show a skeleton instead of briefly flashing "empty cart". `CartSync` also listens for `storage` events to keep tabs in sync, and removes the listener on cleanup.
- **Stored shape.** Only the fields the cart needs (`id, slug, name, image, category, price, stock, quantity`); descriptions and reviews are not persisted.
- **Invalid or outdated data.** `migrate` and `merge` pass stored items through `sanitizeCartItems`, which drops malformed or duplicate entries and re-clamps quantities to 1…stock. Unparseable JSON results in an empty cart.
- **Rules.** Adding the same product again increases its quantity. Quantity is always between 1 and stock. Out-of-stock products can't be added.
- **Selectors.** The header badge selects a number, not the items array. Cart lines are wrapped in `React.memo`: store actions are stable and unchanged items keep their identity, so changing one quantity re-renders only that line.

## Checkout

- React Hook Form with `zodResolver(checkoutSchema)`, validating on blur and then on change. The schema targets Bangladesh, matching the ৳ prices and Dhaka address:
  - Text fields are trimmed, so whitespace-only input counts as missing; length limits apply.
  - Email must be valid.
  - Phone must be a BD mobile number (`01XXXXXXXXX`, optional `+880`, spaces and dashes allowed).
  - Postal code must be 4 digits.
- Accessibility: every input has a `<label>`, the right `type`, `autocomplete` and `inputMode`, plus `aria-invalid`. Errors are linked with `aria-describedby`, and the first invalid field gets focus.
- **Simulated order.** The `placeOrder` Server Action re-validates the form and order lines on the server, then calls `checkOrder`, which re-prices every line from the catalog and checks stock.
  - If the persisted cart is outdated (price changed, stock reduced, product gone), the order is rejected, the cart is updated from the returned catalog data, and the user reviews it before resubmitting.
  - Nothing is stored, charged or sent anywhere. The confirmation shows a `DEMO-XXXXXXXX` reference.
- The submit button is disabled while submitting, and `handleSubmit` ignores re-entry, so a double click places one order.
- The cart is cleared **only after** a successful response. On a network error the cart is kept and an error is shown.
- **Shipping.** This is a demo store, so the shipping fee is ৳0 (`SHIPPING_FEE` in `lib/pricing.ts`). Cart, checkout and the server check all use the same `cartTotals()`, so subtotal + shipping = total everywhere, and the summary says that no fee, payment or real order is involved.

## SEO

- Per-product `title`, `description`, Open Graph image, and a canonical URL resolved against `metadataBase`.
- `Product` JSON-LD (escaped as the Next.js docs recommend). It contains name, description, image, SKU, category, and an offer with BDT price and availability; the written reviews are included only when a product has them. It intentionally has **no** `aggregateRating` or `brand`, because the catalog has no review counts or brand data to back them.
- `sitemap.xml` (home, listing, 520 products) and `robots.txt` (disallows cart, checkout and the API).
- Cart and checkout are `noindex`. The product 404 and the generic 404 are separate pages.

## Performance decisions

- **Server-first.** Filtering and pagination run on the server; the client gets one page of results.
- **Small client islands** (header, card button, filters) instead of whole client pages.
- **`useTransition`** for filter and page navigation, so the current UI stays interactive while a skeleton replaces the results.
- **Debounced text filters** (350 ms) with timer cleanup.
- **`React.memo` only where it has an effect** (cart lines).
- **`useCallback` only where identity matters**, all in `ProductBrowser`: `go` and `commitText` are in the debounce effect's dependency list, so a new function on every render would restart the 350 ms timer; `setDraft` is returned from the `useDebouncedFilters` hook, so it keeps the same identity the way a `useState` setter does. Other handlers are plain functions because nothing depends on their identity.
- **No `useMemo` for cart totals.** The calculation is a single pass over a handful of items; memoizing would cost more than it saves.
- **Lookups and caching.** `Map` lookups in the service, plus React `cache()` to dedupe the detail lookup between metadata and the page.
- **Images.** `next/image` with `sizes`; the hero and product image are preloaded (`preload`, which replaces the deprecated `priority` in Next 16).
- **Effects** are used only for side effects: cart rehydration and the `storage` listener, the Escape-key listener for the mobile menu, the "Added" timer cleanup, and error logging.

## Error, loading and empty states

- Listing: a skeleton grid during transitions, an empty state with guidance when nothing matches, and redirects for bad page numbers.
- Product: an SSG page, `not-found.tsx` with a real 404 for invalid ids, and an out-of-stock state.
- Cart and checkout: a hydration skeleton, an empty-cart state, and inline and server errors.
- Route errors: `app/error.tsx` with `retry()`; in Next.js 16 this re-fetches the segment.

## Testing

The repository has no automated test suite; `npm run lint` and `npm run typecheck` are the static checks.

- The main shopping flow was checked in headless Chromium against a production build: filters and URL sync, back/forward, refresh, redirects, 404s, JSON-LD and canonical, cart limits and persistence, corrupted storage, checkout validation, double submit, stale-price rejection, no horizontal overflow at 375/820/1280 px, and no console or hydration errors.

## Known limitations

- Each product has one image; the seed data has no gallery images.
- Product ratings are catalog values. Most products have no written reviews, so the page shows "Rated X out of 5 · N written reviews" and never presents an invented review count.
- Edition products are generated variants of the 48 seeds, so names and images repeat with different prices and stock.
- Stock is not reserved; the order check uses the static catalog.
- Checkout is simulated: no payments, accounts, order history or order tracking. The header's Track Order, Help Center and Sell With Us items are kept from the original design and link to the product listing; footer information pages are listed as plain text.
- Footer contact details and payment logos come from the original design and are placeholders.
