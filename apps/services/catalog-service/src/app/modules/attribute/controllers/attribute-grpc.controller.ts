import { GrpcModuleName } from '@common/constants/grpc.constant';
import { GrpcLoggingInterceptor } from '@common/interceptors/grpcLogging.interceptor';
import {
  CreateAttributeRequest,
  DeleteAttributeRequest,
  UpdateAttributeRequest,
} from '@common/interfaces/models/catalog';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AttributeService } from '../services/attribute.service';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class AttributeGrpcController {
  constructor(private readonly attributeService: AttributeService) {}

  @GrpcMethod(GrpcModuleName.CATALOG.ATTRIBUTE, 'CreateAttribute')
  createAttribute(data: CreateAttributeRequest) {
    return this.attributeService.create(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.ATTRIBUTE, 'UpdateAttribute')
  updateAttribute(data: UpdateAttributeRequest) {
    return this.attributeService.update(data);
  }

  @GrpcMethod(GrpcModuleName.CATALOG.ATTRIBUTE, 'DeleteAttribute')
  deleteAttribute(data: DeleteAttributeRequest) {
    return this.attributeService.delete(data);
  }
}
