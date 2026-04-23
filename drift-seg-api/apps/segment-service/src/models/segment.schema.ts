import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import * as createSegment from '../dto/request';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class SegmentDocument extends AbstractDocument {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ type: String, enum: createSegment.SegmentTypeEnum, required: true })
  type!: createSegment.SegmentTypeEnum;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  rules!: createSegment.SegmentRuleInput;

  @Prop({ type: [SchemaTypes.ObjectId], default: [] })
  dependsOnSegmentIds!: Types.ObjectId[];

  @Prop()
  lastComputedAt?: Date;

  @Prop()
  inActiveDays?: number;
}

export const SegmentSchema = SchemaFactory.createForClass(SegmentDocument);
SegmentSchema.index({ dependsOnSegmentIds: 1 });
