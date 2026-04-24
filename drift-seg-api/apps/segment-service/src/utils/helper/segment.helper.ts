import { SegmentResponseDto } from '../../dto/responses';
import { SegmentDocument } from '../../models';

export function toSegmentResponse(
  segment: SegmentDocument,
): SegmentResponseDto {
  return {
    _id: segment._id.toString(),
    name: segment.name,
    type: segment.type,
    rules: segment.rules,
    dependsOnSegmentIds: (segment.dependsOnSegmentIds ?? []).map((id) =>
      id.toString(),
    ),
    lastComputedAt: segment.lastComputedAt?.toISOString(),
  };
}
