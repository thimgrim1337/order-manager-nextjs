import type { CityReadModel } from '@/lib/dal/city.dal';
import type { OrderReadModel } from '@/lib/dal/order.dal';

/** A Loading or Unloading Place of an Order: the City, with its Country, in that role. */
export type PlaceReadModel = CityReadModel;

// The orders_with_details view picks the same Places for the Orders Table's sort and Search.
export type OrderPlaces = Pick<OrderReadModel, 'loadingPlaces' | 'unloadingPlaces'>;

/** The Loading Place the Timeline and the Orders Table show: the Order's first. */
export const firstLoadingPlace = (order: OrderPlaces): PlaceReadModel | undefined =>
  order.loadingPlaces[0];

/** The Unloading Place the Timeline and the Orders Table show: the Order's last. */
export const lastUnloadingPlace = (order: OrderPlaces): PlaceReadModel | undefined =>
  order.unloadingPlaces.at(-1);
