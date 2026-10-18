import type { Product } from "@/types/product";
import { ProductCard } from "@/components/products/product-card";

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-[repeat(4,1fr)] gap-4.5 max-[1081px]:grid-cols-3 max-[601px]:grid-cols-2 max-[601px]:gap-3">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
