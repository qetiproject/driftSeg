import { PaginatedResponseDtoFactory } from '@app/common/dto/paginated-response-dto-factory';
import { SegmentResponseDto } from './responses/segment-response.dto';

export class PaginatedSegmentResponseDto extends PaginatedResponseDtoFactory(
  SegmentResponseDto,
) {}
