import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addItem, changeQuantity, sanitizeCartItems, syncWithCatalog, type CartItem, type CartProduct } from "@/lib/cart";

export type { CartItem, CartProduct };

type State = {
  items: CartItem[];
  /** False until the persisted cart has been read; lets pages avoid flashing "empty cart". */
  hydrated: boolean;
  add: (product: CartProduct, quantity?: number) => void;
  remove: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  syncCatalog: (catalog: Record<string, CartProduct | null>) => void;
};

export const CART_STORAGE_KEY = "ecommerce-task-cart";

const readItems = (persisted: unknown) => sanitizeCartItems((persisted as { items?: unknown } | undefined)?.items);

export const useCartStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      add: (product, quantity = 1) => set((state) => ({ items: addItem(state.items, product, quantity) })),
      remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      inc: (id) => set((state) => ({ items: changeQuantity(state.items, id, 1) })),
      dec: (id) => set((state) => ({ items: changeQuantity(state.items, id, -1) })),
      clear: () => set({ items: [] }),
      syncCatalog: (catalog) => set((state) => ({ items: syncWithCatalog(state.items, catalog) })),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 2,
      // window access throws on the server, so zustand treats storage as unavailable there.
      storage: createJSONStorage(() => window.localStorage),
      // Rehydrated by CartSync after mount so the first client render matches the server HTML.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      // v1 stored whole Product objects; sanitizing keeps only the CartItem fields.
      migrate: (persisted) => ({ items: readItems(persisted) }),
      merge: (persisted, current) => ({ ...current, items: readItems(persisted) }),
      onRehydrateStorage: () => () => useCartStore.setState({ hydrated: true }),
    },
  ),
);
