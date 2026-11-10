import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CountryReadModel } from '@/lib/dal/country.dal';

// The orders_with_details view picks the same Places for the Orders Table's sort and Search.
export type OrderPlaces = { loadingPlaces: CityReadModel[]; unloadingPlaces: CityReadModel[] };

/** The Loading Place the Timeline and the Orders Table show: the Order's first. */
export const firstLoadingPlace = (order: OrderPlaces): CityReadModel | undefined =>
  order.loadingPlaces[0];

/** The Unloading Place the Timeline and the Orders Table show: the Order's last. */
export const lastUnloadingPlace = (order: OrderPlaces): CityReadModel | undefined =>
  order.unloadingPlaces.at(-1);

/** The City's Country among `countries`; undefined when it is not among them. */
export const countryOf = (
  city: CityReadModel,
  countries: CountryReadModel[],
): CountryReadModel | undefined => countries.find((country) => country.id === city.countryId);
