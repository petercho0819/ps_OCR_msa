import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { NotificationRepository } from './schemas/notification.repository';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common/constant';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { EmailService } from './email/email.service';
import { ConfigService } from '@nestjs/config';
import { chunk } from 'lodash';

@Injectable()
export class NotificationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(NotificationService.name);
  private readonly batchSize: number;
  private readonly maxRetries: number;
  private readonly userServiceTimeout: number;
  private readonly concurrentBatches: number;

  constructor(
    @Inject(AUTH_SERVICE) private readonly user_service: ClientProxy,
    private readonly notificationRepository: NotificationRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = this.configService.get<number>('EMAIL_BATCH_SIZE', 1000);
    this.maxRetries = this.configService.get<number>('MAX_RETRIES', 3);
    this.userServiceTimeout = this.configService.get<number>(
      'USER_SERVICE_TIMEOUT',
      10000,
    );
    this.concurrentBatches = this.configService.get<number>(
      'CONCURRENT_BATCHES',
      5,
    );
  }

  onApplicationBootstrap() {
    this.init();
  }

  async init() {
    await this.sendEmailForUpcomingReceiptDay();
  }

  @Cron('0 9 * * *', { name: 'sendEmailForUpcomingReceiptDay' })
  async sendEmailForUpcomingReceiptDay() {
    const processId = `notification-${Date.now()}`;
    const startTime = Date.now();

    try {
      this.logger.verbose(
        `Starting daily email notification process (${processId})`,
      );
      // await this.metricsService.startProcess(processId);

      const today = moment().format('DD');
      const companies =
        await this.notificationRepository.getUpcomingReceiptDate(today);

      if (!companies.length) {
        this.logger.debug('No companies scheduled for notification today');
        return;
      }

      for (const company of companies) {
        await this.processCompanyEmails(company.companyCode);
      }

      const duration = Date.now() - startTime;
      // await this.metricsService.completeProcess(processId, duration);
      this.logger.verbose(
        `Completed daily email notification process (${processId}) in ${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      // await this.metricsService.failProcess(processId, error, duration);
      this.logger.error(
        `Error in sendEmailForUpcomingReceiptDay (${processId}):`,
        error,
      );
      // await this.notifyError(error, processId);
    }
  }
  async processCompanyEmails(companyCode: string) {
    try {
      // 2. User 서비스에 회사 코드에 해당하는 이메일 목록 요청
      const users = await this.user_service
        .send('get_email_for_notification', companyCode)
        .toPromise();

      console.log(`Retrieved ${users.length} users for company ${companyCode}`);

      // 3. 500명씩 분할하여 처리
      const userChunks = chunk(users, 500);

      for (const [index, userChunk] of userChunks.entries()) {
        try {
          await this.emailService.sendBatchEmails(userChunk);
          console.log(
            `Processed batch ${index + 1}/${
              userChunks.length
            } for company ${companyCode}`,
          );

          // Rate limiting: 배치 간 1초 대기
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(
            `Failed to process batch ${index + 1} for company ${companyCode}:`,
            error,
          );
          // 실패한 배치 기록 (재시도를 위해)
        }
      }
    } catch (error) {
      console.error(
        `Failed to process emails for company ${companyCode}:`,
        error,
      );
    }
  }
}
