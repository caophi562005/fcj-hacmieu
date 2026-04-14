import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateRefundRequest,
  GetManyRefundsRequest,
  GetManyRefundsResponse,
  GetRefundRequest,
  RefundResponse,
  UpdateRefundStatusRequest,
} from '@common/interfaces/models/payment';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RefundRepository } from '../repositories/refund.repository';

@Injectable()
export class RefundService {
  constructor(private readonly refundRepository: RefundRepository) {}

  async list(data: GetManyRefundsRequest): Promise<GetManyRefundsResponse> {
    const refunds = await this.refundRepository.list(data);
    if (refunds.totalItems === 0) {
      throw new NotFoundException('Error.RefundsNotFound');
    }

    return refunds;
  }

  async getOne(data: GetRefundRequest): Promise<RefundResponse> {
    const refund = await this.refundRepository.getOne(data);
    if (!refund) {
      throw new NotFoundException('Error.RefundNotFound');
    }

    return refund;
  }

  async create({
    processId,
    ...data
  }: CreateRefundRequest): Promise<RefundResponse> {
    return this.refundRepository.create(data);
  }

  async updateStatus(data: UpdateRefundStatusRequest): Promise<RefundResponse> {
    try {
      return await this.refundRepository.updateStatus(data);
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.RefundNotFound');
      }

      throw error;
    }
  }
}
