import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UserService } from './user/user.service';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Load environment variables
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configure CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3002';
  app.enableCors({
    origin: [corsOrigin],
    credentials: true,
  });

  // Use global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Create default admin
  const userService = app.get(UserService);
  try {
    await userService.createDefaultAdmin();
    console.log('Default admin created or already exists.');
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }

  // Start the server
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});