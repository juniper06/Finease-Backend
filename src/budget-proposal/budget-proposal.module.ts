import { Module } from '@nestjs/common';
import { BudgetProposalService } from './budget-proposal.service';
import { BudgetProposalController } from './budget-proposal.controller';

@Module({
  providers: [BudgetProposalService],
  controllers: [BudgetProposalController]
})
export class BudgetProposalModule {}
