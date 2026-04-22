import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateSegmentDto, SegmentRuleKind, UpdateSegmentDto } from '../dto';
import {
  SegmentDeltaDocument,
  SegmentDocument,
  SegmentMembershipDocument,
} from '../models';
import { SegmentDeltaRepository, SegmentRepository } from '../repositories';
import { SegmentQueryService } from './segment-query.service';
import { SegmentValidationService } from './segment-validation.service';

@Injectable()
export class SegmentService {
  constructor(
    private readonly segmentRepository: SegmentRepository,
    private readonly segmentValidationService: SegmentValidationService,
    private readonly segmentDeltaRepository: SegmentDeltaRepository,
    private readonly segmentQueryService: SegmentQueryService,
  ) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentDocument> {
    const dependencyIds = payload.dependsOnSegmentIds ?? [];

    await this.segmentValidationService.assertUniqueSegmentName(payload.name);
    await this.segmentValidationService.assertDependencySegmentsExist(
      dependencyIds,
    );
    await this.segmentValidationService.assertRuleReferencedSegmentsExist(
      payload.rules,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.segmentValidationService.assertCompositionDependenciesMatch(
      payload.rules,
      dependencyIds,
    );
    this.segmentValidationService.assertRuleCompatibleWithType(
      payload.type,
      payload.rules.kind,
    );

    return await this.segmentRepository.create({
      ...payload,
      dependsOnSegmentIds: (payload.dependsOnSegmentIds ?? []).map(
        (id) => new Types.ObjectId(id),
      ),
      isActive: payload.isActive ?? true,
      lastComputedAt: undefined,
    });
  }

  async updateSegment(
    segmentId: string,
    payload: UpdateSegmentDto,
  ): Promise<SegmentDocument> {
    const current = await this.segmentRepository.findOne({ _id: segmentId });
    const currentRules = current.rules as CreateSegmentDto['rules'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const effectiveRules = payload.rules ?? currentRules;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const effectiveType = payload.type ?? current.type;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const effectiveDependencyIds =
      payload.dependsOnSegmentIds ??
      (current.dependsOnSegmentIds ?? []).map((id) => id.toString());

    if (payload.name && payload.name !== current.name) {
      await this.segmentValidationService.assertUniqueSegmentName(payload.name);
    }

    await this.segmentValidationService.assertDependencySegmentsExist(
      effectiveDependencyIds,
    );
    await this.segmentValidationService.assertRuleReferencedSegmentsExist(
      effectiveRules,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.segmentValidationService.assertCompositionDependenciesMatch(
      effectiveRules,
      effectiveDependencyIds,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const effectiveKind: SegmentRuleKind | undefined = effectiveRules?.kind;
    this.segmentValidationService.assertRuleCompatibleWithType(
      effectiveType,
      effectiveKind,
    );

    return await this.segmentRepository.findOneAndUpdate(
      { _id: segmentId },
      {
        $set: {
          ...payload,
          ...(payload.dependsOnSegmentIds
            ? {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                dependsOnSegmentIds: payload.dependsOnSegmentIds.map(
                  (id) => new Types.ObjectId(id),
                ),
              }
            : {}),
        },
      },
    );
  }

  async removeSegment(segmentId: string): Promise<SegmentDocument | null> {
    return await this.segmentRepository.findOneAndDelete({ _id: segmentId });
  }

  async manualRefreshSegment(
    segmentId: string,
  ): Promise<{ segment: SegmentDocument; delta: SegmentDeltaDocument }> {
    const segment = await this.segmentRepository.findOne({ _id: segmentId });

    const updatedSegment = await this.segmentRepository.findOneAndUpdate(
      { _id: segmentId },
      { $set: { lastComputedAt: new Date() } },
    );

    const delta = await this.segmentDeltaRepository.create({
      segmentId: segment._id,
      addedCustomerIds: [],
      removedCustomerIds: [],
      reason: 'manual_refresh',
      triggeredBySegmentId: undefined,
    });

    return { segment: updatedSegment, delta };
  }

  async listSegments(): Promise<SegmentDocument[]> {
    return await this.segmentQueryService.listSegments();
  }

  async listSegmentMemberships(
    segmentId: string,
  ): Promise<SegmentMembershipDocument[]> {
    return await this.segmentQueryService.listSegmentMemberships(segmentId);
  }

  async listSegmentDeltas(segmentId: string): Promise<SegmentDeltaDocument[]> {
    return await this.segmentQueryService.listSegmentDeltas(segmentId);
  }
}
