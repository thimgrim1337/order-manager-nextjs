import { getCities } from '@/lib/dal/city.dal';
import { getAllCountries } from '@/lib/dal/country.dal';
import { getAllCurrencies } from '@/lib/dal/currency.dal';
import { getCustomers } from '@/lib/dal/customer.dal';
import { getAllDrivers } from '@/lib/dal/driver.dal';
import { getAllTrucks } from '@/lib/dal/truck.dal';

/** What the Order form and the filters choose from, each list cached under its own tag. */
export async function getOrderChoices() {
  const [customers, cities, drivers, trucks, countries, currencies] = await Promise.all([
    getCustomers(),
    getCities(),
    getAllDrivers(),
    getAllTrucks(),
    getAllCountries(),
    getAllCurrencies(),
  ]);

  return { customers, cities, drivers, trucks, countries, currencies };
}

export type OrderChoices = Awaited<ReturnType<typeof getOrderChoices>>;
