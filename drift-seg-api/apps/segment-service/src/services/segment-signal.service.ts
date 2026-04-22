import { Injectable, Logger } from '@nestjs/common';

export interface SegmentDeltaSignal {
  segmentId: string;
  segmentName: string;
  reason: string;
  evaluatedAt: string;
  addedCustomerIds: string[];
  removedCustomerIds: string[];
}

@Injectable()
export class SegmentSignalService {
  private readonly logger = new Logger(SegmentSignalService.name);
  private readonly uiQueue: SegmentDeltaSignal[] = [];
  private readonly backgroundQueue: SegmentDeltaSignal[] = [];

  publish(signal: SegmentDeltaSignal): void {
    this.uiQueue.push(signal);
    this.backgroundQueue.push(signal);
    this.logger.log(
      `Published delta signal for segment=${signal.segmentName} added=${signal.addedCustomerIds.length} removed=${signal.removedCustomerIds.length}`,
    );
  }

  pullUiSignals(): SegmentDeltaSignal[] {
    return this.uiQueue.splice(0, this.uiQueue.length);
  }

  pullBackgroundSignals(): SegmentDeltaSignal[] {
    return this.backgroundQueue.splice(0, this.backgroundQueue.length);
  }
}
