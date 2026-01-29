import { registerAs } from '@nestjs/config';

export default registerAs('wompi', () => ({
  publicKey: process.env.WOMPI_PUBLIC_KEY,
  privateKey: process.env.WOMPI_PRIVATE_KEY,
  integritySecret: process.env.WOMPI_INTEGRITY_SECRET,
  apiUrl: process.env.WOMPI_API_URL,
}));
