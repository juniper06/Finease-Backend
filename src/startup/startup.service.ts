import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';

@Injectable()
export class StartupService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.startup.findMany();
  }

  async getStartup(id: number) {
    const startup = await this.prisma.startup.findUnique({
      where: { id },
      include: {
        cfoUsers: true,
        ceo: true,
        expenses: true,
        customers: true,
        items: true,
        invoice: true,
        payment: true,
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    return startup;
  }

  create(createStartupDto: CreateStartupDto) {
    return this.prisma.startup.create({
      data: {
        startupName: createStartupDto.startupName,
        startupDescription: createStartupDto.startupDescription,
        startupType: createStartupDto.startupType,
        phoneNumber: createStartupDto.phoneNumber,
        contactEmail: createStartupDto.contactEmail,
        location: createStartupDto.location,
        startupCode: createStartupDto.startupCode,
        ceo: { connect: { id: createStartupDto.userId } }, // Correctly assign the CEO
      },
    });
  }

  update(id: number, updateStartupDto: UpdateStartupDto) {
    return this.prisma.startup.update({
      data: updateStartupDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.startup.delete({ where: { id } });
  }
  async getStartupByCode(startupCode: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { startupCode },
    });

    if (!startup) {
      throw new NotFoundException(
        'Startup with the provided code does not exist.',
      );
    }

    return startup;
  }
}
