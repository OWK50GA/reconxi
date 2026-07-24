import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CryptoService } from '../../common/crypto/crypto.service';
import { User } from './entities/user.entity';
import { UserModelAction } from './actions/users.action';
import { SYS_MSG } from '../../common/constants/sys-msg';
import { noTransaction } from '../../common/constants/transaction-options';
import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from './entities/session.entity';
import { parseExpiryMs } from '../../common/utils';
import { SessionModelAction } from './actions/sessions.action';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationMeta } from '../../common/responses/standard-response';

/**
 * A session can only live up to 30 days. Even if a session
 * keeps getting refreshed, the user must put password after every 30
 * days, and create a new session
 */
const SESSION_ABSOLUTE_MAX_MS = parseExpiryMs('30d');

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userModelAction: UserModelAction,
    private readonly sessionModelAction: SessionModelAction,
  ) {}

  private async validateAndEncryptCredentials(dto: CreateUserDto): Promise<{
    encryptedEmail: string;
    emailHash: string;
    passwordHash: string;
  }> {
    const emailHash = this.cryptoService.sha256(dto.email);
    const existing = await this.userModelAction.findByEmailHash(emailHash);
    if (existing) throw new ConflictException(SYS_MSG.REQ_CYCLE.CONFLICT);

    const encryptedEmail = this.cryptoService.encrypt(dto.email);
    const passwordHash = await this.cryptoService.bcrypt_hash(dto.password);

    return {
      encryptedEmail,
      emailHash,
      passwordHash,
    };
  }

  async create(dto: CreateUserDto): Promise<User> {
    const { firstName, lastName } = dto;
    const { encryptedEmail, passwordHash, emailHash } =
      await this.validateAndEncryptCredentials(dto);

    return this.userModelAction.create({
      ...noTransaction(),
      createPayload: {
        email: encryptedEmail,
        emailHash,
        passwordHash,
        firstName,
        lastName,
      },
    });
  }

  async createSession(
    userId: string,
    dto?: CreateSessionDto,
  ): Promise<Session> {
    const expiresAt = new Date(
      Date.now() + this.cryptoService.getExpiry('refresh'),
    );

    return this.sessionModelAction.create({
      ...noTransaction(),
      createPayload: {
        userId,
        ...(dto?.deviceName && { deviceName: dto.deviceName.slice(0, 100) }),
        ...(dto?.ipAddress && { ipAddress: dto.ipAddress.slice(0, 45) }),
        ...(dto?.platform && { platform: dto.platform.slice(0, 20) }),
        ...(dto?.userAgent && { userAgent: dto.userAgent }),
        expiresAt,
      },
    });
  }

  async findSessionById(sessionId: string): Promise<Session> {
    const session = await this.sessionModelAction.findById(sessionId);
    if (!session)
      throw new UnauthorizedException(SYS_MSG.AUTH.INVALID_SESSION_ID);

    return this.validateSession(session);
  }

  async validateSession(session: Session): Promise<Session> {
    if (!session.isActive)
      throw new UnauthorizedException(SYS_MSG.AUTH.SESSION_EXPIRED);

    const now = Date.now();

    // Absolute lifetime cap - sessions cannot outlive 30 days from creation
    const absoluteExpiry =
      session.createdAt.getTime() + SESSION_ABSOLUTE_MAX_MS;
    if (now > absoluteExpiry) {
      await this.sessionModelAction.update({
        ...noTransaction(),
        identifierOptions: { id: session.id },
        updatePayload: { isActive: false },
      });
      throw new UnauthorizedException(SYS_MSG.AUTH.SESSION_EXPIRED);
    }

    // Sliding window expiry
    if (session.expiresAt && now > session.expiresAt.getTime()) {
      await this.sessionModelAction.update({
        ...noTransaction(),
        identifierOptions: { id: session.id },
        updatePayload: { isActive: false },
      });
      throw new UnauthorizedException(SYS_MSG.AUTH.SESSION_EXPIRED);
    }

    return session;
  }

  findAll(pagination: PaginationDto): Promise<{
    payload: User[];
    paginationMeta: PaginationMeta;
  }> {
    return this.userModelAction.list({
      paginationPayload: {
        page: pagination.page ?? 1,
        limit: pagination.limit ?? 20,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModelAction.get({
      identifierOptions: { id },
    });
    if (!user) throw new NotFoundException(SYS_MSG.REQ_CYCLE.NOT_FOUND);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const emailHash = this.cryptoService.sha256(email);
    return this.userModelAction.findByEmailHash(emailHash);
  }
}
