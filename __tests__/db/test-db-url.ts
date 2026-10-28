import { loadEnvConfig } from '@next/env';

/** Connection string of the `db-test` container from docker-compose.yml (database `postgres_test` on `DB_TEST_PORT`). */
export function testDbUrl() {
  loadEnvConfig(process.cwd());
  const { DB_USER, DB_PASSWORD, DB_TEST_PORT } = process.env;

  return `postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_TEST_PORT}/postgres_test`;
}
