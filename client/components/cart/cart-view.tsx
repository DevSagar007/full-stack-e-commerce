"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import type { CartItem } from "@/lib/cart";
import { cartTotals } from "@/lib/pricing";
import { productPath, taka } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { DemoNotice, OrderTotals } from "@/components/cart/order-totals";

type LineActions = { inc: (id: string) => void; dec: (id: string) => void; remove: (id: string) => void };

/**
 * Memoized: store actions are stable and untouched items keep their identity,
 * so changing one line's quantity re-renders only that line.
 */
const CartLine = memo(function CartLine({ item, inc, dec, remove }: { item: CartItem } & LineActions) {
  const href = productPath(item);
  return (
    <li className="grid min-w-0 grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-lg bg-white p-4 min-[601px]:grid-cols-[100px_minmax(0,1fr)_auto]">
      <Link href={href} className="overflow-hidden rounded-md bg-[#f1f5f9]" tabIndex={-1} aria-hidden="true">
        <Image className="aspect-square h-auto w-full object-cover" src={item.image} alt="" width={100} height={100} />
      </Link>
      <div className="min-w-0">
        <Link href={href} className="block min-w-0">
          <h2 className="line-clamp-2 wrap-break-word text-base font-semibold">{item.name}</h2>
        </Link>
        <p className="mt-1 text-sm text-(--muted)">
          {item.category} · {taka(item.price)} each
        </p>
        <div
          className="mt-4 inline-flex h-9 items-center gap-1 rounded-[1.375rem] border border-(--line) px-1"
          role="group"
          aria-label={`Quantity of ${item.name}`}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-[#f1f5f9]"
            onClick={() => dec(item.id)}
            aria-label={`Decrease quantity of ${item.name}`}
            disabled={item.quantity <= 1}
          >
            <Minus size={14} />
          </Button>
          <output className="min-w-9 text-center text-sm" aria-live="polite">
            {String(item.quantity).padStart(2, "0")}
          </output>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full bg-[#f1f5f9]"
            onClick={() => inc(item.id)}
            aria-label={`Increase quantity of ${item.name}`}
            disabled={item.quantity >= item.stock}
          >
            <Plus size={14} />
          </Button>
        </div>
        {item.quantity >= item.stock && (
          <p className="mt-2 text-xs text-amber-700">Only {item.stock} in stock</p>
        )}
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 min-[601px]:col-span-1 min-[601px]:flex-col min-[601px]:items-end">
        <b className="whitespace-nowrap text-base">{taka(item.price * item.quantity)}</b>
        <Tooltip content="Remove from cart">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-red-500 hover:bg-red-50"
            onClick={() => remove(item.id)}
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 size={16} />
          </Button>
        </Tooltip>
      </div>
    </li>
  );
});

export function CartView() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const remove = useCartStore((s) => s.remove);
  const totals = cartTotals(items);

  return (
    <main className="mx-auto mt-17.5 w-[calc(100%-32px)] max-w-317.5">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Cart" }]} />
      <h1 className="mb-8 text-4xl -tracking-px">My Cart</h1>
      {!hydrated ? (
        <div className="grid gap-4" aria-busy="true">
          <p className="sr-only" role="status">Loading your cart…</p>
          <Skeleton className="h-34 rounded-lg" />
          <Skeleton className="h-34 rounded-lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg bg-white px-5 py-20 text-center">
          <h2 className="mb-6 text-2xl">Your cart is empty</h2>
          <Button asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-7 min-[901px]:grid-cols-[minmax(0,1fr)_360px]">
          <ul className="m-0 grid list-none gap-4 p-0" aria-label="Cart items">
            {items.map((item) => (
              <CartLine key={item.id} item={item} inc={inc} dec={dec} remove={remove} />
            ))}
          </ul>
          <aside className="rounded-lg bg-white p-5 min-[901px]:sticky min-[901px]:top-6" aria-labelledby="cart-summary">
            <h2 id="cart-summary" className="mb-5 text-xl">Order summary</h2>
            <OrderTotals totals={totals} />
            <Button className="mt-5 w-full" asChild>
              <Link className="w-full" href="/checkout">
                Proceed to Checkout <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <DemoNotice />
          </aside>
        </div>
      )}
    </main>
  );
}
