import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CustomerStatusEnum } from '../enum/status.enum';

// export class TransactionEntry {
//   amount!: number;
//   at!: Date;
// }

@Schema({
  versionKey: false,
  timestamps: true,
})
export class CustomerDocument extends AbstractDocument {
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

export const CustomerSchema = SchemaFactory.createForClass(CustomerDocument);
