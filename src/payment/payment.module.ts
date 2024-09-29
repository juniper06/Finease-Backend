import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { InvoiceService } from 'src/invoice/invoice.service';

@Module({
  providers: [PaymentService, InvoiceService],
  controllers: [PaymentController]
})
export class PaymentModule {}
