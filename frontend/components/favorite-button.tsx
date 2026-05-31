'use client';

import { Heart } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favorites as favoritesApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

type FavoriteButtonProps = {
  productId: string;
  compact?: boolean;
};

export function FavoriteButton({ productId, compact }: FavoriteButtonProps) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data: ids = [] } = useQuery({
    queryKey: ['favorite-ids'],
    queryFn: () => favoritesApi.ids(),
    enabled: !!user && user.role === 'CUSTOMER',
    staleTime: 30_000,
  });

  const isFavorite = ids.some((f) => f.productId === productId);

  const toggle = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await favoritesApi.remove(productId);
      } else {
        await favoritesApi.add(productId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (loading || !user || user.role !== 'CUSTOMER') {
    return null;
  }

  return (
    <button
      type="button"
      className={`favorite-btn${compact ? ' favorite-btn--compact' : ''}${isFavorite ? ' is-active' : ''}`}
      aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavorite}
      disabled={toggle.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate();
      }}
    >
      <Heart size={compact ? 18 : 20} strokeWidth={1.75} fill={isFavorite ? 'currentColor' : 'none'} />
      {!compact && <span>{isFavorite ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
