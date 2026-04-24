import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SegmentSearchIndexerService {
  private readonly logger = new Logger(SegmentSearchIndexerService.name);
  private readonly elasticsearchNode?: string;

  constructor(private readonly configService: ConfigService) {
    this.elasticsearchNode = this.configService.get<string>('ELASTICSEARCH_NODE');
  }

  async indexBatchRecomputeEvent(payload: {
    eventId: string;
    eventType: string;
    processedCustomers: number;
    customerMongoIds: string[];
    pendingCustomers: number;
    occurredAt: string;
  }): Promise<void> {
    if (!this.elasticsearchNode) {
      return;
    }

    try {
      await fetch(`${this.elasticsearchNode}/segment-membership-events/_doc`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.warn(`Failed to index batch event: ${String(error)}`);
    }
  }
}
