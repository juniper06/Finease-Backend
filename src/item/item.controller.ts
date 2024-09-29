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
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Get('startup/:startupId')
  findAllByStartup(@Param('startupId') startupId: string) {
    return this.itemService.findAllByStartup(+startupId);
  }

  @Post()
  create(@Request() req, @Body() createItemDto: CreateItemDto) {
    return this.itemService.create(req.user.id, createItemDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }

  @Get('ceo/:ceoId')
  findAllByCeo(@Param('ceoId') ceoId: string) {
    return this.itemService.findAllByCeo(+ceoId);
  }
}
