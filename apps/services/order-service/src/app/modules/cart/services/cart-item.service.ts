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
    // SKU validation is deferred to order service's validateProducts
    // Here we just check that cartItem quantity doesn't exceed a reasonable limit
    const cartItem = await this.cartItemRepository.findUnique({
      cartId: data.cartId,
      skuId: data.skuId,
      productId: data.productId,
    });

    // Validate total quantity after add/update
    const newQuantity = cartItem
      ? cartItem.quantity + data.quantity
      : data.quantity;
    if (newQuantity > 1000) {
      throw new BadRequestException('Error.InvalidQuantity');
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
