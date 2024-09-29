import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.item.findMany();
  }

  findOne(id: number) {
    return this.prisma.item.findUnique({ where: { id } });
  }

  async findAllByStartup(startupId: number) {
    return this.prisma.item.findMany({
      where: {
        startupId: startupId,
      },
    });
  }

  async create(userId: number, createItemDto: CreateItemDto) {
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

    return this.prisma.item.create({
      data: {
        type: createItemDto.type,
        name: createItemDto.name,
        unit: createItemDto.unit,
        description: createItemDto.description,
        price: createItemDto.price,
        userId: userId,
        startupId: assignedStartupId,
      },
    });
  }

  update(id: number, updateItemDto: UpdateItemDto) {
    return this.prisma.item.update({
      data: updateItemDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.item.delete({ where: { id } });
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
    return this.prisma.item.findMany({
      where: {
        startupId: {
          in: startupIds,
        },
      },
    });
  }
}
