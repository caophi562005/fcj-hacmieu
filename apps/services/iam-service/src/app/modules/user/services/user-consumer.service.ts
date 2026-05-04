import { SqsConfiguration } from '@common/configurations/sqs.config';
import { GroupValues } from '@common/constants/user.constant';
import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { UserService } from './user.service';

type CognitoPostConfirmationMessage = {
  username: string;
  email: string;
  sub: string;
  eventTime: string;
  source: string;
};

type SqsMessage = {
  MessageId?: string;
  Body?: string;
};

@Injectable()
export class UserConsumerService {
  private readonly logger = new Logger(UserConsumerService.name);

  constructor(private readonly userService: UserService) {}

  @SqsMessageHandler(SqsConfiguration.CREATE_USER_QUEUE_NAME, false)
  async handleCreateUserMessage(message: SqsMessage) {
    const body: CognitoPostConfirmationMessage = message.Body
      ? JSON.parse(message.Body)
      : {};

    if (body.source === 'Cognito_PostConfirmation') {
      try {
        await this.userService.create({
          id: body.sub,
          email: body.email,
          username: body.username,
          avatar: '',
          group: [GroupValues.CUSTOMER],
        });
        this.logger.log(`User created successfully from Cognito: ${body.sub}`);
      } catch (error) {
        this.logger.error(`Failed to create user from Cognito: ${body.sub}`, error);
      }
    }
  }
}
