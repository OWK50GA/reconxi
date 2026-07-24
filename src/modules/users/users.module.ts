import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserModelAction } from './actions/users.action';
import { SessionModelAction } from './actions/sessions.action';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserModelAction, SessionModelAction],
  exports: [UsersService, UserModelAction, SessionModelAction],
})
export class UsersModule {}
