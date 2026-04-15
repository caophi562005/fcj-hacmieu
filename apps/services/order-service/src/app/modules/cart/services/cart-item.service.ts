import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  AddCartItemRequest,
  AddCartItemResponse,
  DeleteCartItemRequest,
  DeleteCartItemResponse,
  GetManyCartItemsRequest,
  GetManyCartItemsResponse,
  UpdateCartItemRequest,
  ValidateCartItemsRequest,
} from '@common/interfaces/models/order';
import {
  CATALOG_SERVICE_PACKAGE_NAME,
  PRODUCT_MODULE_SERVICE_NAME,
  ProductModuleClient,
} from '@common/interfaces/proto-types/catalog';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CartItemRepository } from '../repositories/cart-item.repository';
import { CartRepository } from '../repositories/cart.repository';

type CartItemContext = AddCartItemRequest & {
  cartId: string;
};

@Injectable()
export class CartItemService implements OnModuleInit {
  private productModule!: ProductModuleClient;

  constructor(
    @Inject(CATALOG_SERVICE_PACKAGE_NAME)
    private catalogClient: ClientGrpc,
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
  ) {}

  onModuleInit() {
    this.productModule = this.catalogClient.getService<ProductModuleClient>(
      PRODUCT_MODULE_SERVICE_NAME,
    );
  }

  private async getCart(userId: string, createIfMissing = false) {
    let cart = await this.cartRepository.findByUserId({ userId });
    if (!cart && createIfMissing) {
      cart = await this.cartRepository.create({ userId, itemCount: 0 });
    }

    if (!cart) {
      throw new NotFoundException('Error.CartNotFound');
    }

    return cart;
  }

  private async validateSKU(data: CartItemContext) {
    const cartItem = await this.cartItemRepository.findUnique({
      cartId: data.cartId,
      skuId: data.skuId,
      productId: data.productId,
    });

    const requestedQuantity = cartItem
      ? cartItem.quantity + data.quantity
      : data.quantity;

    if (requestedQuantity <= 0) {
      throw new BadRequestException('Error.InvalidQuantity');
    }

    const validation = await firstValueFrom(
      this.productModule.validateProducts({
        processId: data.processId,
        productIds: [
          {
            productId: data.productId,
            skuId: data.skuId,
            quantity: requestedQuantity,
            // validateProducts yêu cầu cartItemId, dùng skuId làm correlation id
            cartItemId: data.skuId,
          },
        ],
      }),
    );

    const [validationItem] = validation.items;

    if (!validationItem || !validationItem.isValid) {
      switch (validationItem?.error) {
        case 'SKU_NOT_FOUND':
          throw new NotFoundException('Error.SKUNotFound');

        case 'OUT_OF_STOCK':
          throw new NotFoundException('Error.SKUOutOfStock');

        case 'PRODUCT_ID_MISMATCH':
        case 'PRODUCT_UNAVAILABLE':
        default:
          throw new NotFoundException('Error.ProductNotFound');
      }
    }
  }

  async list({
    processId,
    ...data
  }: GetManyCartItemsRequest): Promise<GetManyCartItemsResponse> {
    const cartItems = await this.cartItemRepository.list(data);
    if (cartItems.totalItems === 0) {
      throw new NotFoundException('Error.CartItemsNotFound');
    }
    return cartItems;
  }

  async add({
    processId,
    ...data
  }: AddCartItemRequest): Promise<AddCartItemResponse> {
    const cart = await this.getCart(data.userId, true);

    await this.validateSKU({ ...data, cartId: cart.id });
    const addCartItem = await this.cartItemRepository.add({
      ...data,
      cartId: cart.id,
    });
    return addCartItem;
  }

  async update({
    processId,
    ...data
  }: UpdateCartItemRequest): Promise<AddCartItemResponse> {
    const cart = await this.getCart(data.userId);

    // Only validate SKU if quantity > 0 (not a delete operation)
    if (data.quantity > 0) {
      await this.validateSKU({ ...data, cartId: cart.id });
    }

    const updateCartItem = await this.cartItemRepository.update({
      ...data,
      cartId: cart.id,
    });
    return updateCartItem;
  }

  async delete({
    processId,
    ...data
  }: DeleteCartItemRequest): Promise<DeleteCartItemResponse> {
    try {
      const cart = await this.getCart(data.userId);
      const deleteCartItem = await this.cartItemRepository.delete({
        ...data,
        cartId: cart.id,
      });
      return deleteCartItem;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.CartItemNotFound');
      }
    }
  }

  async validateCartItems({ processId, ...data }: ValidateCartItemsRequest) {
    const cart = await this.getCart(data.userId);
    const cartItems = await this.cartItemRepository.validateCartItems({
      ...data,
      cartId: cart.id,
    });
    if (cartItems.length !== data.cartItemIds.length) {
      throw new NotFoundException('Error.CartItemNotFound');
    }
    return { cartItems };
  }
}
