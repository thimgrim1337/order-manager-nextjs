import type { ReactNode } from 'react';
import { OrderChoicesProvider } from '@/features/shared/context/order-choices-context';
import { getOrderChoices } from '@/features/shared/lib/order-choices';

/** Loads the choices once for a page and provides them to everything below. */
export default async function OrderChoicesLoader({ children }: { children: ReactNode }) {
  return <OrderChoicesProvider choices={await getOrderChoices()}>{children}</OrderChoicesProvider>;
}
