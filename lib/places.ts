import type { City } from '@/types/types';

// The orders_with_details view picks the same Places for the Orders Table's sort and Search.
export type OrderPlaces = { loadingPlaces: City[]; unloadingPlaces: City[] };

/** The Loading Place the Timeline and the Orders Table show: the Order's first. */
export const firstLoadingPlace = (order: OrderPlaces): City | undefined => order.loadingPlaces[0];

/** The Unloading Place the Timeline and the Orders Table show: the Order's last. */
export const lastUnloadingPlace = (order: OrderPlaces): City | undefined =>
  order.unloadingPlaces.at(-1);
