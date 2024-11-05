import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Setting extends AbstractDocument {
  @Prop()
  uploadDate: string;

  @Prop()
  companyCode: string;

  @Prop({ default: false })
  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

export type SettingDocument = Setting & Document;

export const SettingSchema = SchemaFactory.createForClass(Setting);
