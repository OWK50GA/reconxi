import { Column, Entity } from "typeorm";
import { AbstractBaseEntity } from "../../../database/entities/abstract-base.entity";
import { Exclude } from "class-transformer";
import { UserRole } from "../../../common/enums";

@Entity('users')
export class User extends AbstractBaseEntity {
    @Column({ type: 'text', unique: true })
    email: string; // this is encrypted

    @Column({ type: 'varchar', length: 255 })
    emailHash: string;

    @Exclude()
    @Column({ type: 'varchar', length: 255, nullable: true })
    passwordHash?: string;

    @Column({ type: 'varchar', length: 255 })
    firstName: string;

    @Column({ type: 'varchar', length: 255 })
    lastName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    googleId?: string;

    @Column({ type: 'boolean', default: false })
    emailVerified: boolean;

    @Column({ type: 'boolean', default: false })
    isInvitedUser: boolean;

    @Column({ type: 'uuid', nullable: true })
    organizationId?: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phoneNumber?: string; // this is encrypted

    @Column({ type: 'varchar', length: 255, nullable: true })
    phoneNumberHash?: string;
}