import { Controller } from '@nestjs/common';
import { RedemptionService } from '../services/redemption.service';

@Controller()
export class RedemptionConsumerController {
  constructor(private readonly redemptionService: RedemptionService) {}

  // @EventPattern(QueueTopics.PROMOTION.CREATE_REDEMPTION)
  // createRedemption(@Payload() payload: CreatePromotionRedemptionRequest) {
  //   return this.redemptionService.create(payload);
  // }
}
