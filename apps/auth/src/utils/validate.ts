import { HttpException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';

const generateKeyFromString = () => {
  const inputString = process.env.LOGIN_KEY;
  const hash = crypto.createHash('sha256');
  const hashedString = hash.update(inputString).digest('hex');
  const key = Buffer.from(hashedString, 'hex');

  return key;
};

export const decryptDecryptCode = <T>(data: string) => {
  const textParts = data.split(':');
  if (textParts.length !== 2) {
    throw new HttpException('Invalid encrypted data', HttpStatus.BAD_REQUEST);
  }

  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const secretKey = generateKeyFromString();
  const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
  const decrypted = decipher.update(encryptedText);
  const result = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(result.toString()) as T;
};

export const generateRandomNumberCode = (length: number): string => {
  let code = '';
  code += Math.floor(Math.random() * 9) + 1;
  for (let i = 1; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};
