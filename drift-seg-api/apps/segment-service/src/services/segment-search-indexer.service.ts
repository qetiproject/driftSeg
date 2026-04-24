import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SegmentSearchIndexerService {
  private readonly logger = new Logger(SegmentSearchIndexerService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexBatchRecomputeEvent(payload: {
    eventId: string;
    eventType: string;
    processedCustomers: number;
    customerMongoIds: string[];
    pendingCustomers: number;
    occurredAt: string;
  }): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: 'segment-membership-events',
        document: payload,
      });
    } catch (error) {
      this.logger.warn(`Failed to index batch event: ${String(error)}`);
    }
  }
}
