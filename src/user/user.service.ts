import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { Role } from 'src/common/enum';
import * as bcrypt from 'bcrypt';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminService: AdminService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { role } = createUserDto;

    // If the role is 'CEO', delegate the request to the Admin Service
    if (role === 'CEO') {
      return this.adminService.submitCeoRequest(createUserDto);
    }

    // For CFO, validate and associate with a startup using the startupCode
    if (role === Role.CFO) {
      if (!createUserDto.startupCode) {
        throw new BadRequestException('Startup code is required for CFO.');
      }

      const startup = await this.prisma.startup.findUnique({
        where: { startupCode: createUserDto.startupCode },
      });

      if (!startup) {
        throw new NotFoundException('Invalid startup code.');
      }

      // Create the CFO user and associate them with the startup
      return this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: createUserDto.password,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          role: Role.CFO,
          startups: {
            connect: { id: startup.id },
          },
        },
      });
    }

    // For Guest or any other role, create the user without startup association
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
      },
    });
  }

  async get(id: number) {
    const data = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!data) {
      throw new NotFoundException('User not found.');
    }
    return {
      data,
    };
  }

  async getAll() {
    const data = await this.prisma.user.findMany();
    return {
      data,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const data = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return {
      data,
    };
  }

  async delete(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async createDefaultAdmin() {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '12345';

    const isExist = await this.prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!isExist) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          firstName: 'Admin',
          lastName: 'Account',
        },
      });
      console.log('Default admin account created');
    } else {
      console.log('Default admin account already exists');
    }
  }
}
