import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessagesService } from '@core/services/messages.service';
import { MessageDirective } from '../../features/directives/message.directive';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [MessageDirective],
  templateUrl: './messages.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes slide-in {
      0% { transform: translateX(100%); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }

    @keyframes slide-out {
      0% { transform: translateX(0); opacity: 1; }
      100% { transform: translateX(100%); opacity: 0; }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out forwards;
    }

    .animate-slide-out {
      animation: slide-out 0.3s ease-in forwards;
    }
  `,
})
export class MessagesComponent {
  private readonly messageService = inject(MessagesService);
  readonly message = this.messageService.message;

  onClose(): void {
    this.messageService.clear();
  }
}
