import { SegmentController } from '@segment/controllers';
import {
  SegmentApplicationModule,
  SegmentConfigModule,
} from '@segment/modules';
import { Module } from '@nestjs/common';

@Module({
  imports: [SegmentConfigModule, SegmentApplicationModule],
  controllers: [SegmentController],
})
export class SegmentModule {}
