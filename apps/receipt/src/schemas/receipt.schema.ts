import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Receipt extends AbstractDocument {
  @Prop()
  userCode: string;

  @Prop()
  name: string;

  @Prop()
  imgPath: string;

  @Prop()
  receiptDate: string;

  @Prop()
  receiptType: string;

  @Prop()
  price: number;

  @Prop()
  memo: string;

  @Prop()
  numberOfPeople: number;

  createdAt: Date;

  updatedAt: Date;
}

export type ReceiptDocument = Receipt & Document;

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
