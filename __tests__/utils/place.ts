import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import type { PlaceReadModel } from '@/lib/places';

/** `city` as an Order's Loading or Unloading Place: with its Country, as the Order read model gives it. */
export const place = (city: CityReadModel, country: CountryReadModel): PlaceReadModel => ({
  ...city,
  country,
});
