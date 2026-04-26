import { Directive, HostBinding, computed, inject } from '@angular/core';
import { MessagesService } from '../../core/services';
import { MessagePosition, MessageSeverity } from '../../types';

@Directive({
  selector: '[appMessageClass]',
  standalone: true,
})
export class MessageDirective {
  readonly #messagesService = inject(MessagesService);

  @HostBinding('class')
  get hostClass(): string {
    return this.classes();
  }

  readonly classes = computed(() => {
    const message = this.#messagesService.message();
    if (!message) return '';

    const position = message.position ?? MessagePosition.BottomRight;
    const severity = message.severity;

    const positionClassMap: Record<MessagePosition, string> = {
      [MessagePosition.TopRight]: 'fixed top-4 right-4',
      [MessagePosition.TopLeft]: 'fixed top-4 left-4',
      [MessagePosition.BottomRight]: 'fixed bottom-4 right-4',
      [MessagePosition.BottomLeft]: 'fixed bottom-4 left-4',
    };

    const severityClassMap: Record<MessageSeverity, string> = {
      [MessageSeverity.Success]: 'bg-emerald-600',
      [MessageSeverity.Error]: 'bg-red-600',
      [MessageSeverity.Warning]: 'bg-amber-500',
      [MessageSeverity.Info]: 'bg-sky-600',
    };

    return `z-[9999] ${positionClassMap[position]} ${severityClassMap[severity]}`;
  });
}
