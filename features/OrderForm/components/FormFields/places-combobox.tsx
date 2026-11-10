import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import useSearchQuery from '@/features/shared/hooks/use-search-query';
import { searchCities } from '@/lib/actions';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import { countryOf } from '@/lib/places';
import { useFieldContext } from '../../context/form-context';
import FormBase, { type FormControlProps } from './form-base';

type PlacesComboboxFieldProps = {
  cities: CityReadModel[];
  countries: CountryReadModel[];
};

export default function PlacesComboboxField({
  cities: initialData,
  ...props
}: FormControlProps & PlacesComboboxFieldProps) {
  const field = useFieldContext<CityReadModel[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const anchor = useComboboxAnchor();
  const { data: cities, setQuery } = useSearchQuery(searchCities, initialData);

  const selectedCities = field.state.value;

  return (
    <FormBase {...props}>
      <Combobox
        items={cities}
        itemToStringLabel={(item: CityReadModel) => item.name}
        itemToStringValue={(item: CityReadModel) => String(item.id)}
        onInputValueChange={setQuery}
        onValueChange={(items: CityReadModel[]) => field.handleChange(items)}
        isItemEqualToValue={(item, value) => item.id === value.id}
        value={selectedCities}
        multiple
      >
        <ComboboxChips
          ref={anchor}
          aria-invalid={isInvalid}
          className={'flex-col items-start p-2 [&_button]:hover:text-primary'}
        >
          {selectedCities.map((city) => {
            const country = countryOf(city, props.countries)?.code;
            return (
              <ComboboxChip
                key={city.id}
                className={'w-full justify-between p-4'}
                removeLabel={`Usuń ${city.name}`}
              >
                <div className="flex gap-2 text-[.9rem]">
                  <span>{country}</span>
                  <span>{city.postal}</span>
                  <span>{city.name}</span>
                </div>
              </ComboboxChip>
            );
          })}
        </ComboboxChips>
        <ComboboxInput placeholder={'Wybierz miejsce'} aria-invalid={isInvalid} id={field.name} />
        <ComboboxContent>
          <ComboboxEmpty>Nic nie znaleziono.</ComboboxEmpty>
          <ComboboxList>
            {(city: CityReadModel) => (
              <ComboboxItem key={city.id} value={city}>
                {city.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FormBase>
  );
}
