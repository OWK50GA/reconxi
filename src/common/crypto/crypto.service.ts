import { Inject, Injectable } from '@nestjs/common';
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from 'crypto';
import { type ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { cryptoConfig } from '../../config/crypto.config';
import { parseExpiryMs } from '../utils';

@Injectable()
export class CryptoService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 12;
  private readonly TAG_LENGTH = 16;

  constructor(
    @Inject(cryptoConfig.KEY)
    private readonly cryptoCfg: ConfigType<typeof cryptoConfig>,
  ) {}

  private getKey(): Buffer {
    const key = this.cryptoCfg.encryptionKey;
    if (!key || !/^[0-9a-fA-F]{64}$/.test(key)) {
      throw new Error('ENCRYPTION_KEY must be 64 hex characters');
    }

    return Buffer.from(key, 'hex');
  }

  getExpiry(token: 'refresh' | 'jwt'): number {
    switch (token) {
      case 'refresh': {
        const refreshTokenExpiry = this.cryptoCfg.refreshTokenExpiry;
        return parseExpiryMs(refreshTokenExpiry);
      }
      case 'jwt': {
        const jwtExpiry = this.cryptoCfg.jwtAccessExpiry;
        return parseExpiryMs(jwtExpiry);
      }
      default:
        return 0;
    }
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, this.getKey(), iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(cipherText: string): string {
    const data = Buffer.from(cipherText, 'base64');

    const iv = data.subarray(0, this.IV_LENGTH);
    const tag = data.subarray(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
    const encrypted = data.subarray(this.IV_LENGTH + this.TAG_LENGTH);

    const decipher = createDecipheriv(this.ALGORITHM, this.getKey(), iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  sha256(preimage: string): string {
    return createHash('sha256').update(preimage).digest('hex');
  }

  bcrypt_hash(preimage: string, rounds = 10): Promise<string> {
    return bcrypt.hash(preimage, rounds);
  }

  bcrypt_compare(preimage: string, hash: string): Promise<boolean> {
    return bcrypt.compare(preimage, hash);
  }
}
