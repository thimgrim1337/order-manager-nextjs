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
import { searchCities } from '@/lib/actions';
import type { CityReadModel } from '@/lib/dal/city.dal';
import { useFieldContext } from '../../context/form-context';
import useSearchedChoices from '../../hooks/use-searched-choices';
import FormBase, { type FormControlProps } from './form-base';

type PlacesComboboxFieldProps = {
  cities: CityReadModel[];
};

export default function PlacesComboboxField({
  cities: initialData,
  label,
  icon,
  error,
}: FormControlProps & PlacesComboboxFieldProps) {
  const field = useFieldContext<CityReadModel[]>();
  const anchor = useComboboxAnchor();
  const selectedCities = field.state.value;
  const { choices: cities, setSearchText } = useSearchedChoices({
    search: searchCities,
    startingChoices: initialData,
    picked: selectedCities,
  });

  return (
    <FormBase label={label} icon={icon} error={error}>
      {({ id, isInvalid }) => (
        <Combobox
          items={cities}
          itemToStringLabel={(item: CityReadModel) => item.name}
          itemToStringValue={(item: CityReadModel) => String(item.id)}
          onInputValueChange={setSearchText}
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
            {selectedCities.map((city) => (
              <ComboboxChip
                key={city.id}
                className={'w-full justify-between p-4'}
                removeLabel={`Usuń ${city.name}`}
              >
                <div className="flex gap-2 text-[.9rem]">
                  <span>{city.country.code}</span>
                  <span>{city.postal}</span>
                  <span>{city.name}</span>
                </div>
              </ComboboxChip>
            ))}
          </ComboboxChips>
          <ComboboxInput placeholder={'Wybierz miejsce'} aria-invalid={isInvalid} id={id} />
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
      )}
    </FormBase>
  );
}
