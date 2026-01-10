'use client';

import { useCartFavoritesSync } from '@/hooks/useCartFavoritesSync';

export function CartFavoritesSyncProvider({ children }: { children: React.ReactNode }) {
  useCartFavoritesSync();
  return <>{children}</>;
}

