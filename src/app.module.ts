import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './common/auth/auth.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthGuard } from './common/auth/auth.guard';
import { ItemModule } from './item/item.module';
import { CustomerModule } from './customer/customer.module';
import { CategoryModule } from './category/category.module';
import { ExpensesModule } from './expenses/expenses.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PaymentModule } from './payment/payment.module';
import { ProjectModule } from './project/project.module';
import { BudgetProposalModule } from './budget-proposal/budget-proposal.module';
import { StartupModule } from './startup/startup.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, PrismaModule, UserModule, ItemModule, CustomerModule, CategoryModule, ExpensesModule, InvoiceModule, PaymentModule, ProjectModule, BudgetProposalModule, StartupModule, AdminModule],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}