import { Controller, Get, Patch, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('requests')
  listPendingRequests() {
    return this.adminService.listPendingRequests();
  }

  @Patch('approve/:id')
  approveRequest(@Param('id') id: number) {
    return this.adminService.approveCeoRequest(id);
  }

  @Patch('reject/:id')
  rejectRequest(@Param('id') id: number) {
    return this.adminService.rejectCeoRequest(id);
  }
}
