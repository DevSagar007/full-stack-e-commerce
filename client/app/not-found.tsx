import Link from "next/link";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <StoreHeader />
      <main className="mx-auto my-30 max-w-150 px-4 text-center">
        <p className="kicker">404</p>
        <h1 className="my-2 text-4xl -tracking-px">Page not found</h1>
        <p className="mb-6 leading-[1.6] text-(--muted)">The page you are looking for does not exist.</p>
        <Button asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </main>
      <StoreFooter />
    </>
  );
}
