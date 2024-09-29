import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany();
  }

  findOne(id: number) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  async findAllByStartup(startupId: number) {
    return this.prisma.customer.findMany({
      where: {
        startupId: startupId,
      },
    });
  }

  async create(userId: number, createCustomerDto: CreateCustomerDto) {
    // Fetch the user's associated startups
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { startups: true }, // Include associated startups
    });

    if (!user || user.startups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    // Assume the user (e.g. CFO) is assigned to only one startup
    const assignedStartupId = user.startups[0].id;

    return this.prisma.customer.create({
      data: {
        firstName: createCustomerDto.firstName,
        lastName: createCustomerDto.lastName,
        companyName: createCustomerDto.companyName,
        email: createCustomerDto.email,
        phoneNumber: createCustomerDto.phoneNumber,
        country: createCustomerDto.country,
        city: createCustomerDto.city,
        state: createCustomerDto.state,
        zipCode: createCustomerDto.zipCode,
        type: createCustomerDto.type,
        userId: userId,
        startupId: assignedStartupId,
      },
    });
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      data: updateCustomerDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.customer.delete({ where: { id } });
  }

  async findAllByCeo(ceoId: number) {
    // Fetch all startups created by the CEO
    const startups = await this.prisma.startup.findMany({
      where: {
        ceoId: ceoId,
      },
    });

    if (startups.length === 0) {
      throw new NotFoundException('No startups found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    // Fetch all expenses related to these startups
    return this.prisma.customer.findMany({
      where: {
        startupId: {
          in: startupIds,
        },
      },
    });
  }
}
