import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from '../crypto.service';
import { appConfig } from '../../../config/app.config';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: appConfig.KEY,
          useValue: {
            encryptionKey: 'a'.repeat(64),
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
