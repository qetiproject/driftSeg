import { Injectable } from '@nestjs/common';
import { CreateSegmentDto } from '@segment/dto';
import { SegmentResponseDto } from '@segment/dto/responses/segment-response.dto';
import { CreateSegmentFacade } from '@segment/services';
import { toSegmentResponse } from '@segment/utils';

@Injectable()
export class SegmentCommandService {
  constructor(private readonly createSegmentFacade: CreateSegmentFacade) {}

  async createSegment(payload: CreateSegmentDto): Promise<SegmentResponseDto> {
    const created = await this.createSegmentFacade.createSegment(payload);

    // if (created.type === SegmentTypeEnum.STATIC) {
    //   await this.segmentMembershipService.refreshStaticSegmentMemberships(
    //     created,
    //   );
    // }

    return toSegmentResponse(created);
  }
}
