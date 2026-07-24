import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../database/entities/abstract-base.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity('user_sessions')
export class Session extends AbstractBaseEntity {
  @Index('idxSessionUserId')
  @Column({ type: 'uuid' })
  userId: string;

  @Exclude()
  @Index('idxSessionRefreshTokenHash')
  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshTokenHash: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  platform?: string; // 'ios', 'android', 'web'

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceToken?: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  lastActivityAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
