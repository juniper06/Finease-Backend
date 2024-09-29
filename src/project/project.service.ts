import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany();
  }

  async findAllByStartup(startupId: number) {
    return this.prisma.project.findMany({
      where: {
        startupId: startupId,
      },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        projectUsers: true,
        ProjectResources: true,
        customer: true,
      },
    });
    if (project) {
      return {
        ...project,
        customerName: `${project.customer.firstName} ${project.customer.lastName}`,
      };
    }
    return null;
  }

  async create(userId: number, createProjectDto: CreateProjectDto) {
    const { users, resources, customerId, ...projectData } = createProjectDto;

    // Fetch the user's associated startups
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { startups: true },
    });

    if (!user || user.startups.length === 0) {
      throw new NotFoundException('User does not belong to any startup');
    }

    // Assume the user is assigned to only one startup
    const assignedStartupId = user.startups[0].id;

    // Create the project and link with customer, startup, and associated users and resources
    return this.prisma.project.create({
      data: {
        ...projectData,
        userId: userId,
        customerId: customerId,
        startupId: assignedStartupId,
        projectUsers: {
          create: users.map((user) => ({
            userName: user.userName,
            userEmail: user.userEmail,
          })),
        },
        ProjectResources: {
          create: resources.map((resource) => ({
            resourceCategory: resource.resourceCategory,
            subCategory: resource.subCategory,
            expense: resource.expense,
          })),
        },
      },
    });
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    const { users, resources, ...projectData } = updateProjectDto;

    return this.prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        projectUsers: {
          deleteMany: {},
          create: users?.map((user) => ({
            userName: user.userName,
            userEmail: user.userEmail,
          })),
        },
        ProjectResources: {
          deleteMany: {},
          create: resources?.map((resource) => ({
            resourceCategory: resource.resourceCategory,
            subCategory: resource.subCategory,
            expense: resource.expense,
          })),
        },
      },
      include: {
        projectUsers: true,
        ProjectResources: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.project.delete({ where: { id } });
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
  
    return this.prisma.project.findMany({
      where: {
        startupId: {
          in: startupIds,
        },
      },
    });
  }

}
