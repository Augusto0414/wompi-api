import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5433', 10),
  username: process.env.DATABASE_USERNAME ?? 'appuser',
  password: process.env.DATABASE_PASSWORD ?? 'apppass',
  database: process.env.DATABASE_NAME ?? 'appdb',
}));
