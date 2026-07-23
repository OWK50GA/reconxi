import { Global, Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '../../config/app.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(appConfig)],
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
