import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class SegmentDeltaDocument extends AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId, required: true, index: true })
  segmentId!: Types.ObjectId;

  @Prop({ type: [SchemaTypes.ObjectId], default: [] })
  addedCustomerIds!: Types.ObjectId[];

  @Prop({ type: [SchemaTypes.ObjectId], default: [] })
  removedCustomerIds!: Types.ObjectId[];

  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ type: SchemaTypes.ObjectId })
  triggeredBySegmentId?: Types.ObjectId;
}

export const SegmentDeltaSchema =
  SchemaFactory.createForClass(SegmentDeltaDocument);
