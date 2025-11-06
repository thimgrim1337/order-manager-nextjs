import { db } from '@/db/db';
import countries from './data/countries.json';
import { country } from '../schemas';

export default async function seed(db: db) {
  await db.insert(country).values(countries);
}
