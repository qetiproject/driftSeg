import { Module } from '@nestjs/common';
import { SegmentServiceModule } from '../../segment-service/src/segment.module';
import { SegmentsController } from './segments.controller';
import { SimulationController } from './simulate-service.controller';

@Module({
  imports: [SegmentServiceModule],
  controllers: [SegmentsController, SimulationController],
})
export class SimulateServiceModule {}
