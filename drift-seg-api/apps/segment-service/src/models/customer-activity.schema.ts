import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ _id: false, versionKey: false })
export class TransactionEntry {
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true })
  at!: Date;
}

const TransactionEntrySchema = SchemaFactory.createForClass(TransactionEntry);

@Schema({
  versionKey: false,
  timestamps: true,
})
export class CustomerActivityDocument extends AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId, required: true, unique: true, index: true })
  customerId!: Types.ObjectId;

  @Prop({ type: [TransactionEntrySchema], default: [] })
  transactions!: TransactionEntry[];

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  profile!: Record<string, unknown>;
}

export const CustomerActivitySchema =
  SchemaFactory.createForClass(CustomerActivityDocument);
