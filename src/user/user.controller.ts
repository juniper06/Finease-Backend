import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/common/auth/auth.decorator';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { AuthRequest } from 'src/common/auth/auth.request';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  create(@Body() userDto: CreateUserDto) {
    return this.userService.create(userDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('get-by-auth')
  getByAuth(@Req() req: AuthRequest) {
    return this.userService.get(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  get(@Param('id') id: number) {
    return this.userService.get(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.userService.delete(id);
  }
}
