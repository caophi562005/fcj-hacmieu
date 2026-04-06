import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/order-service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findByUserId(data: Prisma.CartWhereUniqueInput) {
    return this.prismaService.cart.findUnique({
      where: {
        userId: data.userId,
      },
    });
  }

  create(data: Prisma.CartCreateInput) {
    return this.prismaService.cart.create({
      data,
    });
  }
}
