import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: false,
})
export class Transaction {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'CustomerDocument' })
  customerId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, default: () => new Date() })
  occurredAt?: Date;

  @Prop({ trim: true, maxlength: 1024 })
  description?: string;
}

export type TransactionDocument = HydratedDocument<Transaction>;

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ customerId: 1, occurredAt: -1 });
