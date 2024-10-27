import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email/email.service';
import { NotificationRepository } from './schemas/notification.repository';

const mockNotificationRepository = {
  getUpcomingReceiptDate: jest.fn().mockResolvedValue([]),
};

const mockEmailService = {
  sendBatchEmails: jest.fn().mockImplementation(async (users) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      total: users.length,
      failed: 0,
      succeeded: users.length,
    };
  }),
};

describe('Email Service Performance Tests', () => {
  let moduleRef: TestingModule;
  let emailService: EmailService;
  let performanceMetrics: {
    startTime: number;
    endTime: number;
    totalEmails: number;
    successfulEmails: number;
    failedEmails: number;
    processingTime: number;
    emailsPerSecond: number;
    averageLatencyMs: number;
    errors: Array<any>;
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    emailService = moduleRef.get<EmailService>(EmailService);

    performanceMetrics = {
      startTime: 0,
      endTime: 0,
      totalEmails: 0,
      successfulEmails: 0,
      failedEmails: 0,
      processingTime: 0,
      emailsPerSecond: 0,
      averageLatencyMs: 0,
      errors: [],
    };
  });

  const generateTestUsers = (count: number, companyCode: string) => {
    return Array.from({ length: count }, (_, index) => ({
      name: `User ${index}`,
      email: `user${index}@test.com`,
      companyName: `Company ${companyCode}`,
      companyCode: companyCode,
    }));
  };

  const measurePerformance = async (fn: any) => {
    const start = Date.now();
    const latencies: number[] = [];

    try {
      await fn((operationStart: number) => {
        latencies.push(Date.now() - operationStart);
      });
    } catch (error) {
      performanceMetrics.errors.push(error);
    }

    const end = Date.now();
    performanceMetrics.processingTime = end - start;
    performanceMetrics.averageLatencyMs =
      latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
    performanceMetrics.emailsPerSecond =
      (performanceMetrics.successfulEmails /
        performanceMetrics.processingTime) *
      1000;
  };

  it('should handle large batch of emails efficiently', async () => {
    const testUsers = generateTestUsers(50000, 'TEST_COMPANY');
    performanceMetrics.totalEmails = testUsers.length;

    const batchSize = 500;
    const batches = Math.ceil(testUsers.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const batch = testUsers.slice(i * batchSize, (i + 1) * batchSize);
      const start = Date.now();

      try {
        const result = await emailService.sendBatchEmails(batch);
        performanceMetrics.successfulEmails += result.succeeded;
        performanceMetrics.failedEmails += result.failed;

        // Log progress every 10 batches
        if ((i + 1) % 10 === 0) {
          console.log(
            `Processed ${(i + 1) * batchSize} of ${testUsers.length} emails`,
          );
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Batch ${i + 1} failed:`, error);
        performanceMetrics.failedEmails += batch.length;
      }
    }

    // 결과 출력
    console.log('\nPerformance Test Results:');
    console.log('-------------------------');
    console.log(`Total Emails: ${performanceMetrics.totalEmails}`);
    console.log(`Successful Emails: ${performanceMetrics.successfulEmails}`);
    console.log(`Failed Emails: ${performanceMetrics.failedEmails}`);
    console.log(`Processing Time: ${performanceMetrics.processingTime}ms`);
    console.log(
      `Emails Per Second: ${performanceMetrics.emailsPerSecond.toFixed(2)}`,
    );

    expect(performanceMetrics.successfulEmails).toBeGreaterThan(0);
    expect(performanceMetrics.emailsPerSecond).toBeGreaterThan(0);
  });

  it('should handle error scenarios', async () => {
    const errorUsers = generateTestUsers(100, 'ERROR_COMP');
    mockEmailService.sendBatchEmails.mockRejectedValueOnce(
      new Error('Simulated failure'),
    );

    await measurePerformance(async () => {
      try {
        await emailService.sendBatchEmails(errorUsers);
      } catch (error) {
        performanceMetrics.failedEmails += errorUsers.length;
      }
    });

    expect(performanceMetrics.errors.length).toBeGreaterThan(0);
    expect(performanceMetrics.failedEmails).toBe(errorUsers.length);
  });
});
