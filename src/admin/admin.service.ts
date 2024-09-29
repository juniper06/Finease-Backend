import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestStatus } from 'src/common/enum';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDto } from 'src/user/user.dto';


@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async submitCeoRequest(createUserDto: CreateUserDto) {
    // Store the CEO request in UserRequest model
    const { email, password, firstName, lastName, role } = createUserDto;
    if (role === 'CEO') {
      return this.prisma.userRequest.create({
        data: {
          email,
          password,
          firstName,
          lastName,
          role,
          status: RequestStatus.PENDING,
        },
      });
    }
    throw new Error('Role must be CEO to submit a request');
  }

  async approveCeoRequest(id: number) {
    const request = await this.prisma.userRequest.findUnique({ where: { id } });
    if (!request || request.status !== RequestStatus.PENDING) {
      throw new NotFoundException('Request not found or already processed');
    }

    // Approve the request, create a user
    await this.prisma.user.create({
      data: {
        email: request.email,
        password: request.password,
        firstName: request.firstName,
        lastName: request.lastName,
        role: request.role,
      },
    });

    // Update the request status to APPROVED
    return this.prisma.userRequest.update({
      where: { id },
      data: { status: RequestStatus.APPROVED },
    });
  }

  async rejectCeoRequest(id: number) {
    // Update the request status to REJECTED
    return this.prisma.userRequest.update({
      where: { id },
      data: { status: RequestStatus.REJECTED },
    });
  }

  async listPendingRequests() {
    return this.prisma.userRequest.findMany({
      where: { status: RequestStatus.PENDING },
    });
  }
}
