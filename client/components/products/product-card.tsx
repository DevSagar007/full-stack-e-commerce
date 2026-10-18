import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Product } from "@/types/product";
import { productPath, taka } from "@/lib/utils";
import { discountPercent } from "@/lib/pricing";
import { toCartProduct } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/products/add-to-cart-button";

export function ProductCard({ p }: { p: Product }) {
  const discount = discountPercent(p.price, p.originalPrice);
  const href = productPath(p);

  return (
    <article className="group min-w-0 overflow-hidden rounded-[7px] bg-white">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-[#e2e8f0]" tabIndex={-1} aria-hidden="true">
        <Image
          className="h-full w-full object-cover transition-transform duration-300 ease-[ease] group-hover:scale-[1.04]"
          src={p.image}
          alt=""
          width={600}
          height={600}
          sizes="(max-width: 600px) 50vw, (max-width: 1080px) 33vw, 25vw"
        />
        {discount > 0 && (
          <Badge variant="muted" className="absolute top-2.5 left-2.5 rounded-[3px] px-1.75 py-1 text-[11px]">
            -{discount}%
          </Badge>
        )}
      </Link>
      <div className="min-w-0 p-3.75 max-[601px]:p-3">
        <Link href={href} className="block min-w-0">
          <h3 className="mb-2 line-clamp-2 wrap-break-word text-[15px] font-semibold">{p.name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-[13px] text-[#f59e0b]">
          <Star size={14} fill="currentColor" aria-hidden="true" />
          <span className="sr-only">Rated</span> {p.rating}
          {p.reviews.length > 0 && (
            <small className="text-[11px] text-(--muted)">
              ({p.reviews.length}
              <span className="sr-only"> written {p.reviews.length === 1 ? "review" : "reviews"}</span>)
            </small>
          )}
        </div>
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1">
            <b className="whitespace-nowrap text-[17px]">{taka(p.price)}</b>
            {discount > 0 && (
              <del className="ml-1.5 whitespace-nowrap text-[11px] text-[#94a3b8]">
                <span className="sr-only">Was </span>
                {taka(p.originalPrice)}
              </del>
            )}
          </div>
          <AddToCartButton product={toCartProduct(p)} />
        </div>
      </div>
    </article>
  );
}
