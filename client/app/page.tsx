import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight } from "lucide-react";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/product.service";
import { ProductGrid } from "@/components/products/product-grid";

export const metadata: Metadata = {
  title: "Everyday things, better chosen",
  description:
    "Discover useful, beautiful products at fair prices. Shop 500+ items across electronics, audio, lifestyle and accessories.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const featured = await getProducts({ limit: 4, sort: "rating" });
  return (
    <>
      <StoreHeader />
      <main>
        <section className="mx-auto mt-8 grid w-[calc(100%-32px)] max-w-317.5 grid-cols-[1fr_1fr] overflow-hidden rounded-[8px] bg-white max-[901px]:grid-cols-1">
          <div className="p-16.25 max-[901px]:px-6 max-[901px]:py-10">
            <p className="kicker">The new Falcon collection</p>
            <h1 className="my-4.5 text-[clamp(45px,5vw,74px)] leading-[1.04] tracking-[-3px] max-[601px]:tracking-[-1.5px]">
              Everyday things.
              <br />
              <em className="font-normal text-(--teal)">Better chosen</em>
            </h1>
            <p className="mb-7 max-w-95 leading-[1.7] text-(--muted)">
              Experience a new platform for discovering useful, beautiful things
              made for modern life.
            </p>
            <Button asChild>
              <Link href="/products">
                Shop now <ArrowRight size={17} />
              </Link>
            </Button>
          </div>
          <div className="`min-h-107.5 max-[901px]:min-h-65">
            <Image
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&q=85"
              alt="Curated desk setup"
              width={1200}
              height={900}
              preload
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
        </section>
        <section className="mx-auto my-17.5 w-[calc(100%-32px)] max-w-317.5">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="kicker">Popular now</p>
              <h2 className="mt-2 text-[30px] max-[601px]:text-[24px]">
                Made for your everyday
              </h2>
            </div>
            <Link
              href="/products"
              className="flex items-center text-[13px] text-(--teal)"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <ProductGrid items={featured.items} />
        </section>
        <section className="mx-auto my-22.5 grid min-h-82.5 w-[calc(100%-32px)] max-w-317.5 grid-cols-[1fr_1fr] overflow-hidden rounded-lg bg-(--navy) text-white max-[901px]:grid-cols-1 max-[601px]:my-12.5">
          <div className="p-15 max-[901px]:px-6 max-[901px]:py-10">
            <p className="kicker">Thoughtfully selected</p>
            <h2 className="mt-3.75 mb-6.25 text-[44px] leading-[1.05] max-[601px]:text-[32px]">
              Good design
              <br />
              should feel easy
            </h2>
            <Button asChild>
              <Link href="/products">Explore collection</Link>
            </Button>
          </div>
          <Image
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=85"
            alt="Bright workspace"
            width={1200}
            height={900}
            sizes="(max-width: 800px) 100vw, 50vw"
          />
        </section>
      </main>
      <StoreFooter />
    </>
  );
}
