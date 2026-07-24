import { Injectable } from '@nestjs/common';
import { AbstractModelAction } from '../../../database/utils/abtract-model.action';
import { Session } from '../entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SessionModelAction extends AbstractModelAction<Session> {
  constructor(@InjectRepository(Session) repository: Repository<Session>) {
    super(repository, Session);
  }

  findById(id: string): Promise<Session | null> {
    return this.get({ identifierOptions: { id } });
  }
}
