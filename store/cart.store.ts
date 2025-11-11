import { create } from "zustand";
import { CartCustomization, CartStore } from "../types";

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

    return aSorted.every((item, idx) => item.id === bSorted[idx].id);
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],

    addItem: (item) => {
        const customizations = item.customizations ?? [];

        const existing = get().items.find(
            (i) =>
                i.id === item.id &&
                areCustomizationsEqual(i.customizations ?? [], customizations)
        );

        if (existing) {
            set({
                items: get().items.map((i) =>
                    i.id === item.id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ),
            });
        } else {
            set({
                items: [...get().items, { ...item, quantity: 1, customizations }],
            });
        }
    },

    removeItem: (id, customizations = []) => {
        set({
            items: get().items.filter(
                (i) =>
                    !(
                        i.id === id &&
                        areCustomizationsEqual(i.customizations ?? [], customizations)
                    )
            ),
        });
    },

    increaseQty: (id, customizations = []) => {
        set({
            items: get().items.map((i) =>
                i.id === id &&
                areCustomizationsEqual(i.customizations ?? [], customizations)
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ),
        });
    },

    decreaseQty: (id, customizations = []) => {
        set({
            items: get()
                .items.map((i) =>
                    i.id === id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations)
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0),
        });
    },

    updateItem: (id, oldCustomizations = [], newCustomizations = [], newQuantity) => {
        const items = get().items;
        const itemIndex = items.findIndex(
            (i) =>
                i.id === id &&
                areCustomizationsEqual(i.customizations ?? [], oldCustomizations)
        );

        if (itemIndex === -1) return;

        const item = items[itemIndex];
        const updatedItem = {
            ...item,
            customizations: newCustomizations,
            quantity: newQuantity !== undefined ? newQuantity : item.quantity,
        };

        // Check if an item with the same id and new customizations already exists (but different from current item)
        const existingWithNewCustomizations = items.find(
            (i, idx) =>
                idx !== itemIndex &&
                i.id === id &&
                areCustomizationsEqual(i.customizations ?? [], newCustomizations)
        );

        if (existingWithNewCustomizations && !areCustomizationsEqual(oldCustomizations, newCustomizations)) {
            // If different customizations, merge quantities and remove old item
            set({
                items: items
                    .filter((i, idx) => idx !== itemIndex)
                    .map((i) =>
                        i.id === id &&
                        areCustomizationsEqual(i.customizations ?? [], newCustomizations)
                            ? { ...i, quantity: i.quantity + updatedItem.quantity }
                            : i
                    ),
            });
        } else {
            // Update in place
            set({
                items: items.map((i, idx) =>
                    idx === itemIndex ? updatedItem : i
                ),
            });
        }
    },

    clearCart: () => set({ items: [] }),

    getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

    getTotalPrice: () =>
        get().items.reduce((total, item) => {
            const base = item.price;
            const customPrice =
                item.customizations?.reduce(
                    (s: number, c: CartCustomization) => s + c.price,
                    0
                ) ?? 0;
            return total + item.quantity * (base + customPrice);
        }, 0),
}));