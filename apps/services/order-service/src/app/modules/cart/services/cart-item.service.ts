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
  PRODUCT_SERVICE_NAME,
  PRODUCT_SERVICE_PACKAGE_NAME,
  ProductServiceClient,
} from '@common/interfaces/proto-types/product';
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

@Injectable()
export class CartItemService implements OnModuleInit {
  private productService!: ProductServiceClient;

  constructor(
    @Inject(PRODUCT_SERVICE_PACKAGE_NAME)
    private productClient: ClientGrpc,
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
  ) {}

  onModuleInit() {
    this.productService =
      this.productClient.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  private async validateSKU(data: AddCartItemRequest) {
    let cart = await this.cartRepository.findByUserId({ userId: data.userId });
    if (!cart) {
      cart = await this.cartRepository.create({ userId: data.userId });
    }

    const [cartItem, sku] = await Promise.all([
      this.cartItemRepository.findUnique({
        cartId: cart.id,
        skuId: data.skuId,
        productId: data.productId,
      }),
      firstValueFrom(this.productService.getSku({ id: data.skuId })),
    ]);

    // Kiểm tra tồn tại của SKU
    if (!sku) {
      throw new NotFoundException('Error.SKUNotFound');
    }

    // Kiểm tra hàng tồn
    if (sku.stock < 1 || sku.stock < data.quantity) {
      throw new NotFoundException('Error.SKUOutOfStock');
    }

    // Kiểm tra số lượng khi thêm mới hoặc cập nhật
    if (cartItem && data.quantity + cartItem.quantity > sku.stock) {
      throw new BadRequestException('Error.InvalidQuantity');
    } else if (!cartItem && data.quantity > sku.stock) {
      throw new BadRequestException('Error.InvalidQuantity');
    }

    const { product } = sku;

    //Kiểm tra xem sản phẩm bị xoá hay có publish không
    if (product && product.deletedAt) {
      throw new NotFoundException('Error.ProductNotFound');
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
    await this.validateSKU(data);
    const addCartItem = await this.cartItemRepository.add(data);
    return addCartItem;
  }

  async update({
    processId,
    ...data
  }: UpdateCartItemRequest): Promise<AddCartItemResponse> {
    await this.validateSKU(data);
    const updateCartItem = await this.cartItemRepository.update(data);
    return updateCartItem;
  }

  async delete({
    processId,
    ...data
  }: DeleteCartItemRequest): Promise<DeleteCartItemResponse> {
    try {
      const deleteCartItem = await this.cartItemRepository.delete(data);
      return deleteCartItem;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.CartItemNotFound');
      }
    }
  }

  async validateCartItems({ processId, ...data }: ValidateCartItemsRequest) {
    const cartItems = await this.cartItemRepository.validateCartItems(data);
    if (cartItems.length !== data.cartItemIds.length) {
      throw new NotFoundException('Error.CartItemNotFound');
    }
    return { cartItems };
  }
}
