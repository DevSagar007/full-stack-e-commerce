import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { getAllProductSlugs, getProductById, getRelatedProducts } from "@/services/product.service";
import { productPath, taka } from "@/lib/utils";
import { discountPercent } from "@/lib/pricing";
import { toCartProduct } from "@/lib/cart";
import { SITE_URL } from "@/lib/site";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductActions } from "@/components/products/product-actions";
import { RatingStars, reviewLabel } from "@/components/products/rating-stars";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type Params = Promise<{ slug: string }>;

// All 520 product pages are prerendered at build time; unknown slugs render on demand and 404.
export async function generateStaticParams() {
  return (await getAllProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductById((await params).slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  const url = productPath(product);
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description: product.description,
      url,
      images: [{ url: product.image, alt: product.name }],
      type: "website",
    },
  };
}

/** Structured data limited to facts the catalog actually holds (no aggregate rating or brand). */
function productJsonLd(product: Product) {
  const url = `${SITE_URL}${productPath(product)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image],
    sku: product.id,
    category: product.category,
    url,
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "BDT",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.reviews.length > 0 && {
      review: product.reviews.map((review) => ({
        "@type": "Review",
        author: { "@type": "Person", name: review.author },
        reviewBody: review.comment,
        reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5 },
      })),
    }),
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) notFound();
  // Legacy /products/prod-001 links resolve by id; send them to the canonical slug URL.
  if (slug !== product.slug) permanentRedirect(productPath(product));

  const related = await getRelatedProducts(product.id);
  const discount = discountPercent(product.price, product.originalPrice);
  const reviewCount = product.reviews.length;
  const inStock = product.stock > 0;

  return (
    <>
      <StoreHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c") }}
      />
      <main className="mx-auto mt-17.5 w-[calc(100%-32px)] max-w-317.5">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/products" },
            { label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` },
            { label: product.name },
          ]}
        />
        <div className="grid gap-13.75 rounded-lg bg-white p-6.25 max-[600px]:gap-4 max-[600px]:p-4 min-[801px]:grid-cols-2">
          <div className="min-w-0">
            <Image
              className="aspect-square h-auto w-full rounded-md object-cover"
              src={product.image}
              alt={product.name}
              width={900}
              height={900}
              sizes="(max-width: 800px) 100vw, 50vw"
              preload
            />
          </div>
          <div className="min-w-0 p-6.25 max-[600px]:p-0">
            <p className="kicker">{product.category}</p>
            <h1 className="my-3 wrap-break-word text-[2.375rem] leading-tight -tracking-px max-[600px]:text-[1.75rem]">
              {product.name}
            </h1>
            <div className="flex items-center gap-1 text-[13px] text-[#f59e0b]">
              <RatingStars rating={product.rating} className="text-base" />
              <small className="text-[11px] text-(--muted)">
                {product.rating} out of 5 · <a href="#reviews">{reviewLabel(reviewCount)}</a>
              </small>
            </div>
            <div className="my-5.5 flex flex-wrap items-baseline gap-x-2.5 text-[1.5625rem] font-bold text-(--text)">
              {taka(product.price)}
              {discount > 0 && (
                <>
                  <del className="text-xs font-normal text-[#94a3b8]">
                    <span className="sr-only">Was </span>
                    {taka(product.originalPrice)}
                  </del>
                  <span className="rounded bg-[#fee2e2] px-1.75 py-1 text-[0.6875rem] font-semibold text-[#ef4444]">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            <p className="max-w-140 leading-[1.7] text-(--muted)">{product.description}</p>
            <p className={`my-5 text-xs ${!inStock || product.stock <= 3 ? "text-red-600" : "text-green-700"}`}>
              <span aria-hidden="true">● </span>
              {inStock ? `In stock · ${product.stock} available` : "Out of stock"}
            </p>
            <ProductActions product={toCartProduct(product)} />
            <dl className="m-0 grid gap-3 border-t border-(--line) pt-4 text-xs min-[801px]:grid-cols-2">
              <dt className="font-bold">Delivery</dt>
              <dd className="m-0">No delivery fee in this demo store</dd>
              <dt className="font-bold">Sold by</dt>
              <dd className="m-0">Falcon Official Store</dd>
            </dl>
          </div>
        </div>

        <section className="mt-12.5 scroll-mt-6" id="reviews" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="mb-1.5 text-[1.625rem]">Customer reviews</h2>
          <p className="mt-0 text-xs text-(--muted)">
            Catalog rating {product.rating} out of 5 · {reviewLabel(reviewCount)}
          </p>
          {reviewCount > 0 ? (
            <ul className="mt-4.5 grid list-none gap-3.5 p-0">
              {product.reviews.map((review) => (
                <li className="rounded-lg bg-white p-4.5" key={review.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <b>{review.author}</b>
                    <RatingStars rating={review.rating} className="text-base" />
                  </div>
                  <p className="m-0 text-sm leading-[1.6] text-(--muted)">{review.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-white p-4.5 text-sm text-(--muted)">No written reviews yet.</p>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-18.75" aria-labelledby="related-heading">
            <h2 id="related-heading" className="mb-6 text-[1.625rem]">Related products</h2>
            <ProductGrid items={related} />
          </section>
        )}
      </main>
      <StoreFooter />
    </>
  );
}
