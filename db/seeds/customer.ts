import { db } from '@/db/db';
import customers from './data/customers.json';
import { customer } from '../schemas';

export default async function seed(db: db) {
  await db.insert(customer).values(customers);
}
