import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CustomerStatusEnum } from '../enum/status.enum';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class Customer {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ default: 0 })
  totalSpent!: number;

  @Prop({
    type: String,
    enum: CustomerStatusEnum,
    default: CustomerStatusEnum.INACTIVE,
  })
  status!: CustomerStatusEnum;
}

export type CustomerDocument = HydratedDocument<Customer>;

export const CustomerSchema = SchemaFactory.createForClass(Customer);
