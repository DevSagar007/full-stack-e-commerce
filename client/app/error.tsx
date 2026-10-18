"use client";

import { useEffect } from "react";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto my-30 max-w-150 px-4 text-center">
        <p className="kicker">Something went wrong</p>
        <h1 className="my-2 text-4xl -tracking-px">We couldn&apos;t load this page</h1>
        <p className="mb-6 leading-[1.6] text-(--muted)">
          This is usually temporary. Try again, or come back in a moment.
          {error.digest && <span className="mt-2 block text-xs">Reference: {error.digest}</span>}
        </p>
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
      </main>
      <StoreFooter />
    </>
  );
}
