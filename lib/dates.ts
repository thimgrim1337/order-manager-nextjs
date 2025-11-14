import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export const formatDate = (
  date: Date | number | string | undefined,
  dateFormat: string = 'yyyy-MM-dd'
) => {
  if (!date) return '';

  return format(date, dateFormat, { locale: pl });
};
