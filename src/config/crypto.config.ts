import { registerAs } from '@nestjs/config';
import { env } from './env';

export const cryptoConfig = registerAs('crypto', () => ({
  encryptionKey: env.SECRET_MANAGER_ENCRYPTION_KEY,
  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtAccessExpiry: env.JWT_ACCESS_EXPIRES_IN,
  refreshTokenExpiry: env.REFRESH_EXPIRES_IN,
}));
