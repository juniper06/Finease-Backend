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
import { ExpensesService } from './expenses.service';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(+id);
  }

  @Get('startup/:startupId')
  findAllByStartup(@Param('startupId') startupId: string) {
    return this.expensesService.findAllByStartup(+startupId);
  }

  @Post()
  create(@Request() req, @Body() createExpensesDto: CreateExpensesDto) {
    return this.expensesService.create(req.user.id, createExpensesDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpensesDto: UpdateExpensesDto,
  ) {
    return this.expensesService.update(+id, updateExpensesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(+id);
  }

  @Get('ceo/:ceoId')
  findAllByCeo(@Param('ceoId') ceoId: string) {
    return this.expensesService.findAllByCeo(+ceoId);
  }
}
