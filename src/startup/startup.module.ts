import { Module } from '@nestjs/common';
import { StartupService } from './startup.service';
import { StartupController } from './startup.controller';

@Module({
  providers: [StartupService],
  controllers: [StartupController]
})
export class StartupModule {}
