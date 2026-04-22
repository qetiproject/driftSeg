import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum StatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class TransactionEntry {
  amount!: number;
  at!: Date;
}

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

  @Prop({ default: () => new Date() })
  lastTransactionDate!: Date;

  @Prop({
    type: [
      {
        amount: { type: Number, required: true },
        at: { type: Date, required: true },
      },
    ],
    default: [],
  })
  transactions?: TransactionEntry[];

  @Prop({
    type: String,
    enum: StatusEnum,
    default: StatusEnum.ACTIVE,
  })
  status!: StatusEnum;
}

export const CustomerSchema = SchemaFactory.createForClass(CustomerDocument);
