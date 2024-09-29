import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [AdminModule],
})
export class UserModule {}
