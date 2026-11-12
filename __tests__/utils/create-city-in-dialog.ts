import { within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { CityReadModel } from '@/lib/dal/city.dal';
import { openDialog } from './open-dialog';
import { orderChoices } from './order-choices';

const [plock] = orderChoices().cities;

/** The City the tests create from the Order form, in Płock's Country. */
export const krakow: CityReadModel = { ...plock, id: 12, name: 'Kraków', postal: '30-001' };

/** Creates Kraków through the Order form's create-City dialog, returning that dialog. */
export async function createCityInDialog(user: UserEvent) {
  const dialog = await openDialog(user, 'Dodaj nowe miejsce', 'Dodawanie nowego miejsca');
  await user.type(within(dialog).getByLabelText('Kod pocztowy'), krakow.postal);
  await user.type(within(dialog).getByLabelText('Nazwa miejscowości'), krakow.name);
  await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));
  return dialog;
}
