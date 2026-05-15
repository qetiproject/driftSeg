import { Injectable } from '@nestjs/common';
import { SegmentDependencyGraph } from '@segment/models/interfaces/segmentDependencyGraph';
import { Segment } from '@segment/models/segment.schema';

@Injectable()
export class SegmentDependencyGraphService {
  build(segments: Segment[]): SegmentDependencyGraph {
    return {
      segmentsById: this.buildSegmentIndex(segments),
      dependentsBySegmentId: this.buildReverseDependencyGraph(segments),
    };
  }

  private buildSegmentIndex(segments: Segment[]): Map<string, Segment> {
    return new Map(
      segments.map((segment) => [segment._id.toString(), segment]),
    );
  }

  private buildReverseDependencyGraph(
    segments: Segment[],
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const segment of segments) {
      const segmentId = segment._id.toString();
      const dependencies = segment.dependsOnSegmentIds ?? [];

      for (const dependencyId of dependencies) {
        const key = dependencyId.toString();

        const dependents = graph.get(key) ?? [];
        dependents.push(segmentId);
        graph.set(key, dependents);
      }
    }

    return graph;
  }
}
