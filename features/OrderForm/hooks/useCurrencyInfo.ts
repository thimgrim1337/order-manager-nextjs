import { getCurrencyRate } from '@/lib/dal/nbpApiDAL';
import { getHolidays } from '@/lib/dal/openHolidaysApiDAL';
import { getToday } from '@/lib/dates';
import { getValidCurrencyDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export default function useCurrencyInfo(date: string) {
  const [validDate, setValidDate] = useState<string>(getToday());

  const holidays = useQuery({
    queryKey: ['holidays'],
    queryFn: () => getHolidays(),
  });

  const {
    data: rate,
    isLoading: isRateLoading,
    isError: isRateError,
    error: rateErrorMsg,
  } = useQuery({
    queryKey: ['currencyRate', validDate],
    queryFn: () => getCurrencyRate(validDate),
    retry: false,
    enabled: !!validDate,
  });

  useEffect(() => {
    if (holidays.data?.length) {
      const validDate = getValidCurrencyDate(date, holidays.data);
      setValidDate(validDate);
    } else if (!holidays.isLoading) {
      setValidDate(date);
    }
  }, [date]);

  return {
    rate,
    isRateLoading,
    isRateError,
    rateErrorMsg,
  };
}
