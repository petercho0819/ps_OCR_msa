import { ReceiptType } from '../interface';

export const DINNER_FEE = 'DINNER_FEE';
export const TAXI_FEE = 'TAXI_FEE';
export const ETC = 'ETC';
export const receiptType: ReceiptType[] = [DINNER_FEE, TAXI_FEE, ETC];

export const INVALID_RECEIPT_TYPE =
  'Invalid receipt type. Status: DINNER_FEE, TAXI_FEE, ETC';
