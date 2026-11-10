import type { DriverReadModel } from '@/lib/dal/driver.dal';

/** How a Driver is shown everywhere: first then last name, "Jan Kowalski". */
export const driverName = (driver: Pick<DriverReadModel, 'firstName' | 'lastName'>) =>
  `${driver.firstName} ${driver.lastName}`;
