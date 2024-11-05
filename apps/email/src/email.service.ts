import { Injectable, Logger } from '@nestjs/common';
import { emailTemplates, gmailTransport } from './utils/mailer.utils';
import * as moment from 'moment';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendBatchEmails(users) {
    this.logger.verbose(`${EmailService.name} - sendBatchEmails`);

    const failedEmails: { email: string; companyCode: string; error: any }[] =
      [];
    const template = emailTemplates.reminder;
    for (const user of users) {
      const { name, email, companyName, companyCode } = user;
      try {
        const htmlContent = template({
          name,
          companyName,
          uploadDate: moment().add(7, 'd').format('YYYY-MM-DD'),
        });
        // await gmailTransport.sendMail({
        //   from: process.env.GMAIL_USER,
        //   to: email,
        //   subject: `${companyName} 알림`,
        //   html: htmlContent,
        // });
        // 발송 간격 조절 (Gmail 발송 제한 고려)
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        failedEmails.push({ email, companyCode, error });
      }
    }
    if (failedEmails.length > 0) {
      await this.logFailedEmails(failedEmails);
    }
    return {
      total: users.length,
      failed: failedEmails.length,
      succeeded: users.length - failedEmails.length,
    };
  }

  private async logFailedEmails(failedEmails) {
    console.log(
      '🚀 ~ EmailService ~ logFailedEmails ~ failedEmails:',
      failedEmails,
    );
    // MongoDB나 다른 저장소에 실패 기록 저장
    // 추후 재시도나 모니터링에 활용
    // console.error(`Failed emails for company ${companyCode}:`, failedEmails);
  }
}
