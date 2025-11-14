import { migrate } from 'drizzle-orm/postgres-js/migrator';
import config from '../drizzle.config';
import db from './db';
import { ENV } from '@/env';

async function migartion() {
  if (!ENV.DB_MIGRATING) {
    throw new Error(
      'You must set DB_MIGRATING to "true" when running migration.'
    );
  }

  await migrate(db, { migrationsFolder: config.out! });
}

migartion();
