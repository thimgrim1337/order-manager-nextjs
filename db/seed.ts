import { getTableName, sql, Table } from 'drizzle-orm';
import { db } from '@/db/db';
import * as schema from './schemas/index';
import * as seeds from './seeds/index';
import { ENV } from '@/env';

async function resetTable(db: db, table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
  );
}
async function dropTable(db: db, table: Table) {
  return db.execute(
    sql.raw(`DROP TABLE IF EXISTS ${getTableName(table)} CASCADE`)
  );
}

async function seed() {
  if (!ENV.DB_SEEDING) {
    throw new Error('You must set DB_SEEDING to "true" when running seeds.');
  }

  for (const table of [
    schema.driver,
    schema.truck,
    schema.status,
    schema.country,
    schema.city,
    schema.customer,
    schema.order,
    schema.loadingPlace,
    schema.unloadingPlace,
  ]) {
    await resetTable(db, table);
  }

  await seeds.customer(db);
  await seeds.driver(db);
  await seeds.truck(db);
  await seeds.status(db);
  await seeds.country(db);

  console.log('Seeds finished.');
}

seed();
