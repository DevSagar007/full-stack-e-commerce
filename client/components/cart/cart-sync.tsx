"use client";

import { useEffect } from "react";
import { CART_STORAGE_KEY, useCartStore } from "@/store/cart.store";

/**
 * Loads the persisted cart after hydration (avoids a server/client markup mismatch)
 * and keeps the cart in sync when it changes in another tab.
 */
export function CartSync() {
  useEffect(() => {
    // zustand omits the persist API when storage is unavailable (server, blocked localStorage).
    const persistApi = useCartStore.persist as typeof useCartStore.persist | undefined;
    if (!persistApi) {
      useCartStore.setState({ hydrated: true });
      return;
    }
    void persistApi.rehydrate();
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) void persistApi.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
