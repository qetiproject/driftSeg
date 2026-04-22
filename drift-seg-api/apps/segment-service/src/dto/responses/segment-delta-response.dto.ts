export class SegmentDeltaResponseDto {
  _id!: string;
  segmentId!: string;
  addedCustomerIds!: string[];
  removedCustomerIds!: string[];
  reason!: string;
  triggeredBySegmentId?: string;
  createdAt?: string;
  updatedAt?: string;
}
