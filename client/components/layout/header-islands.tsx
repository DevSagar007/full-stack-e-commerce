"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { Badge } from "@/components/ui/badge";

export function HeaderSearch() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const query = term.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  }

  return (
    <form className="relative mx-auto flex w-[min(762px,58vw)] max-[800px]:order-3 max-[800px]:w-full" onSubmit={submit} role="search">
      <label htmlFor="header-search" className="sr-only">Search products</label>
      <input
        id="header-search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search for anything...."
        maxLength={100}
        className="h-12 w-full rounded-lg border-0 bg-white px-4 pr-14 text-[#0f172a] outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-[#00b795]"
      />
      <button type="submit" aria-label="Search" className="absolute right-0 top-0 grid h-12 w-12 place-items-center rounded-r-lg bg-[#00b795] text-white transition-colors hover:bg-[#009c80]">
        <Search size={21} aria-hidden="true" />
      </button>
    </form>
  );
}

export function CartLink() {
  // Selecting a number (not the items array) means unrelated cart changes don't re-render the header.
  const count = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const hydrated = useCartStore((s) => s.hydrated);
  const label = `Cart, ${count} ${count === 1 ? "item" : "items"}`;

  return (
    <Link href="/cart" className="relative flex items-center p-2" aria-label={label}>
      <ShoppingCart size={24} strokeWidth={2} aria-hidden="true" />
      <Badge
        aria-hidden="true"
        className="absolute -right-0.5 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] text-white"
      >
        {count}
      </Badge>
      {hydrated && (
        <span className="sr-only" role="status">
          {label}
        </span>
      )}
    </Link>
  );
}

export function CategoryMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className="flex shrink-0 items-center space-x-2">
        <button
          type="button"
          className="flex items-center justify-center min-[801px]:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close categories" : "Open categories"}
          aria-expanded={open}
          aria-controls="categories-nav"
        >
          {open ? <X size={24} strokeWidth={1.5} className="text-[#00a788]" /> : <Menu size={24} strokeWidth={1.5} className="text-[#00a788]" />}
        </button>
        <Menu size={24} strokeWidth={1.5} className="text-[#00a788] max-[800px]:hidden" aria-hidden="true" />
        <span className="whitespace-nowrap text-lg font-medium text-[#0f172a] max-[1200px]:text-base">Categories</span>
      </div>
      <nav
        id="categories-nav"
        aria-label="Categories"
        // Closing on link click covers client-side navigation within the menu.
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className={`${open ? "flex" : "hidden"} absolute left-4 right-4 top-full z-10 max-h-[calc(100vh-120px)] flex-col gap-4 overflow-y-auto bg-white p-4.5 shadow-[0_8px_25px_rgba(15,23,42,.13)] min-[801px]:static min-[801px]:flex min-[801px]:max-h-none min-[801px]:flex-row min-[801px]:flex-wrap min-[801px]:gap-8 min-[801px]:overflow-visible min-[801px]:bg-transparent min-[801px]:p-0 min-[801px]:shadow-none max-[1200px]:gap-3`}
      >
        {children}
      </nav>
    </>
  );
}
