import { Segment } from '@segment/models/segment.schema';

export interface SegmentDependencyGraph {
  segmentsById: Map<string, Segment>;
  dependentBySegmentId: Map<string, string[]>;
}
