import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '../../../database/utils/abtract-model.action';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserModelAction extends AbstractModelAction<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, User);
  }

  async findByEmailHash(emailHash: string): Promise<User | null> {
    return this.get({ identifierOptions: { emailHash } });
  }
}
