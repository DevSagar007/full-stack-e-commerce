"use client";

import { ShoppingCart } from "lucide-react";
import type { CartProduct } from "@/lib/cart";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";

/** Small client island so product cards themselves can stay Server Components. */
export function AddToCartButton({ product }: { product: CartProduct }) {
  const add = useCartStore((s) => s.add);
  const soldOut = product.stock < 1;
  return (
    <Button
      type="button"
      variant="ghost"
      className="grid size-8.5 place-items-center rounded-full bg-[#e6fffa] text-[#008e78]"
      size="icon"
      aria-label={
        soldOut
          ? `${product.name} is out of stock`
          : `Add ${product.name} to cart`
      }
      disabled={soldOut}
      onClick={() => add(product)}
    >
      <ShoppingCart size={17} />
    </Button>
  );
}
