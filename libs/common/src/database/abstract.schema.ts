import { Prop, Schema } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: ObjectId;
}
