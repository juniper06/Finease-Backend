import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UserService } from './user/user.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3002'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const userService = app.get(UserService);
  await userService.createDefaultAdmin();

  await app.listen(3001);
}
bootstrap();
