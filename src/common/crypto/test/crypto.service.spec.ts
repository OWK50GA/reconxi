jest.mock('../../../config/env', () => ({}));
jest.mock('../../../config/crypto.config', () => ({
  cryptoConfig: { KEY: 'crypto' },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from '../crypto.service';
import { cryptoConfig } from '../../../config/crypto.config';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: cryptoConfig.KEY,
          useValue: {
            encryptionKey: 'a'.repeat(64),
            refreshTokenExpiry: '7d',
            jwtAccessExpiry: '15m',
          },
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
