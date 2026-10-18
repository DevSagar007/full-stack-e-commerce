import Image from "next/image";
import Link from "next/link";
import { Package, Headphones, UserRound } from "lucide-react";
import { CartLink, CategoryMenu, HeaderSearch } from "@/components/layout/header-islands";

const CATEGORY_LINKS = ["Electronics", "Home Appliances", "Mother & Baby", "Automotive", "Sports Gear"];

export function StoreHeader() {
  return (
    <>
      <div className="h-8.5 bg-[#00b795] px-4 py-2.25 text-center text-xs text-white">
        <Link href="/products">
          Discounts on selected products&nbsp;&nbsp; Shop Now
        </Link>
      </div>
      <div className="bg-[#0f172a] px-0 py-5 max-[800px]:py-3.5">
        <div className="mx-auto flex w-[min(1270px,calc(100%-32px))] items-center justify-between gap-5 max-[800px]:flex-wrap">
          <Link href="/" className="flex min-w-45 max-[800px]:min-w-0">
            <Image src="/assets/logo/footer-logo.png" alt="Falcon home" width={180} height={35} preload className="h-auto object-contain max-[800px]:w-33.75" />
          </Link>
          <HeaderSearch />
          <div className="flex items-center gap-3.5 text-white">
            <CartLink />
            <span className="cursor-default p-2 text-white/60" title="Accounts are not part of this demo" aria-label="Account (coming soon)" role="img">
              <UserRound size={24} strokeWidth={2} aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
      <header className="relative bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4 max-[1200px]:gap-2 max-[800px]:items-start">
            <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3 max-[1200px]:gap-x-3">
              <CategoryMenu>
                {CATEGORY_LINKS.map((category) => (
                  <Link
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="whitespace-nowrap text-base"
                  >
                    {category}
                  </Link>
                ))}
              </CategoryMenu>
            </div>
            <div className="ml-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm max-[1200px]:gap-x-2 max-[1200px]:text-xs">
              <Link href="/products" className="flex items-center space-x-2 whitespace-nowrap font-medium max-[1200px]:space-x-1.5"><Package size={16} strokeWidth={1.5} /> <span>TRACK ORDER</span></Link>
              <Link href="/products" className="flex items-center space-x-2 whitespace-nowrap font-medium max-[1200px]:space-x-1.5"><Headphones size={16} strokeWidth={1.5} /> <span>HELP CENTER</span></Link>
              <Link href="/products" className="flex items-center space-x-2 whitespace-nowrap font-medium max-[1200px]:space-x-1.5"><Image src="/assets/icons/animation.png" alt="" width={16} height={16} aria-hidden="true" /> <span>SELL WITH US</span></Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
