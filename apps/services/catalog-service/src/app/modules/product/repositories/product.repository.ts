import { ProductStatusValues } from '@common/constants/product.constant';
import {
  CreateProductRequest,
  DeleteProductRequest,
  UpdateProductRequest,
  ValidateItemResult,
  ValidateProductsRequest,
} from '@common/interfaces/models/catalog';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

interface AttributeInputItem {
  name: string;
  value: string;
}

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateAttributes(attributes: AttributeInputItem[]) {
    if (!attributes || attributes.length === 0) {
      return;
    }

    const inputNames = attributes.map((attr) => attr.name);

    const uniqueInputNames = [...new Set(inputNames)];

    if (uniqueInputNames.length !== inputNames.length) {
      throw new BadRequestException('Danh sách thuộc tính bị trùng lặp tên.');
    }

    const existingAttributes = await this.prismaService.attribute.findMany({
      where: {
        name: { in: uniqueInputNames },
        deletedAt: null,
      },
      select: { name: true },
    });

    if (existingAttributes.length !== uniqueInputNames.length) {
      const foundNamesSet = new Set(existingAttributes.map((a) => a.name));
      const missingAttributes = uniqueInputNames.filter(
        (name) => !foundNamesSet.has(name),
      );

      throw new BadRequestException(
        `Các thuộc tính sau không tồn tại trong hệ thống: ${missingAttributes.join(
          ', ',
        )}`,
      );
    }
  }

  async create(data: CreateProductRequest) {
    await this.validateAttributes(data.attributes);
    const { skus, categories, brandId, ...productData } = data;
    return this.prismaService.product.create({
      data: {
        ...productData,
        createdById: data.createdById,
        brand: data.brandId
          ? {
              connect: { id: data.brandId },
            }
          : undefined,
        categories: {
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          createMany: {
            data: skus.map((sku) => ({
              ...sku,
              createdById: data.createdById,
            })),
          },
        },
      },
      include: {
        skus: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            value: true,
            price: true,
            stock: true,
            image: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        categories: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            logo: true,
            parentCategory: true,
          },
        },
      },
    });
  }

  async update(request: UpdateProductRequest) {
    await this.validateAttributes(request.attributes);
    const { skus, categories, brandId, ...productData } = request;

    //Lấy danh sách SKU hiện tại trong DB
    const existingSkus = await this.prismaService.sKU.findMany({
      where: {
        productId: request.id,
        deletedAt: null,
      },
    });

    //Tìm các SKU cần xoá ( tồn tại trong DB nhưng không có trong data payload)
    const skusToDelete = existingSkus.filter((sku) =>
      skus.every((dataSku) => dataSku.value !== sku.value),
    );
    const skuIdsToDelete = skusToDelete.map((sku) => sku.id);

    // Đưa các ID của sku tồn tại trong DB vào data payload
    const skuWithId = skus.map((dataSku) => {
      const existingSku = existingSkus.find(
        (item) => item.value === dataSku.value,
      );
      return {
        ...dataSku,
        id: existingSku ? existingSku.id : null,
      };
    });

    // Tìm các Sku để cập nhập
    const skusToUpdate = skuWithId.filter((dataSku) => dataSku.id !== null);

    // Tìm các Sku cần thêm mới
    const skusToCreate = skuWithId
      .filter((dataSku) => dataSku.id === null)
      .map((sku) => {
        const { id: skuId, ...data } = sku;
        return {
          ...data,
          productId: request.id,
          createdById: request.createdById,
        };
      });

    const [product] = await this.prismaService.$transaction([
      // Cập nhập product
      this.prismaService.product.update({
        where: {
          id: request.id,
          deletedAt: null,
        },
        data: {
          ...productData,
          updatedById: request.updatedById,
          brand: brandId
            ? {
                connect: { id: brandId },
              }
            : undefined,
          categories: {
            connect: categories.map((category) => ({ id: category })),
          },
        },
        include: {
          skus: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              value: true,
              price: true,
              stock: true,
              image: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          categories: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              logo: true,
              parentCategory: true,
            },
          },
        },
      }),

      // Xoá mềm các SKU không có trong data payload
      this.prismaService.sKU.updateMany({
        where: {
          id: {
            in: skuIdsToDelete,
          },
        },
        data: {
          deletedById: request.updatedById,
          deletedAt: new Date(),
        },
      }),

      // Cập nhập các SKU
      ...skusToUpdate.map((sku) => {
        return this.prismaService.sKU.update({
          where: {
            id: sku.id!,
          },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById: request.updatedById,
          },
        });
      }),

      // Thêm mới SKU
      this.prismaService.sKU.createMany({
        data: skusToCreate,
      }),
    ]);

    return product;
  }

  async delete(data: DeleteProductRequest, isHard?: boolean) {
    if (isHard) {
      return this.prismaService.product.delete({
        where: {
          id: data.id,
          shopId: data.shopId,
        },
      });
    } else {
      const [product] = await Promise.all([
        this.prismaService.product.update({
          where: {
            id: data.id,
            shopId: data.shopId,
            deletedAt: null,
          },
          data: {
            deletedById: data.deletedById,
            deletedAt: new Date(),
          },
        }),
        this.prismaService.sKU.updateMany({
          where: {
            productId: data.id,
            deletedAt: null,
          },
          data: {
            deletedById: data.deletedById,
            deletedAt: new Date(),
          },
        }),
      ]);
      return product;
    }
  }

  async validateProducts(data: ValidateProductsRequest) {
    const results: ValidateItemResult[] = [];

    const skuIds = data.productIds.map((item) => item.skuId);
    const skus = await this.prismaService.sKU.findMany({
      where: {
        id: { in: skuIds },
      },
      include: {
        product: true,
      },
    });

    const skuMap = new Map(skus.map((s) => [s.id, s]));
    const cartItemMap = new Map(
      data.productIds.map((item) => [item.skuId, item.cartItemId]),
    );

    for (const req of data.productIds) {
      const sku = skuMap.get(req.skuId);
      const cartItemId = cartItemMap.get(req.skuId);

      // Check 1: SKU không tồn tại
      if (!sku) {
        results.push({
          productId: req.productId,
          skuId: req.skuId,
          cartItemId,
          isValid: false,
          quantity: req.quantity,
          price: 0,
          productName: '',
          productImage: '',
          skuValue: '',
          shopId: '',
          error: 'SKU_NOT_FOUND',
        });
        continue;
      }

      // Check 2: Product ID không khớp
      if (sku.productId !== req.productId) {
        results.push({
          productId: req.productId,
          skuId: req.skuId,
          cartItemId,
          isValid: false,
          quantity: req.quantity,
          price: 0,
          productName: '',
          productImage: '',
          skuValue: '',
          shopId: '',
          error: 'PRODUCT_ID_MISMATCH',
        });
        continue;
      }

      const product = sku.product;

      // Check 3: Trạng thái Product (Active/Inactive/Draft)
      if (product.status !== ProductStatusValues.ACTIVE) {
        results.push({
          productId: product.id,
          skuId: sku.id,
          cartItemId,
          isValid: false,
          quantity: req.quantity,
          price: sku.price,
          productName: product.name,
          productImage: sku.image,
          skuValue: sku.value,
          shopId: product.shopId,
          error: `PRODUCT_STATUS_${product.status}`,
        });
        continue;
      }

      // Check 4: Product bị xóa

      if (product.deletedAt !== null) {
        results.push({
          productId: product.id,
          skuId: sku.id,
          cartItemId,
          isValid: false,
          quantity: req.quantity,
          price: sku.price,
          productName: product.name,
          productImage: sku.image,
          skuValue: sku.value,
          shopId: product.shopId,
          error: 'PRODUCT_UNAVAILABLE',
        });
        continue;
      }

      // Check 5: Tồn kho (Stock)
      if (sku.stock < req.quantity) {
        results.push({
          productId: product.id,
          skuId: sku.id,
          cartItemId,
          isValid: false,
          quantity: req.quantity,
          price: sku.price,
          productName: product.name,
          productImage: sku.image,
          skuValue: sku.value,
          shopId: product.shopId,
          error: 'OUT_OF_STOCK',
        });
        continue;
      }

      // Validated OK
      results.push({
        productId: product.id,
        skuId: sku.id,
        cartItemId,
        isValid: true,
        quantity: req.quantity,
        price: sku.price, // Order Service sẽ dùng giá này để tính total
        productName: product.name,
        productImage: sku.image,
        skuValue: sku.value,
        shopId: product.shopId, // Order Service sẽ dùng cái này để group đơn
      });
    }

    // Kết quả chung cuộc: Valid khi và chỉ khi TẤT CẢ items đều valid
    const isAllValid = results.every((r) => r.isValid);

    return {
      isValid: isAllValid,
      items: results,
    };
  }
}
