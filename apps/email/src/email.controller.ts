import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { Logger } from '@nestjs/common';

interface BatchEmailPayload {
  users: any[];
  companyCode: string;
  batchIndex: number;
  totalBatches: number;
}

@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern('send_batch_emails')
  async handleBatchEmails(@Payload() data: BatchEmailPayload) {
    this.logger.verbose(`${EmailController.name} - handleBatchEmails`);
    const { users, companyCode, batchIndex, totalBatches } = data;
    console.log('data', data);
    try {
      await this.emailService.sendBatchEmails(users);
      this.logger.log(
        `Successfully processed batch ${batchIndex}/${totalBatches} for company ${companyCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process batch ${batchIndex}/${totalBatches} for company ${companyCode}:`,
        error,
      );
      // 여기서 실패한 작업을 Dead Letter Queue로 보내거나 재시도 로직을 구현할 수 있습니다.
    }
  }
}
