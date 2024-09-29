import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.expenses.findMany();
  }

  findOne(id: number) {
    return this.prisma.expenses.findUnique({ where: { id } });
  }

  async findAllByStartup(startupId: number) {
    return this.prisma.expenses.findMany({
      where: {
        startupId: startupId,
      },
      include: {
        categories: true, // Include category details
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async create(userId: number, createExpensesDto: CreateExpensesDto) {
    // Fetch the user's associated startups
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { startups: true }, // Include associated startups
    });

    if (!user || user.startups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    // Assume the CFO is assigned to only one startup
    const assignedStartupId = user.startups[0].id;

    return this.prisma.expenses.create({
      data: {
        transactionDate: createExpensesDto.transactionDate,
        amount: createExpensesDto.amount,
        modeOfPayment: createExpensesDto.modeOfPayment,
        referenceNumber: createExpensesDto.referenceNumber,
        categoryId: createExpensesDto.categoryId,
        userId: userId,
        startupId: assignedStartupId, // Link the expense to the startup
      },
    });
  }

  update(id: number, updateExpensesDto: UpdateExpensesDto) {
    return this.prisma.expenses.update({
      data: updateExpensesDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.expenses.delete({ where: { id } });
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
    return this.prisma.expenses.findMany({
      where: {
        startupId: {
          in: startupIds,
        },
      },
      include: {
        categories: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
  
}
