import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.SECRET_KEY,
  signOptions: { expiresIn: '1d' }, // tokens will expire in 1 day
};