import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFieldContext } from '../../context/form-context';
import FormBase, { type FormControlProps } from './form-base';

export type SelectData = {
  label: string;
  value: number;
  icon?: ReactNode;
};

export type SelectFieldProps = FormControlProps & {
  data: SelectData[];
  placeholder: string;
  showRecentList?: boolean;
  onTrackValue?: (value: number) => void;
  recentData?: SelectData[];
  children?: ReactNode;
};

export default function SelectField({
  children,
  label,
  icon,
  error,
  data,
  placeholder,
  showRecentList,
  onTrackValue,
  recentData,
}: SelectFieldProps) {
  const field = useFieldContext<number>();

  const selectedValue = field.state.value;
  const selectedItem = data.find((item) => item.value === selectedValue) ?? null;

  const isShowRecentList = showRecentList && recentData && recentData.length > 0;

  const restValues = isShowRecentList
    ? data.filter((d) => !recentData?.find((o) => o.value === d.value))
    : data;

  return (
    <FormBase label={label} icon={icon} error={error}>
      {({ id, isInvalid }) => (
        <>
          <Select
            name={field.name}
            items={data}
            itemToStringLabel={(item: SelectData) => item.label}
            itemToStringValue={(item: SelectData) => String(item.value)}
            onValueChange={(item) => {
              field.handleChange(item ? item.value : 0);
              item && onTrackValue?.(item.value);
            }}
            value={selectedItem && selectedItem}
          >
            <SelectTrigger className="w-45" aria-invalid={isInvalid} id={id}>
              <SelectValue placeholder={placeholder}>
                {(data: SelectData) => (
                  <span className="flex gap-2 items-center">
                    {data?.icon} {data?.label}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {isShowRecentList && (
                <SelectGroup>
                  <SelectLabel>Ostatnio wybierane</SelectLabel>
                  {recentData?.map((item) => (
                    <SelectItem key={item.value} value={item}>
                      {item.icon}
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              <SelectGroup>
                <SelectLabel>{placeholder}</SelectLabel>
                {restValues.map((item) => (
                  <SelectItem key={item.value} value={item}>
                    {item.icon}
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {children}
        </>
      )}
    </FormBase>
  );
}
