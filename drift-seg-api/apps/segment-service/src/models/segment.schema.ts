import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

export enum SegmentTypeEnum {
  DYNAMIC = 'dynamic',
  STATIC = 'static',
}

@Schema({
  versionKey: false,
  timestamps: true,
})
export class SegmentDocument extends AbstractDocument {
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ type: String, enum: SegmentTypeEnum, required: true })
  type!: SegmentTypeEnum;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  rules!: Record<string, unknown>;

  @Prop({ type: [SchemaTypes.ObjectId], default: [] })
  dependsOnSegmentIds!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  lastComputedAt?: Date;
}

export const SegmentSchema = SchemaFactory.createForClass(SegmentDocument);
