import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StartupService } from './startup.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';

@Controller('startup')
export class StartupController {
  constructor(private readonly startupService: StartupService) {}

  @Get()
  findAll() {
    return this.startupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.startupService.getStartup(+id);
  }

  @Post()
  create(@Body() createStartupDto: CreateStartupDto) {
    return this.startupService.create(createStartupDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStartupDto: UpdateStartupDto) {
    return this.startupService.update(+id, updateStartupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.startupService.remove(+id);
  }
}
