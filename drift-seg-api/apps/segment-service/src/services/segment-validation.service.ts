import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { SEGMENT_ERROR_MESSAGES } from '../constants/error-messages';
import { SegmentRuleKind } from '../dto';
import { SegmentRuleInput } from '../dto/create-segment.dto';
import { SegmentTypeEnum } from '../models/segment.schema';
import { SegmentRepository } from '../repositories/segment.repository';

@Injectable()
export class SegmentValidationService {
  constructor(private readonly segmentRepository: SegmentRepository) {}

  async assertUniqueSegmentName(name: string): Promise<void> {
    const existing = await this.segmentRepository.findByName(name);
    if (existing) {
      throw new ConflictException(SEGMENT_ERROR_MESSAGES.DUPLICATE_NAME);
    }
  }

  async assertDependencySegmentsExist(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const uniqueIds = [...new Set(ids)];
    this.assertAllDependencyIdsAreObjectIds(uniqueIds);

    const foundCount = await this.segmentRepository.countByIds(uniqueIds);
    if (foundCount !== uniqueIds.length) {
      throw new BadRequestException(SEGMENT_ERROR_MESSAGES.MISSING_DEPENDENCY);
    }
  }

  assertNoSelfDependency(
    segmentId: string | undefined,
    dependencyIds: string[],
  ): void {
    if (!segmentId) {
      return;
    }
    if (dependencyIds.includes(segmentId)) {
      throw new BadRequestException(SEGMENT_ERROR_MESSAGES.SELF_DEPENDENCY);
    }
  }

  async assertNoDependencyCycle(
    segmentId: string | undefined,
    dependencyIds: string[],
  ): Promise<void> {
    if (!segmentId || dependencyIds.length === 0) {
      return;
    }

    const allSegments = await this.segmentRepository.find({});
    const adjacency = new Map<string, string[]>();
    for (const segment of allSegments) {
      adjacency.set(
        segment._id.toString(),
        (segment.dependsOnSegmentIds ?? []).map((id) => id.toString()),
      );
    }
    adjacency.set(segmentId, [...new Set(dependencyIds)]);

    const visiting = new Set<string>();
    const visited = new Set<string>();

    const dfs = (node: string): boolean => {
      if (visiting.has(node)) {
        return true;
      }
      if (visited.has(node)) {
        return false;
      }
      visiting.add(node);
      const neighbors = adjacency.get(node) ?? [];
      for (const next of neighbors) {
        if (dfs(next)) {
          return true;
        }
      }
      visiting.delete(node);
      visited.add(node);
      return false;
    };

    if (dfs(segmentId)) {
      throw new BadRequestException(SEGMENT_ERROR_MESSAGES.CYCLIC_DEPENDENCY);
    }
  }

  assertRuleCompatibleWithType(
    type: SegmentTypeEnum,
    ruleKind: SegmentRuleKind | undefined,
  ): void {
    if (!ruleKind) {
      return;
    }

    if (
      type === SegmentTypeEnum.STATIC &&
      ruleKind !== SegmentRuleKind.MANUAL_SNAPSHOT
    ) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.STATIC_RULE_MISMATCH,
      );
    }

    if (
      type === SegmentTypeEnum.DYNAMIC &&
      ruleKind === SegmentRuleKind.MANUAL_SNAPSHOT
    ) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.DYNAMIC_RULE_MISMATCH,
      );
    }
  }

  async assertRuleReferencedSegmentsExist(
    rule: SegmentRuleInput | undefined,
  ): Promise<void> {
    const segmentIds = this.getCompositionSegmentIds(rule);
    if (!segmentIds) {
      return;
    }

    try {
      await this.assertDependencySegmentsExist(segmentIds);
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        throw error;
      }
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.INVALID_RULE_SEGMENT_IDS,
      );
    }
  }

  assertCompositionDependenciesMatch(
    rule: SegmentRuleInput | undefined,
    dependencyIds: string[],
  ): void {
    const compositionIds = this.getCompositionSegmentIds(rule);
    if (!compositionIds) {
      return;
    }

    const normalizedCompositionIds = [...new Set(compositionIds)].sort();
    const normalizedDependencyIds = [...new Set(dependencyIds)].sort();
    const isMatch =
      normalizedCompositionIds.length === normalizedDependencyIds.length &&
      normalizedCompositionIds.every(
        (id, index) => id === normalizedDependencyIds[index],
      );

    if (!isMatch) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.RULE_DEPENDENCIES_MISMATCH,
      );
    }
  }

  private assertAllDependencyIdsAreObjectIds(ids: string[]): void {
    const allAreObjectIds = ids.every((id) => Types.ObjectId.isValid(id));
    if (!allAreObjectIds) {
      throw new BadRequestException(
        SEGMENT_ERROR_MESSAGES.INVALID_DEPENDENCY_ID,
      );
    }
  }

  private getCompositionSegmentIds(
    rule: SegmentRuleInput | undefined,
  ): string[] | null {
    if (!rule || rule.kind !== SegmentRuleKind.SEGMENT_COMPOSITION) {
      return null;
    }

    return Array.isArray(rule.segmentIds)
      ? rule.segmentIds.filter((id): id is string => typeof id === 'string')
      : [];
  }
}
