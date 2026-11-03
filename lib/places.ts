import type { City } from '@/types/types';

export type OrderPlaces = { loadingPlaces: City[]; unloadingPlaces: City[] };

/** The Loading Place the Timeline and the Orders Table show: the Order's first. */
export const firstLoadingPlace = (order: OrderPlaces): City | undefined => order.loadingPlaces[0];

/** The Unloading Place the Timeline and the Orders Table show: the Order's last. */
export const lastUnloadingPlace = (order: OrderPlaces): City | undefined =>
  order.unloadingPlaces.at(-1);
