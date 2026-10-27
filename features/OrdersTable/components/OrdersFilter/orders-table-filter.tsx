'use client';

import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DateInput from './date-input';
import DriverCombobox from './driver-combobox';
import FilterField from './filter-field';
import OrdersSearch from './orders-search';
import StatusSelect from './status-select';

export default function OrderTableFilter() {
  return (
    <div className="w-full flex flex-col gap-5 border rounded-md px-4 py-2">
      <OrdersSearch />
      <Collapsible>
        <CollapsibleTrigger
          className={
            'w-full flex justify-between text-sm text-muted-foreground cursor-pointer transition-colors duration-300 hover:text-primary'
          }
        >
          Filtrowanie
          <ChevronDown />
        </CollapsibleTrigger>
        <CollapsibleContent className={'flex gap-2 mt-4 '}>
          <FilterField label="Data załadunku od">
            <DateInput filterName="startDate" />
          </FilterField>
          <FilterField label="Data rozładunku do">
            <DateInput filterName="endDate" />
          </FilterField>
          <FilterField label="Kierowca">
            <DriverCombobox />
          </FilterField>
          <FilterField label="Status zlecenia">
            <StatusSelect />
          </FilterField>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
