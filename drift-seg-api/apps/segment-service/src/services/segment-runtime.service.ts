import { Injectable } from '@nestjs/common';

@Injectable()
export class SegmentRuntimeService {
  private nowOffsetMs = 0;

  now(): Date {
    return new Date(Date.now() + this.nowOffsetMs);
  }

  advanceByDays(days: number): Date {
    this.nowOffsetMs += days * 24 * 60 * 60 * 1000;
    return this.now();
  }
}
