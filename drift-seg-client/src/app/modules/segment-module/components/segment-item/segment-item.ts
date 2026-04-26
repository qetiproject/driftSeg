import { Component, computed, input } from '@angular/core';
import { SegmentkindEnum, SegmentResponse, SegmentTypeEnum } from '../../types';

@Component({
  selector: 'app-segment-item',
  standalone: true,
  imports: [],
  templateUrl: './segment-item.html',
})
export class SegmentItem {
  segment = input.required<SegmentResponse>();
  protected readonly isDynamic = computed(() => this.segment().type === SegmentTypeEnum.Dynamic);
  protected readonly dependencyCount = computed(() => this.segment().dependsOnSegmentIds.length);
  protected readonly ruleDescription = computed(() => {
    const { rules } = this.segment();

    switch (rules.kind) {
      case SegmentkindEnum.ACTIVE_BUYERS:
        return `Had at least one transaction in last ${rules.days ?? '-'} days`;
      case SegmentkindEnum.VIP:
        return `Spent at least ${rules.minSpend ?? '-'} in last ${rules.days ?? '-'} days`;
      case SegmentkindEnum.RISK:
        return `No activity for ${rules.inActiveDays ?? '-'} days`;
      default:
        return 'Custom rule';
    }
  });
}
