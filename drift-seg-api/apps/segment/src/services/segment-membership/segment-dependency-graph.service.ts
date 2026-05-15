import { Injectable } from '@nestjs/common';
import { SegmentDependencyGraph } from '@segment/models/interfaces/segmentDependencyGraph';
import { Segment } from '@segment/models/segment.schema';

@Injectable()
export class SegmentDependencyGraphService {
  build(segments: Segment[]): SegmentDependencyGraph {
    const segmentsById = this.mapSegmentsById(segments);
    const dependentBySegmentId = this.buildDependentSegmentMap(segments);

    return {
      segmentsById,
      dependentBySegmentId,
    };
  }

  private mapSegmentsById(segments: Segment[]): Map<string, Segment> {
    return new Map(segments.map((s) => [s._id.toString(), s]));
  }

  private buildDependentSegmentMap(segments: Segment[]): Map<string, string[]> {
    const map = new Map<string, string[]>();

    for (const { _id, dependsOnSegmentIds = [] } of segments) {
      const dependentId = _id.toString();

      for (const depId of dependsOnSegmentIds) {
        const key = depId.toString();

        const existing = map.get(key);
        if (existing) {
          existing.push(dependentId);
        } else {
          map.set(key, [dependentId]);
        }
      }
    }

    return map;
  }
}
