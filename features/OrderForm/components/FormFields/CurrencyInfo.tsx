import { CurrencyInfo as TCurrencyInfo } from '@/types/types';
import { CircleIcon } from 'lucide-react';

export default function CurrencyInfo({
  selectedCurrency,
  isLoading,
  currencyInfo,
}: {
  selectedCurrency: 'EUR' | 'PLN' | string;
  isLoading: boolean;
  currencyInfo?: TCurrencyInfo;
}) {
  if (selectedCurrency === 'EUR' && currencyInfo) {
    const { date, rate, table } = currencyInfo;

    return (
      <div className='text-xs font-normal text-muted-foreground'>
        {isLoading && <CircleIcon className='animate-spin' />}
        {currencyInfo && (
          <span>
            Tabela nr {table} z dnia {date}, 1 EUR = {rate} PLN
          </span>
        )}
      </div>
    );
  }
}
