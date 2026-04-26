import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class SegmentMembershipDocument extends AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  segmentId!: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true })
  customerId!: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export const SegmentMembershipSchema = SchemaFactory.createForClass(
  SegmentMembershipDocument,
);

SegmentMembershipSchema.index(
  { segmentId: 1, customerId: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);
