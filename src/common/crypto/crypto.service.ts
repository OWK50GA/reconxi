import { Inject, Injectable } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
import { appConfig } from '../../config/app.config';
import { type ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
    private readonly ALGORITHM = 'aes-256-gcm';
    private readonly IV_LENGTH = 12;
    private readonly TAG_LENGTH = 16;

    constructor(
        @Inject(appConfig.KEY)
        private readonly appCfg: ConfigType<typeof appConfig>
    ) {}

    private getKey(): Buffer {
        const key = this.appCfg.encryptionKey;
        if (!key || key.length !== 64) throw new Error('ENCRYPTION_KEY must be 64 hex characters');

        return Buffer.from(key, 'hex');
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
        const data = Buffer.from(cipherText, 'base64')

        const iv = data.subarray(0, this.IV_LENGTH);
        const tag = data.subarray(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
        const encrypted = data.subarray(this.IV_LENGTH + this.TAG_LENGTH);

        const decipher = createDecipheriv(this.ALGORITHM, this.getKey(), iv);
        decipher.setAuthTag(tag);

        return Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
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