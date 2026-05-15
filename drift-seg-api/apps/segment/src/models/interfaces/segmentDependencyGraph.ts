import { Segment } from '@segment/models/segment.schema';

export interface SegmentDependencyGraph {
  segmentsById: Map<string, Segment>;
  dependentsBySegmentId: Map<string, string[]>;
}
