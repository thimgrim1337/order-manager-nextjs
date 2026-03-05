import CreateOrderForm from '@/features/OrderForm/components/create-order-form';
import { render } from '@testing-library/react';
import { beforeAll, vi } from 'vitest';

beforeAll(() => {
  render(
    <CreateOrderForm
      cities={[{ id: 1, countryId: 1, name: 'Płock', postal: '09-410' }]}
      countries={[{ id: 1, code: 'PL', name: 'Polska' }]}
      customers={[{ id: 1, name: 'DEVIL Express', tax: 'PL7743241555' }]}
      drivers={[{ id: 1, firstName: 'Dawid', lastName: 'Dygner' }]}
      trucks={[
        {
          id: 1,
          driverId: 1,
          insuranceEndAt: '2026-03-01',
          plate: 'WND0997C',
          serviceEndAt: '2026-03-01',
        },
      ]}
      onDialogClose={vi.fn()}
    />,
  );
});
