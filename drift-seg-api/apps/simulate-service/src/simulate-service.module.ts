import { Module } from '@nestjs/common';
import { SegmentServiceModule } from '../../segment-service/src/segment-service.module';
import { SimulationController } from './simulate-service.controller';
import { SegmentsController } from './segments.controller';

@Module({
  imports: [SegmentServiceModule],
  controllers: [SegmentsController, SimulationController],
})
export class SimulateServiceModule {}
