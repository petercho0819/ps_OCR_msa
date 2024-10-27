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
import { AUTH_SERVICE, EMAIL_SERVICE } from '@app/common/constant';
import { catchError, firstValueFrom, lastValueFrom, of, timeout } from 'rxjs';
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
    @Inject(EMAIL_SERVICE) private readonly email_service: ClientProxy,
    private readonly notificationRepository: NotificationRepository,
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

  async onApplicationBootstrap() {
    try {
      // RabbitMQ 연결 확인
      await Promise.all([
        this.user_service.connect(),
        this.email_service.connect(),
      ]);
      this.sendEmailForUpcomingReceiptDay();
      this.logger.log('Successfully connected to RabbitMQ services');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ services:', error);
      // 선택적: 프로세스 종료 또는 다른 에러 처리
    }
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
      this.logger.debug(
        `Starting to process emails for company: ${companyCode}`,
      );

      // User 서비스에서 이메일 목록 가져오기
      const usersResponse = await lastValueFrom(
        this.user_service.send('get_email_for_notification', companyCode).pipe(
          timeout(this.userServiceTimeout),
          catchError((error) => {
            this.logger.error(
              `Failed to fetch users for company ${companyCode}:`,
              error,
            );
            return of(null);
          }),
        ),
      );

      if (!usersResponse) {
        this.logger.error(`No users retrieved for company ${companyCode}`);
        return;
      }

      const users = Array.isArray(usersResponse) ? usersResponse : [];
      this.logger.log(
        `Retrieved ${users.length} users for company ${companyCode}`,
      );

      if (users.length === 0) {
        return;
      }

      // 유저 목록을 청크로 나누기
      const userChunks = chunk(users, this.batchSize);
      this.logger.debug(
        `Split ${users.length} users into ${userChunks.length} batches`,
      );

      for (const [index, userChunk] of userChunks.entries()) {
        try {
          const messagePayload = {
            users: userChunk,
            companyCode,
            batchIndex: index + 1,
            totalBatches: userChunks.length,
            timestamp: new Date().toISOString(),
          };

          // RabbitMQ로 메시지 전송
          await lastValueFrom(
            this.email_service.emit('send_batch_emails', messagePayload).pipe(
              timeout(5000),
              catchError((error) => {
                const errorMessage = error.message || JSON.stringify(error);
                this.logger.error(
                  `Failed to queue batch ${
                    index + 1
                  } for company ${companyCode}: ${errorMessage}`,
                  error.stack,
                );
                return of(null);
              }),
            ),
          );

          this.logger.log(
            `Successfully queued batch ${index + 1}/${
              userChunks.length
            } for company ${companyCode}`,
          );

          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          this.logger.error(
            `Error processing batch ${index + 1} for company ${companyCode}:`,
            error.stack || error,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to process emails for company ${companyCode}:`,
        error.stack || error,
      );
    }
  }
}
