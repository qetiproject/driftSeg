import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { SegmentController } from './controllers';
import { SegmentDocument, SegmentSchema } from './models';
import { SegmentRepository } from './repositories';
import { SegmentService } from './services/segment.service';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: SegmentDocument.name, schema: SegmentSchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/segment-service/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().optional(),
      }),
    }),
  ],
  controllers: [SegmentController],
  providers: [SegmentService, SegmentRepository],
})
export class SegmentServiceModule {}
