import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService, // Ensure JwtService is injected
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.checkAuth(payload.userId);
      request['user'] = user;
      return !!user;
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }

  async checkAuth(userId: number) {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid userId');
    }
    return {
      id: user.id,
    };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
