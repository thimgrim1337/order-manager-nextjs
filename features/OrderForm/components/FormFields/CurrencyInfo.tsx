import { CurrencyInfo as TCurrencyInfo } from '@/types/types';
import { Loader2 } from 'lucide-react';

export default function CurrencyInfo({
  selectedCurrency,
  isLoading,
  currencyInfo,
}: {
  selectedCurrency: 'EUR' | 'PLN' | string;
  isLoading: boolean;
  currencyInfo?: TCurrencyInfo | null;
}) {
  if (selectedCurrency !== 'EUR') return null;

  const content = isLoading ? (
    <>
      <Loader2 className='h-3 w-3 animate-spin' />
      <span>Pobieranie kursu waluty...</span>
    </>
  ) : currencyInfo ? (
    <span>
      Tabela nr {currencyInfo.table} z dnia {currencyInfo.date}, 1 EUR ={' '}
      {currencyInfo.rate} PLN
    </span>
  ) : null;

  if (!content) return null;

  return (
    <div className='flex items-center gap-2 text-xs font-normal text-muted-foreground'>
      {content}
    </div>
  );
}
