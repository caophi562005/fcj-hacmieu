import {
  CreateAddressRequest,
  GetAddressRequest,
  GetManyAddressesRequest,
} from '@common/interfaces/models/user-access';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/iam-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AddressRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyAddressesRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    const [totalItems, addresses] = await Promise.all([
      this.prismaService.address.count({
        where: {
          userId: data.userId,
        },
      }),
      this.prismaService.address.findMany({
        where: {
          userId: data.userId,
        },
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
    ]);
    return {
      addresses,
      totalItems,
      page: data.page,
      limit: data.limit,
      totalPages: Math.ceil(totalItems / data.limit),
    };
  }

  findById(data: GetAddressRequest) {
    return this.prismaService.address.findUnique({
      where: { id: data.id, userId: data.userId },
    });
  }

  create({ userId, ...data }: CreateAddressRequest) {
    return this.prismaService.address.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  update(data: Prisma.AddressUpdateInput) {
    return this.prismaService.address.update({
      where: {
        id: data.id as string,
      },
      data,
    });
  }

  delete(data: Prisma.AddressWhereInput) {
    return this.prismaService.address.delete({
      where: {
        id: data.id as string,
      },
    });
  }
}
