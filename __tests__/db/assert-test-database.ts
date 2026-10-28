/** Throws unless `url` points at the `db-test` database, so tests that seed, truncate or migrate never reach dev data. */
export function assertTestDatabase(url: string | undefined) {
  if (!url || new URL(url).pathname !== '/postgres_test') {
    throw new Error(
      'Expected the db-test database (postgres_test); is NODE_ENV=test and .env.test loaded?',
    );
  }
}
