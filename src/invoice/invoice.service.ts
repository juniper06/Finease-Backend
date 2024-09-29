import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.invoice.findMany();
  }

  findOne(id: number) {
    return this.prisma.invoice.findUnique({ where: { id } });
  }

  async create(userId: number, createInvoiceDto: CreateInvoiceDto) {
    const { items, ...invoiceData } = createInvoiceDto;

    const total = items.reduce((acc, item) => acc + item.amount, 0);

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

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        total,
        balanceDue: total,
        status: 'pending',
        startupId: assignedStartupId, // Link the invoice to the startup
        items: {
          create: items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
          })),
        },
      },
    });
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    const { items, ...invoiceData } = updateInvoiceDto;

    const total = items ? items.reduce((acc, item) => acc + item.amount, 0) : 0;

    return this.prisma.invoice.update({
      data: {
        ...invoiceData,
        total,
        items: items
          ? {
              deleteMany: {},
              create: items.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price,
                amount: item.amount,
              })),
            }
          : undefined,
      },
      where: { id },
    });
  }

  remove(id: number) {
    return this.prisma.invoice.delete({ where: { id } });
  }

  async findByCustomerId(customerId: number) {
    return this.prisma.invoice.findMany({
      where: { customerId },
    });
  }

  async updateStatus(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { paymentItems: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found.`);
    }

    const totalPaid = invoice.paymentItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const balanceDue = invoice.total - totalPaid;

    let status = 'pending';
    if (balanceDue <= 0) {
      status = 'paid';
    } else if (totalPaid > 0) {
      status = 'partially paid';
    } else if (new Date(invoice.dueDate) < new Date()) {
      status = 'overdue';
    }

    return this.prisma.invoice.update({
      where: { id },
      data: { status, balanceDue },
    });
  }
}
