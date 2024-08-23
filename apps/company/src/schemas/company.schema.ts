import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Company extends AbstractDocument {
  @Prop()
  companyName: string;

  @Prop()
  companyCode: string;

  createdAt: Date;

  updatedAt: Date;
}

export type CompanyDocument = Company & Document;

export const CompanySchema = SchemaFactory.createForClass(Company);
