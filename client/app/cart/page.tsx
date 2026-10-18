import type { Metadata } from "next";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "My cart",
  robots: { index: false },
};

export default function Page() {
  return (
    <>
      <StoreHeader />
      <CartView />
      <StoreFooter />
    </>
  );
}
