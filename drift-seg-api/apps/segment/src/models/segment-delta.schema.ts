import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { SegmentRuleKind } from '../dto';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class SegmentDeltaDocument extends AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId, required: true })
  segmentId!: Types.ObjectId;

  @Prop({ type: [SchemaTypes.ObjectId], required: true, default: [] })
  addedCustomerIds!: Types.ObjectId[];

  @Prop({ type: [SchemaTypes.ObjectId], required: true, default: [] })
  removedCustomerIds!: Types.ObjectId[];

  @Prop({ type: String, enum: SegmentRuleKind, required: true })
  segmentkind!: SegmentRuleKind;

  @Prop({ required: true })
  triggerEventId!: string;

  @Prop({ required: true })
  triggerEventType!: string;

  @Prop({ required: true })
  computedAt!: Date;
}

export const SegmentDeltaSchema =
  SchemaFactory.createForClass(SegmentDeltaDocument);

SegmentDeltaSchema.index({ segmentId: 1, computedAt: -1 });
