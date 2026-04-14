import { GrpcService } from '@common/constants/grpc.constant';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import z from 'zod';

const grpcUrlSchema = z
  .string()
  .transform((val) => val.replace(/^https?:\/\//, ''));

export const GrpcConfigurationSchema = z.object({
  PROTO_PATH: z.string(),

  IAM_SERVICE_GRPC_URL: grpcUrlSchema,
  CATALOG_SERVICE_GRPC_URL: grpcUrlSchema,
  SHOP_SERVICE_GRPC_URL: grpcUrlSchema,
  PROMOTION_SERVICE_GRPC_URL: grpcUrlSchema,
  ORDER_SERVICE_GRPC_URL: grpcUrlSchema,
  PRODUCT_SERVICE_GRPC_URL: grpcUrlSchema,
  USER_ACCESS_SERVICE_GRPC_URL: grpcUrlSchema,
});

const configServer = GrpcConfigurationSchema.safeParse(process.env);

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ');
  console.error(configServer.error);
  process.exit(1);
}

export const GrpcConfiguration = configServer.data;

/**
 * Chuẩn hóa tên service: loại bỏ hậu tố '_SERVICE', chuyển thành chữ thường và thay thế '_' bằng '-'.
 * VD: 'IAM_SERVICE' -> 'iam', 'PAYMENT_GATEWAY_SERVICE' -> 'payment-gateway'
 */
const normalizeServiceName = (name: GrpcService): string =>
  name
    .replace(/_SERVICE$/, '')
    .toLowerCase()
    .replace(/_/g, '-');

const getProtoPath = (serviceName: GrpcService) => {
  return `${GrpcConfiguration.PROTO_PATH}${normalizeServiceName(
    serviceName,
  )}.proto`;
};

export const GrpcClientProvider = (
  serviceName: GrpcService,
): ClientProviderOptions => {
  return {
    name: serviceName,
    transport: Transport.GRPC,
    options: {
      url: GrpcConfiguration[`${serviceName}_GRPC_URL`],
      package: serviceName,
      protoPath: join(__dirname, getProtoPath(serviceName)),
    },
  };
};

export const GrpcServerOptions = (serviceName: GrpcService) => {
  return {
    transport: Transport.GRPC,
    options: {
      url: GrpcConfiguration[`${serviceName}_GRPC_URL`],
      package: serviceName,
      protoPath: join(__dirname, getProtoPath(serviceName)),
    },
  };
};
