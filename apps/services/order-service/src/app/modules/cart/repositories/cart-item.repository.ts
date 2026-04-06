import {
  AddCartItemRequest,
  DeleteCartItemRequest,
  GetManyCartItemsRequest,
  GetUniqueCartItemRequest,
  UpdateCartItemRequest,
  ValidateCartItemsRequest,
} from '@common/interfaces/models/order';
import { CartShopGroup } from '@common/schemas/cart';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CartItemRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(data: GetManyCartItemsRequest) {
    const skip = (data.page - 1) * data.limit;
    const take = data.limit;

    // Lấy cart của user (1 user = 1 cart)
    const cart = await this.prismaService.cart.findUnique({
      where: { userId: data.userId },
    });

    if (!cart) {
      throw new NotFoundException('Error.CartNotFound');
    }

    // Lấy toàn bộ CartItem trong cart, sort mới nhất trước
    const items = await this.prismaService.cartItem.findMany({
      where: {
        cartId: cart.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // 3. Group theo shopId
    const groupMap = new Map<string, CartShopGroup>();

    for (const item of items) {
      const shopId = item.shopId;

      if (!groupMap.has(shopId)) {
        groupMap.set(shopId, {
          shopId,
          cartItems: [],
        });
      }

      groupMap.get(shopId)!.cartItems.push(item);
    }

    const sortedGroups = Array.from(groupMap.values());

    // 4. Pagination trên group (theo shop)
    const totalGroups = sortedGroups.length;
    const pageGroups = sortedGroups.slice(skip, skip + take);

    return {
      cartItems: pageGroups,
      page: data.page,
      limit: data.limit,
      totalItems: totalGroups,
      totalPages: Math.ceil(totalGroups / data.limit),
    };
  }

  findUnique(data: GetUniqueCartItemRequest) {
    return this.prismaService.cartItem.findUnique({
      where: {
        cartId_productId_skuId: {
          cartId: data.cartId,
          productId: data.productId,
          skuId: data.skuId,
        },
      },
    });
  }

  async add(data: AddCartItemRequest) {
    return this.prismaService.$transaction(async (tx) => {
      // Tìm Cart hiện tại của user, nếu chưa có thì tạo
      let cart = await tx.cart.findUnique({
        where: { userId: data.userId },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            userId: data.userId,
            itemCount: 0,
          },
        });
      }

      const result = await tx.cartItem.upsert({
        where: {
          cartId_productId_skuId: {
            cartId: cart.id,
            productId: data.productId,
            skuId: data.skuId,
          },
        },
        update: {
          quantity: {
            increment: data.quantity,
          },
        },
        create: {
          cartId: cart.id,
          productId: data.productId,
          skuId: data.skuId,
          shopId: data.shopId,
          quantity: data.quantity,
          productName: data.productName,
          skuValue: data.skuValue,
          productImage: data.productImage,
        },
      });

      // Cập nhật lại itemCount của Cart
      const itemCount = await tx.cartItem.count({
        where: { cartId: cart.id },
      });

      const updatedCart = await tx.cart.update({
        where: { id: cart.id },
        data: {
          itemCount,
        },
        select: {
          itemCount: true,
        },
      });

      return {
        cartItem: result,
        cartCount: updatedCart.itemCount,
      };
    });
  }

  async update(data: UpdateCartItemRequest) {
    return this.prismaService.$transaction(async (tx) => {
      // Lấy cart của user
      const cart = await tx.cart.findUnique({
        where: { userId: data.userId },
      });

      if (!cart) {
        throw new NotFoundException('Error.CartNotFound');
      }

      const whereUnique = {
        cartId_productId_skuId: {
          cartId: cart.id,
          productId: data.productId,
          skuId: data.skuId,
        },
      };

      // Lấy cartItem hiện tại
      const existItem = await tx.cartItem.findUnique({
        where: whereUnique,
      });

      if (!existItem) {
        throw new NotFoundException('Error.CartItemNotFound');
      }

      let cartItem = existItem;

      // Nếu quantity <= 0 -> xoá item
      if (data.quantity <= 0) {
        await tx.cartItem.delete({
          where: whereUnique,
        });
        cartItem = null as any;
      } else {
        // Cập nhật quantity mới
        cartItem = await tx.cartItem.update({
          where: whereUnique,
          data: {
            quantity: data.quantity,
          },
        });
      }

      // Cập nhật lại itemCount trong Cart
      const itemCount = await tx.cartItem.count({
        where: { cartId: cart.id },
      });

      const updatedCart = await tx.cart.update({
        where: { id: cart.id },
        data: {
          itemCount,
        },
        select: {
          itemCount: true,
        },
      });

      return {
        cartItem,
        cartCount: updatedCart.itemCount,
      };
    });
  }

  async delete(data: DeleteCartItemRequest) {
    return this.prismaService.$transaction(async (tx) => {
      // Lấy cart của user
      const cart = await tx.cart.findUnique({
        where: { userId: data.userId },
      });

      if (!cart) {
        throw new NotFoundException('Error.CartNotFound');
      }

      let cartItemId = data.cartItemId;
      if (!cartItemId && data.productId && data.skuId) {
        const carrItem = await tx.cartItem.findUnique({
          where: {
            cartId_productId_skuId: {
              cartId: cart.id,
              productId: data.productId,
              skuId: data.skuId,
            },
          },
        });
        cartItemId = carrItem?.id;
      }

      // Xóa CartItem
      await tx.cartItem.delete({
        where: {
          id: cartItemId,
          cartId: cart.id,
        },
      });

      // 3. Cập nhật lại itemCount của Cart
      const itemCount = await tx.cartItem.count({
        where: { cartId: cart.id },
      });

      const updatedCart = await tx.cart.update({
        where: { id: cart.id },
        data: {
          itemCount,
        },
        select: {
          itemCount: true,
        },
      });

      return {
        cartCount: updatedCart.itemCount,
      };
    });
  }

  async validateCartItems(data: ValidateCartItemsRequest) {
    const cart = await this.prismaService.cart.findUnique({
      where: {
        userId: data.userId,
      },
    });
    return this.prismaService.cartItem.findMany({
      where: {
        id: {
          in: data.cartItemIds,
        },
        cartId: cart?.id,
      },
    });
  }
}
