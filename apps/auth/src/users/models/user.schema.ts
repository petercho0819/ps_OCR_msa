import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class UserDocument extends AbstractDocument {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  role: string;

  @Prop({ type: String })
  memberCode: string;

  @Prop({ type: String })
  companyCode: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
