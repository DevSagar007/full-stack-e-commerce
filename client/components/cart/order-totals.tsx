import { taka } from "@/lib/utils";
import type { cartTotals } from "@/lib/pricing";

type Totals = ReturnType<typeof cartTotals>;

/** Shared by cart and checkout so both always show the same breakdown. */
export function OrderTotals({ totals }: { totals: Totals }) {
  return (
    <dl className="m-0 grid gap-3 text-sm">
      <div className="flex items-center justify-between gap-4">
        <dt>
          Subtotal ({totals.count} {totals.count === 1 ? "item" : "items"})
        </dt>
        <dd className="m-0 font-bold">{taka(totals.subtotal)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt>Shipping</dt>
        <dd className="m-0 font-bold">{totals.shipping === 0 ? "Free" : taka(totals.shipping)}</dd>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 border-t border-(--line) pt-4 text-base">
        <dt>Total</dt>
        <dd className="m-0 text-lg font-bold">{taka(totals.total)}</dd>
      </div>
    </dl>
  );
}

export function DemoNotice() {
  return (
    <p className="mt-4 text-xs leading-5 text-(--muted)">
      Demo store: no delivery fee is charged, no payment is taken and no real order is placed.
    </p>
  );
}
