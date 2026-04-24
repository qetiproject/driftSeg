import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import * as segmentRule from '../dto/segment-rule';

@Schema({
  versionKey: false,
  timestamps: true,
})
export class SegmentDocument extends AbstractDocument {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ type: String, enum: segmentRule.SegmentTypeEnum, required: true })
  type!: segmentRule.SegmentTypeEnum;

  @Prop({
    type: SchemaTypes.Mixed,
    required(this: SegmentDocument) {
      return this.type === segmentRule.SegmentTypeEnum.DYNAMIC;
    },
  })
  rules?: segmentRule.SegmentRuleInput;

  @Prop({ type: [SchemaTypes.ObjectId], default: [] })
  dependsOnSegmentIds!: Types.ObjectId[];

  @Prop()
  lastComputedAt?: Date;

  @Prop()
  inActiveDays?: number;

  @Prop({
    type: SchemaTypes.Mixed,
    required(this: SegmentDocument) {
      return this.type === segmentRule.SegmentTypeEnum.STATIC;
    },
  })
  staticSegmentKind?: string;
}

export const SegmentSchema = SchemaFactory.createForClass(SegmentDocument);
SegmentSchema.index({ dependsOnSegmentIds: 1 });
