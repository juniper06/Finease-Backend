import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateBudgetProposalDto } from './dto/create-budget-proposal.dto';
import {
  UpdateBudgetProposalDto,
  UpdateBudgetProposalStatusDto,
} from './dto/update-budget-proposal.dto';

@Injectable()
export class BudgetProposalService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.budgetProposal.findMany();
  }

  findOne(id: number) {
    return this.prisma.budgetProposal.findUnique({
      where: { id },
      include: {
        budgetBreakdown: true,
      },
    });
  }

  async findAllByCeo(ceoId: number) {
    // Fetch all startups created by the CEO
    const startups = await this.prisma.startup.findMany({
      where: {
        ceoId: ceoId,
      },
    });

    if (startups.length === 0) {
      throw new NotFoundException('No Budget Proposal found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    // Fetch all expenses related to these startups
    return this.prisma.budgetProposal.findMany({
      where: {
        startupId: {
          in: startupIds,
        },
      },
    });
  }

  async create(userId: number, createBudgetProposalDto: CreateBudgetProposalDto) {
    const { budgetBreakdowns, ...budgetProposalData } = createBudgetProposalDto;
  
    // Fetch the user's associated startups
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { startups: true }, // Include associated startups
    });
  
    if (!user || user.startups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }
  
    // Assume the user (e.g., CFO) is assigned to only one startup
    const assignedStartupId = user.startups[0].id;
  
    return this.prisma.budgetProposal.create({
      data: {
        ...budgetProposalData,
        userId: userId,
        startupId: assignedStartupId, // Link the proposal to the startup
        budgetBreakdown: {
          create: budgetBreakdowns.map((budgetBreakdown) => ({
            proposalCategory: budgetBreakdown.proposalCategory,
            allocatedAmount: budgetBreakdown.allocatedAmount,
            description: budgetBreakdown.description,
          })),
        },
      },
    });
  }

  update(id: number, updateBudgetProposal: UpdateBudgetProposalDto) {
    const { budgetBreakdowns, ...budgetProposalData } = updateBudgetProposal;

    return this.prisma.budgetProposal.update({
      where: { id },
      data: {
        ...budgetProposalData,
        budgetBreakdown: {
          deleteMany: {},
          create: budgetBreakdowns?.map((budgetBreakdown) => ({
            proposalCategory: budgetBreakdown.proposalCategory,
            allocatedAmount: budgetBreakdown.allocatedAmount,
            description: budgetBreakdown.description,
          })),
        },
      },
      include: {
        budgetBreakdown: true,
      },
    });
  }

  updateStatus(
    id: number,
    updateBudgetProposalStatusDto: UpdateBudgetProposalStatusDto,
  ) {
    return this.prisma.budgetProposal.update({
      where: { id },
      data: {
        status: updateBudgetProposalStatusDto.status,
        ceoComment: updateBudgetProposalStatusDto.ceoComment,
      },
    });
  }

  remove(id: number) {
    return this.prisma.budgetProposal.delete({ where: { id } });
  }
}
