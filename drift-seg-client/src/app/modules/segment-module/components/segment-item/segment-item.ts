import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MessageSeverity } from '@types';
import { MessagesService } from '../../../../core/services';
import { SegmentService } from '../../services/segment.service';
import { SegmentkindEnum, SegmentResponse, SegmentTypeEnum } from '../../types';

@Component({
  selector: 'app-segment-item',
  standalone: true,
  imports: [],
  templateUrl: './segment-item.html',
})
export class SegmentItem {
  segment = input.required<SegmentResponse>();
  readonly #segmentService = inject(SegmentService);
  readonly #messages = inject(MessagesService);
  readonly #router = inject(Router);
  protected readonly menuOpen = signal(false);
  protected readonly isDynamic = computed(() => this.segment().type === SegmentTypeEnum.Dynamic);
  protected readonly isRisk = computed(() => this.segment().rules.kind === SegmentkindEnum.RISK);
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

  protected toggleMenu(): void {
    this.menuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onViewMembers(): void {
    const { _id } = this.segment();
    this.#router.navigate(['/segments', _id, 'members']);
    this.closeMenu();
  }

  protected onViewDeltas(): void {
    const { _id } = this.segment();
    this.#router.navigate(['/segments', _id, 'deltas']);
    this.closeMenu();
  }

  protected onRiskRefresh(): void {
    if (!this.isRisk()) {
      this.#messages.showMessage({
        text: 'Risk segment refresh is available only for risk segments.',
        severity: MessageSeverity.Warning,
      });
      this.closeMenu();
      return;
    }

    const { _id, name } = this.segment();
    this.#segmentService.refreshSegment(_id).subscribe(() => {
      this.#messages.showMessage({
        text: `${name} refreshed successfully.`,
        severity: MessageSeverity.Success,
      });
    });
    this.closeMenu();
  }
}
