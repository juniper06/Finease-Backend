import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        password: true,
        role: true,
      },
      where: {
        email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }
    const payload = { userId: user.id, role: user.role };
    const secretKey = this.configService.get<string>('SECRET_KEY');
    console.log('Secret Key:', secretKey); // For debugging, remove in production
    return {
      data: {
        token: await this.jwtService.signAsync(payload, { secret: secretKey }),
        role: user.role,
      },
    };
  }
}