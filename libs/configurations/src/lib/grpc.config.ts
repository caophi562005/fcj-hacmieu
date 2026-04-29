import { GrpcService } from '@common/constants/grpc.constant';
import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import z from 'zod';

const grpcUrlSchema = z
  .string()
  .transform((val) => val.replace(/^https?:\/\//, ''));

const defaultGrpcUrl = '127.0.0.1:65535';

export const GrpcConfigurationSchema = z.object({
  PROTO_PATH: z.string().default('./proto/'),

  IAM_SERVICE_GRPC_URL: grpcUrlSchema.default('0.0.0.0:5001'),
  CATALOG_SERVICE_GRPC_URL: grpcUrlSchema.default(defaultGrpcUrl),
  SHOP_SERVICE_GRPC_URL: grpcUrlSchema.default(defaultGrpcUrl),
  PROMOTION_SERVICE_GRPC_URL: grpcUrlSchema.default(defaultGrpcUrl),
  ORDER_SERVICE_GRPC_URL: grpcUrlSchema.default(defaultGrpcUrl),
  PAYMENT_SERVICE_GRPC_URL: grpcUrlSchema.default(defaultGrpcUrl),
  UTILITY_SERVICE_GRPC_URL: grpcUrlSchema.default(defaultGrpcUrl),
  WALLET_SERVICE_GRPC_URL: grpcUrlSchema.default(defaultGrpcUrl),
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
