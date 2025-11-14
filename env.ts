import { loadEnvConfig } from '@next/env';
import { z } from 'zod';

loadEnvConfig(process.cwd());

const EnvSchema = z.object({
  NODE_ENV: z
    .union([
      z.literal('development'),
      z.literal('testing'),
      z.literal('production'),
    ])
    .default('development'),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.coerce.number(),
  DB_URL: z.string(),
  DB_SEEDING: z.coerce.string(),
  DB_MIGRATING: z.coerce.string(),
  //   DB_MIGRATING: stringBoolean,
  //   ACCESS_TOKEN_SECRET: z.string(),
  //   REFRESH_TOKEN_SECRET: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

const env = EnvSchema.safeParse(process.env);

if (!env.success) {
  console.error(
    'Błąd walidacji zmiennych środowiskowych:\n',
    z.prettifyError(env.error)
  );
  process.exit(1);
}

export const ENV = env.data;
