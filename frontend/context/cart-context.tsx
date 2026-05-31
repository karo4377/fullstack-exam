'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cart as cartApi, products as productsApi } from '@/lib/api';
import {
  addGuestCartItem,
  clearGuestCart,
  guestCartCount,
  readGuestCart,
  removeGuestCartItem,
  type GuestCartLine,
} from '@/lib/guest-cart';
import { useAuth } from '@/context/auth-context';

export type CartLineView = {
  id: string;
  productId: string;
  quantity: number;
  product?: {
    title?: string;
    priceCents?: number;
    images?: Array<{ url: string }>;
  };
};

type CartContextValue = {
  isGuest: boolean;
  isLoading: boolean;
  items: CartLineView[];
  itemCount: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string, productId?: string) => Promise<void>;
  refresh: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [guestLines, setGuestLines] = useState<GuestCartLine[]>([]);
  const [guestReady, setGuestReady] = useState(false);

  const isCustomer = !!user && user.role === 'CUSTOMER';

  useEffect(() => {
    setGuestLines(readGuestCart());
    setGuestReady(true);
  }, []);

  const { data: serverCart, isLoading: serverLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: isCustomer,
  });

  const guestProductIds = guestLines.map((line) => line.productId).join(',');

  const { data: guestProducts, isLoading: guestProductsLoading } = useQuery({
    queryKey: ['guest-cart-products', guestProductIds],
    queryFn: async () => {
      const results = await Promise.all(
        guestLines.map((line) => productsApi.get(line.productId).catch(() => null)),
      );
      return guestLines.map((line, index) => ({ line, product: results[index] }));
    },
    enabled: !isCustomer && guestReady && guestLines.length > 0,
  });

  const items: CartLineView[] = useMemo(() => {
    if (isCustomer) {
      const raw = (serverCart?.items as Array<Record<string, unknown>>) ?? [];
      return raw.map((item) => ({
        id: String(item.id),
        productId: String((item.product as { id?: string })?.id ?? item.productId ?? ''),
        quantity: Number(item.quantity ?? 0),
        product: item.product as CartLineView['product'],
      }));
    }
    return (guestProducts ?? []).map(({ line, product }) => ({
      id: line.productId,
      productId: line.productId,
      quantity: line.quantity,
      product: product
        ? {
            title: String(product.title),
            priceCents: Number(product.priceCents),
            images: (product.images as Array<{ url: string }>) ?? [],
          }
        : undefined,
    }));
  }, [isCustomer, serverCart, guestProducts]);

  const itemCount = isCustomer
    ? items.reduce((sum, line) => sum + line.quantity, 0)
    : guestCartCount(guestLines);

  const refresh = useCallback(() => {
    if (isCustomer) {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } else {
      setGuestLines(readGuestCart());
    }
  }, [isCustomer, queryClient]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      if (isCustomer) {
        await cartApi.addItem(productId, quantity);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        return;
      }
      const next = addGuestCartItem(productId, quantity);
      setGuestLines(next);
    },
    [isCustomer, queryClient],
  );

  const removeItem = useCallback(
    async (lineId: string, productId?: string) => {
      if (isCustomer) {
        await cartApi.removeItem(lineId);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        return;
      }
      const id = productId ?? lineId;
      const next = removeGuestCartItem(id);
      setGuestLines(next);
      queryClient.invalidateQueries({ queryKey: ['guest-cart-products'] });
    },
    [isCustomer, queryClient],
  );

  const isLoading =
    authLoading ||
    (isCustomer ? serverLoading : !guestReady || (guestLines.length > 0 && guestProductsLoading));

  const value = useMemo(
    () => ({ isGuest: !isCustomer, isLoading, items, itemCount, addItem, removeItem, refresh }),
    [isCustomer, isLoading, items, itemCount, addItem, removeItem, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
