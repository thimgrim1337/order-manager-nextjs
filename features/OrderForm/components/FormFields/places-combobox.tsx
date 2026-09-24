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
import type { City, Country } from '@/types/types';
import { useFieldContext } from '../../context/form-context';
import FormBase, { type FormControlProps } from './form-base';

type PlacesComboboxFieldProps = {
  cities: City[];
  countries: Country[];
  onSearch?: (value: string) => void;
};

export default function PlacesComboboxField(props: FormControlProps & PlacesComboboxFieldProps) {
  const field = useFieldContext<City[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const anchor = useComboboxAnchor();

  const selectedCities = field.state.value;

  return (
    <FormBase {...props}>
      <Combobox
        items={props.cities}
        itemToStringValue={(item: City) => String(item.id)}
        onValueChange={(items: City[]) => field.handleChange(items)}
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
            const country = props.countries.find((country) => country.id === city.countryId)?.code;
            return (
              <ComboboxChip key={city.id} className={'w-full justify-between p-4'}>
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
            {(city: City) => (
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
