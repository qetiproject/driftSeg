import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { SchemaTypes, Types } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: false,
})
export class TransactionDocument extends AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'CustomerDocument' })
  customerId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, default: () => new Date() })
  occurredAt!: Date;

  @Prop({ trim: true, maxlength: 64, default: () => randomUUID() })
  externalId?: string;

  @Prop({ trim: true, maxlength: 1024 })
  description?: string;
}

export const TransactionSchema =
  SchemaFactory.createForClass(TransactionDocument);

TransactionSchema.index({ customerId: 1, occurredAt: -1 });
TransactionSchema.index({ externalId: 1 }, { unique: true, sparse: true });
