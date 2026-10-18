"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { checkoutSchema, type CheckoutValues } from "@/schemas/checkout.schema";
import { placeOrder } from "@/app/checkout/actions";
import { useCartStore } from "@/store/cart.store";
import { cartTotals } from "@/lib/pricing";
import { taka } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoNotice, OrderTotals } from "@/components/cart/order-totals";

type Field = {
  name: keyof CheckoutValues;
  label: string;
  type?: string;
  autoComplete: string;
  inputMode?: "tel" | "numeric" | "email";
  placeholder: string;
  wide?: boolean;
};

const FIELDS: Field[] = [
  { name: "fullName", label: "Full name", autoComplete: "name", placeholder: "Nadia Rahman" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email", placeholder: "you@example.com" },
  { name: "phone", label: "Mobile number", type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "01712-345678" },
  { name: "address", label: "Address", autoComplete: "street-address", placeholder: "House, road, area", wide: true },
  { name: "city", label: "City", autoComplete: "address-level2", placeholder: "Dhaka" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code", inputMode: "numeric", placeholder: "1230" },
];

type Confirmation = { orderId: string; total: number; count: number };

export function CheckoutView() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema), mode: "onTouched" });

  const totals = cartTotals(items);

  // handleSubmit ignores re-entry while isSubmitting, and the button is disabled, so one click = one order.
  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const lines = items.map(({ id, quantity, price }) => ({ id, quantity, price }));
    try {
      const result = await placeOrder(values, lines);
      if (result.ok) {
        // Only clear the cart once the (simulated) order has been accepted.
        useCartStore.getState().clear();
        setConfirmation({ orderId: result.orderId, total: result.total, count: result.count });
        window.scrollTo({ top: 0 });
        return;
      }
      if (result.catalog) useCartStore.getState().syncCatalog(result.catalog);
      setSubmitError(result.error);
    } catch {
      setSubmitError("We couldn't reach the server. Check your connection and try again — your cart is unchanged.");
    }
  });

  if (confirmation) {
    return (
      <main className="mx-auto mt-17.5 max-w-150 px-5 py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 text-(--teal)" size={48} aria-hidden="true" />
        <h1 className="mb-3 text-4xl">Order confirmed</h1>
        <p className="mb-2 text-(--muted)" role="status">
          Demo order <b className="text-(--text)">{confirmation.orderId}</b> · {confirmation.count}{" "}
          {confirmation.count === 1 ? "item" : "items"} · {taka(confirmation.total)}
        </p>
        <p className="mb-6 text-sm text-(--muted)">
          This is a simulated checkout: nothing was charged, shipped or stored.
        </p>
        <Button asChild>
          <Link href="/products">Continue shopping</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-17.5 w-[calc(100%-32px)] max-w-317.5">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mb-7.5 text-4xl -tracking-px">Checkout</h1>
      {!hydrated ? (
        <div className="grid gap-8.75 min-[801px]:grid-cols-[1.5fr_1fr]" aria-busy="true">
          <p className="sr-only" role="status">Loading your cart…</p>
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-60 rounded-lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg bg-white px-5 py-20 text-center">
          <h2 className="mb-3 text-2xl">Your cart is empty</h2>
          <p className="mb-6 text-(--muted)">Add a few products before checking out.</p>
          <Button asChild>
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-8.75 min-[801px]:grid-cols-[1.5fr_1fr]">
          <form
            className="grid gap-4.5 rounded-lg bg-white p-7 max-[600px]:p-5 min-[801px]:grid-cols-2"
            noValidate
            onSubmit={onSubmit}
            aria-labelledby="delivery-heading"
          >
            <h2 id="delivery-heading" className="text-[1.375rem] min-[801px]:col-span-2">
              Delivery information
            </h2>
            <p className="-mt-2 text-xs text-(--muted) min-[801px]:col-span-2">All fields are required.</p>
            {FIELDS.map((field) => {
              const error = errors[field.name]?.message;
              const errorId = `${field.name}-error`;
              return (
                <div className={field.wide ? "min-[801px]:col-span-2" : undefined} key={field.name}>
                  <label htmlFor={field.name} className="block text-xs text-[#475569]">
                    {field.label}
                  </label>
                  <Input
                    id={field.name}
                    type={field.type ?? "text"}
                    autoComplete={field.autoComplete}
                    inputMode={field.inputMode}
                    placeholder={field.placeholder}
                    className="mt-2"
                    aria-required="true"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    {...register(field.name)}
                  />
                  {error && (
                    <small id={errorId} className="mt-1 block text-red-600">
                      {error}
                    </small>
                  )}
                </div>
              );
            })}
            {submitError && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 min-[801px]:col-span-2" role="alert">
                {submitError}
              </p>
            )}
            <Button className="min-[801px]:col-span-2" type="submit" disabled={isSubmitting} aria-disabled={isSubmitting}>
              {isSubmitting ? "Placing order…" : `Place order · ${taka(totals.total)}`}
            </Button>
          </form>
          <aside className="h-max rounded-lg bg-white p-6.25" aria-labelledby="checkout-summary">
            <h2 id="checkout-summary" className="text-[1.375rem]">Order summary</h2>
            <ul className="my-4 grid list-none gap-3 p-0">
              {items.map((item) => (
                <li className="flex items-center justify-between gap-4 text-sm" key={item.id}>
                  <span className="min-w-0 wrap-break-word">
                    {item.name} × {item.quantity}
                  </span>
                  <b className="whitespace-nowrap">{taka(item.price * item.quantity)}</b>
                </li>
              ))}
            </ul>
            <OrderTotals totals={totals} />
            <DemoNotice />
          </aside>
        </div>
      )}
    </main>
  );
}
