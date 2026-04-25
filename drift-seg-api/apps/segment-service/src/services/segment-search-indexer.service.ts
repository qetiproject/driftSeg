import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  APPLICATION_JSON_CONTENT_TYPE,
  CONTENT_TYPE_HEADER_KEY,
  ELASTICSEARCH_NODE_ENV_KEY,
  FAILED_TO_INDEX_BATCH_EVENT_LOG,
  HTTP_POST_METHOD,
  SEGMENT_MEMBERSHIP_EVENTS_INDEX_PATH,
} from '../constants/constants';

@Injectable()
export class SegmentSearchIndexerService {
  private readonly logger = new Logger(SegmentSearchIndexerService.name);
  private readonly elasticsearchNode?: string;

  constructor(private readonly configService: ConfigService) {
    this.elasticsearchNode = this.configService.get<string>(
      ELASTICSEARCH_NODE_ENV_KEY,
    );
  }

  async indexBatchRecomputeEvent(payload: {
    eventId: string;
    eventType: string;
    processedCustomers: number;
    customerIds: string[];
    pendingCustomers: number;
    occurredAt: string;
  }): Promise<void> {
    if (!this.elasticsearchNode) {
      return;
    }

    try {
      await fetch(
        `${this.elasticsearchNode}${SEGMENT_MEMBERSHIP_EVENTS_INDEX_PATH}`,
        {
          method: HTTP_POST_METHOD,
          headers: { [CONTENT_TYPE_HEADER_KEY]: APPLICATION_JSON_CONTENT_TYPE },
          body: JSON.stringify(payload),
        },
      );
    } catch (error) {
      this.logger.warn(FAILED_TO_INDEX_BATCH_EVENT_LOG(String(error)));
    }
  }
}
