import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { BudgetProposalService } from './budget-proposal.service';
import { CreateBudgetProposalDto } from './dto/create-budget-proposal.dto';
import { UpdateBudgetProposalDto, UpdateBudgetProposalStatusDto } from './dto/update-budget-proposal.dto';

@Controller('budget-proposal')
export class BudgetProposalController {
  constructor(private readonly budgetProsalService: BudgetProposalService) {}

  @Get()
  findAll() {
    return this.budgetProsalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetProsalService.findOne(+id);
  }

  @Get('ceo/:ceoId')
  findAllByCeo(@Param('ceoId') ceoId: string) {
    return this.budgetProsalService.findAllByCeo(+ceoId);
  }

  @Post()
  create(@Request() req, @Body() createBudgetProposalDto: CreateBudgetProposalDto) {
    return this.budgetProsalService.create(req.user.id, createBudgetProposalDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetProposalDto: UpdateBudgetProposalDto) {
    return this.budgetProsalService.update(+id, updateBudgetProposalDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateBudgetProposalStatusDto: UpdateBudgetProposalStatusDto) {
    return this.budgetProsalService.updateStatus(+id, updateBudgetProposalStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetProsalService.remove(+id);
  }
}
