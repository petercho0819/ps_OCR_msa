import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationRepository extends AbstractRepository<NotificationDocument> {
  protected readonly logger = new Logger(NotificationRepository.name);
  constructor(
    @InjectModel(Notification.name)
    protected readonly notificationModel: Model<NotificationDocument>,
  ) {
    super(notificationModel);
  }

  async getUpcomingReceiptDate(uploadDate: string) {
    this.logger.verbose(
      `${NotificationRepository.name} - getUpcomingReceiptDate`,
    );
    return await this.notificationModel.find({ uploadDate });
  }
}
