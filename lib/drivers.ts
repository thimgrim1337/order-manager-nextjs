import type { Driver } from '@/types/types';

/** How a Driver is shown everywhere: first then last name, "Jan Kowalski". */
export const driverName = (driver: Pick<Driver, 'firstName' | 'lastName'>) =>
  `${driver.firstName} ${driver.lastName}`;
