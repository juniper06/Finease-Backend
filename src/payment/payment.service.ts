import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService,
  ) {}

  findAll() {
    return this.prisma.payment.findMany();
  }

  findOne(id: number) {
    return this.prisma.payment.findUnique({ where: { id } });
  }

  async findAllByStartup(startupId: number) {
    return this.prisma.payment.findMany({
      where: {
        startupId: startupId,
      },
    });
  }

  async create(userId: number, createPaymentDto: CreatePaymentDto) {
    const {
      customerId,
      dateOfPayment,
      paymentNumber,
      modeOfPayment,
      referenceNumber,
      totalAmount,
      payments,
    } = createPaymentDto;
  
    // Fetch the user's associated startups
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { startups: true }, // Include associated startups
    });
  
    if (!user || user.startups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }
  
    // Assume the user is assigned to only one startup
    const assignedStartupId = user.startups[0].id;
  
    const createdPayment = await this.prisma.payment.create({
      data: {
        user: { connect: { id: userId } },
        customers: { connect: { id: customerId } },
        startup: { connect: { id: assignedStartupId } }, // Connect to the startup
        dateOfPayment,
        paymentNumber,
        modeOfPayment,
        referenceNumber,
        totalAmount,
        paymentItems: {
          create: payments.map((payment) => ({
            amount: payment.amount,
            invoice: { connect: { id: payment.invoiceId } },
          })),
        },
      },
      include: {
        paymentItems: {
          include: {
            invoice: true,
          },
        },
      },
    });
  
    for (const payment of payments) {
      await this.invoiceService.updateStatus(payment.invoiceId);
    }
  
    return createdPayment;
  }
  
  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const {
      customerId,
      dateOfPayment,
      modeOfPayment,
      referenceNumber,
      paymentNumber,
      payments,
    } = updatePaymentDto;

    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found.`);
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        customerId,
        dateOfPayment,
        modeOfPayment,
        referenceNumber,
        paymentNumber,
        totalAmount: payments.reduce((sum, item) => sum + item.amount, 0),
        paymentItems: {
          deleteMany: {},
          create: payments.map((item) => ({
            amount: item.amount,
            invoice: { connect: { id: item.invoiceId } },
          })),
        },
      },
      include: {
        paymentItems: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.payment.delete({ where: { id } });
  }

  async findAllByCeo(ceoId: number) {
    // Fetch all startups created by the CEO
    const startups = await this.prisma.startup.findMany({
      where: {
        ceoId: ceoId,
      },
    });

    if (startups.length === 0) {
      throw new NotFoundException('No startups found for this CEO');
    }

    const startupIds = startups.map((startup) => startup.id);

    // Fetch all expenses related to these startups
    return this.prisma.payment.findMany({
      where: {
        startupId: {
          in: startupIds,
        },
      },
    });
  }
}
