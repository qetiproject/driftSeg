import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INPUT_TYPES, MessageSeverity } from '@types';
import { MessagesService } from 'app/core/services';
import { SegmentService } from '../../services/segment.service';
import { createCustomerForm, createSegmentModel } from '../../utils/create-segment-modal';

@Component({
  selector: 'app-add-segment-modal',
  standalone: true,
  imports: [],
  templateUrl: './add-segment-modal.html',
  styleUrl: './add-segment-modal.css',
})
export class AddSegmentModal {
  readonly INPUT_TYPES = INPUT_TYPES;
  readonly #segmentService = inject(SegmentService);
  readonly #messages = inject(MessagesService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  readonly createSegmentModel = createSegmentModel;
  readonly segmentForm = createCustomerForm(this.createSegmentModel());

  onCloseModal(): void {
    this.#router.navigate([{ outlets: { modal: null } }], {
      relativeTo: this.#route.parent,
    });
  }

  onAddSegmentEvent(event: Event): void {
    event.preventDefault();
    const payload = this.segmentForm().value();
    this.#segmentService.createsegment(payload).subscribe({
      next: () => {
        this.#messages.showMessage({
          text: 'Segment created successfully.',
          severity: MessageSeverity.Success,
        });
        this.onCloseModal();
      },
    });
  }
}
