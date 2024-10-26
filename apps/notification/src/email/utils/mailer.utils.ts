// config/email.config.ts
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';

// 환경변수 검증
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  throw new Error('Missing required Gmail configuration');
}

// Gmail 트랜스포터 설정
export const gmailTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD, // Gmail 앱 비밀번호 사용
  },
});

// 이메일 템플릿 로드
export const loadEmailTemplate = (
  templateName: string,
): handlebars.TemplateDelegate => {
  try {
    const templatePath = path.join(
      process.cwd(),
      'apps',
      'notification',
      'src',
      'email',
      'template',
      'notification',
      `${templateName}.html`,
    );
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at: ${templatePath}`);
    }
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateContent);
  } catch (error) {
    throw new Error(`Failed to load email template: ${error.message}`);
  }
};

// 이메일 템플릿들
export const emailTemplates = {
  reminder: loadEmailTemplate('reminder'),
};
