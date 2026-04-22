import { SegmentDeltaResponseDto } from './segment-delta-response.dto';
import { SegmentResponseDto } from './segment-response.dto';

export class ManualRefreshResponseDto {
  segment!: SegmentResponseDto;
  delta!: SegmentDeltaResponseDto;
}
