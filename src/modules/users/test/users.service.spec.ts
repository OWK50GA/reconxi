jest.mock('../../../config/env', () => ({}));
jest.mock('../../../config/app.config', () => ({
  appConfig: { KEY: 'app' },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UserModelAction } from '../actions/users.action';
import { SessionModelAction } from '../actions/sessions.action';
import { CryptoService } from '../../../common/crypto/crypto.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModelAction = {
    findByEmailHash: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
  };

  const mockSessionModelAction = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockCryptoService = {
    sha256: jest.fn(),
    bcrypt_hash: jest.fn(),
    encrypt: jest.fn(),
    getExpiry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserModelAction,
          useValue: mockUserModelAction,
        },
        {
          provide: SessionModelAction,
          useValue: mockSessionModelAction,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
