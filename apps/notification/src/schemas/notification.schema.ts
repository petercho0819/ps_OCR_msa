import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Notification extends AbstractDocument {
  @Prop()
  uploadDate: string;

  @Prop()
  companyCode: string;

  createdAt: Date;

  updatedAt: Date;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
