'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { OrderChoices } from '@/features/shared/lib/order-choices';

const OrderChoicesContext = createContext<OrderChoices | null>(null);

export const useOrderChoices = () => {
  const ctx = useContext(OrderChoicesContext);

  if (!ctx) throw new Error('useOrderChoices must be used within OrderChoicesProvider');

  return ctx;
};

type OrderChoicesProviderProps = {
  choices: OrderChoices;
  children: ReactNode;
};

/** Hands `choices` to the Order form, the filters and the Timeline below it. */
export function OrderChoicesProvider({ choices, children }: OrderChoicesProviderProps) {
  return <OrderChoicesContext value={choices}>{children}</OrderChoicesContext>;
}
