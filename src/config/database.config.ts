import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // URL completa para conexión a Vercel/Neon
  url: process.env.DATABASE_URL,
  // Parámetros individuales (para compatibilidad hacia atrás)
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USERNAME ?? 'appuser',
  password: process.env.DATABASE_PASSWORD ?? 'apppass',
  database: process.env.DATABASE_NAME ?? 'appdb',
}));
